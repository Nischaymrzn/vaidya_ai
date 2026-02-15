import "server-only";

import { TUser } from "./definition";
import { verifySession } from "./session";
import { getMe } from "./actions/auth-action";

export async function getCurrentUser(): Promise<TUser | null> {
  const session = await verifySession();
  if (!session) return null;

  try {
    const response = await getMe();
    if (!response?.success || !response?.data) {
      return null;
    }
    return response.data ?? null;
  } catch {
    console.log("Failed to fetch user");
    return null;
  }
}
