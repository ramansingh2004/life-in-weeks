import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🔓 [LOGOUT] Logout initiated")

    // ✅ CLEAR AUTH COOKIE
    const res = NextResponse.json(
      {
        success: true,
        data: {
          message: 'Logged out successfully'
        },
        message: 'Logout successful'
      },
      { status: 200 }
    )

    // Clear the token cookie
    res.cookies.set("token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    })

    console.log("✅ [LOGOUT] Cookie cleared, logout complete")
    return res
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : "No stack"

    console.error("❌ [LOGOUT] Logout failed:")
    console.error("   Error:", errorMessage)
    console.error("   Stack:", errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Server error',
          code: 'SERVER_ERROR',
          ...(process.env.NODE_ENV !== "production" && {
            details: {
              message: errorMessage,
              stack: errorStack
            }
          })
        }
      },
      { status: 500 }
    )
  }
}