import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/register"];
const protectedPaths = ["/dashboard"];
const adminPaths = ["/admin"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("access_token")?.value;

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
