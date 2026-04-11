import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { signToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, password } = await req.json()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = signToken(user._id.toString())

    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email }
    })
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return res
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}