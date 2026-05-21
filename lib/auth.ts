// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email/Password Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectDB()

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing email or password")
          }

          const user = await User.findOne({ email: credentials.email.toLowerCase() })

          if (!user) {
            throw new Error("User not found")
          }

          // Check if email is verified
          if (!user.isEmailVerified) {
            throw new Error("Email not verified. Please check your inbox for the verification link.")
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password || "")

          if (!isPasswordValid) {
            throw new Error("Invalid password")
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("❌ Credentials authorization error:", error)
          throw error
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB()

        if (account?.provider === "google") {
          // Handle Google OAuth sign in
          let existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            // Create new user from Google OAuth
            existingUser = await User.create({
              name: user.name || "User",
              email: user.email,
              password: null, // OAuth users don't have passwords
              isEmailVerified: true, // Google users are auto-verified
              googleId: account?.providerAccountId,
              image: user.image,
            })
            console.log("✅ New user created from Google OAuth:", user.email)
          } else if (!existingUser.googleId) {
            // Link Google account to existing user
            existingUser.googleId = account?.providerAccountId
            existingUser.isEmailVerified = true
            await existingUser.save()
            console.log("✅ Google account linked to existing user:", user.email)
          }
        }

        return true
      } catch (error) {
        console.error("❌ Sign in error:", error)
        return false
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as {
          id?: string
          name?: string | null
          email?: string | null
          image?: string | null
        }
        sessionUser.id = token.id as string
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Redirect to /grid after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/grid`
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
}