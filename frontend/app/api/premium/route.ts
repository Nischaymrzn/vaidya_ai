import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/v1/api"

async function getAccessToken() {
  return (await cookies()).get("access_token")?.value
}

export async function GET() {
  try {
    const token = await getAccessToken()
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      )
    }

    const response = await fetch(`${BASE_URL}/payments/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch premium status" },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const token = await getAccessToken()
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      )
    }

    const response = await fetch(`${BASE_URL}/payments/checkout-session`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create Stripe checkout session" },
      { status: 500 },
    )
  }
}
