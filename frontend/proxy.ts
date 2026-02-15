import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/register"];
const protectedPaths = ["/dashboard", "/user", "/profile"];
const adminPaths = ["/admin"];

interface DecodedToken {
  role?: string;
  exp?: number;
}

function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

function isTokenExpired(decoded: DecodedToken): boolean {
  if (!decoded.exp) return true;
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
}

function createRedirectWithClearedToken(url: string, req: NextRequest) {
  const response = NextResponse.redirect(new URL(url, req.url));
  response.cookies.set("access_token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;

  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
  const isProtectedPath = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));

  // Not authenticated - redirect to login
  if (!token && (isProtectedPath || isAdminPath)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Has token - verify it's valid and not expired
  if (token && (isProtectedPath || isAdminPath || isPublicPath)) {
    const decoded = decodeJWT(token);

    // Invalid or expired token - clear and redirect to login
    if (!decoded || isTokenExpired(decoded)) {
      return createRedirectWithClearedToken("/login", req);
    }

    // Admin routes - only admin role allowed
    if (isAdminPath) {
      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Admin cannot access user pages (dashboard, /user) - redirect to admin
    if (decoded.role === "admin" && isProtectedPath) {
      return NextResponse.redirect(new URL("/admin/users", req.url));
    }

    // Public paths are always accessible; avoid redirect loops if token is stale
    if (isPublicPath) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/user/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
