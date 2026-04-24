import jwt from "jsonwebtoken"

// Read SECRET once at module load time
const SECRET = process.env.JWT_SECRET!

if (!SECRET) {
  throw new Error("❌ JWT_SECRET environment variable is not set!")
}

//console.log("📌 JWT module loaded - SECRET length:", SECRET.length)

export function signToken(userId: string) {
 // console.log("🔐 Signing token with userId:", userId)
  const token = jwt.sign({ userId }, SECRET, { expiresIn: "7d" })
 // console.log("✅ Token signed successfully")
  return token
}

export function verifyToken(token: string): { userId: string } | null {
  try {
   // console.log("🔓 Attempting to verify token...")
    const decoded = jwt.verify(token, SECRET) as { userId: string }
   // console.log("✅ Token verified - userId:", decoded.userId)
    return decoded
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error("❌ Token verification failed:", errorMsg)
    console.error("📊 Debug info:", {
      secretLength: SECRET.length,
      tokenLength: token.length,
      errorType: err instanceof jwt.TokenExpiredError ? "EXPIRED" : 
                 err instanceof jwt.JsonWebTokenError ? "INVALID" : "OTHER"
    })
    return null
  }
}