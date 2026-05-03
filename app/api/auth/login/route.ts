import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { signToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    console.log("📝 [LOGIN] Registration attempt started")

    // Step 1: Connect to database
    console.log("🔗 [LOGIN] Connecting to database...")
    await connectDB()
    console.log("✅ [LOGIN] Database connected")

    // Step 2: Parse request body
    console.log("📦 [LOGIN] Parsing request body...")
    const { email, password } = await req.json()
    
    //FINDING THE USER
    console.log("📦 [LOGIN] finding the user")
    const user = await User.findOne({ email })
    console.log("📦 [LOGIN] user found")

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("📦 [LOGIN] checking the password")
    const valid = await bcrypt.compare(password, user.password)
    console.log("📦 [LOGIN] correct password")
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

     console.log("✅ Password verified for user:", user.email)
    
    const token = signToken(user._id.toString()) as string
   console.log("🔐 Token created:", token.substring(0, 50) + "...")

    const res = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        lifeExpectancy: user.lifeExpectancy,
      },
    }, { status: 200 })

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    console.log("🍪 Cookie set:", {
      tokenLength: token.length,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
  
     return res
  } catch (err) {
    console.error("❌ Login error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}