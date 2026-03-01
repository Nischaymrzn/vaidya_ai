import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const token = (await cookies()).get("access_token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      )
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/v1/api"
    const response = await fetch(`${baseUrl}/ai-chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to process request" },
      { status: 500 },
    )
  }
}
