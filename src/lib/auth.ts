import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        try {
          // For demo purposes, we'll create/get user without password verification
          // In production, you'd want proper password hashing and verification
          let user = await db.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            // Create new user if doesn't exist
            user = await db.user.create({
              data: {
                email: credentials.email,
                name: credentials.name || credentials.email.split('@')[0]
              }
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/"
  },
  debug: process.env.NODE_ENV === "development"
}