"use server";

import { cookies } from "next/headers";

export async function createSession(token: string) {
  const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();

  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    return null;
  }

  return { token };
}

export async function updateSession() {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) return null;

  const expires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
}
