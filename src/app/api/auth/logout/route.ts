import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Clear the session cookie
  cookies().delete("user_id")

  return NextResponse.json({ success: true })
}
