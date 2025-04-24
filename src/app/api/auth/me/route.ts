import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user from database
    const [rows] = await db.execute("SELECT id, username, email, role, is_verified FROM users WHERE id = ?", [userId])

    const users = rows as any[]
    if (users.length === 0) {
      cookies().delete("user_id")
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Authentication check failed" }, { status: 500 })
  }
}
