import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { signToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed })

    const token = signToken(user._id.toString())

    const res = NextResponse.json({ success: true }, { status: 201 })
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return res
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}