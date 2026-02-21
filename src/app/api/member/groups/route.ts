import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all groups where user is a member
    const groups = await db.savingsGroup.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        _count: {
          select: {
            members: true,
            transactions: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error("Failed to fetch groups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
