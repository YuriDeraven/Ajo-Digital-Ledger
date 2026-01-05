import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session debug:', session)
    
    return NextResponse.json({
      session: session,
      headers: {
        'content-type': 'application/json'
      }
    })
  } catch (error) {
    console.error("Session debug error:", error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}