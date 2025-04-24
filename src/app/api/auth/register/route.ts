import { NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/data"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create user
    // In a real application, you would hash the password before storing it
    const userId = await createUser({
      username,
      email,
      password, // Should be hashed in production
      role: "USER",
      is_verified: false,
    })

    // Set session cookie
    cookies().set("user_id", userId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return NextResponse.json({
      id: userId,
      username,
      email,
      role: "USER",
      is_verified: false,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
