// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User.model'

export async function GET(req: NextRequest) {
  try {
    console.log('🔐 [VERIFY] Email verification attempt')

    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      console.warn('⚠️ [VERIFY] No token provided')
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    await connectDB()
    console.log('✅ [VERIFY] Database connected')

    // Hash the token to match what's in the database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    console.log('🔍 [VERIFY] Searching for token match...')

    // Find user with matching token and check if it's not expired
    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    })

    if (!user) {
      console.warn('⚠️ [VERIFY] Invalid or expired token')
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      )
    }

    console.log('✅ [VERIFY] Token found, marking email as verified')

    // Mark email as verified
    user.isEmailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpires = null
    await user.save()

    console.log('✅ [VERIFY] Email verified for:', user.email)

    // Redirect to login page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?verified=true`,
      { status: 302 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [VERIFY] Email verification error:', errorMessage)

    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}