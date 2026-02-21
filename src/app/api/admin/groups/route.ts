import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const groups = await db.savingsGroup.findMany({
      where: { createdBy: session.user.id },
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, contributionFrequency, contributionAmount } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const group = await db.savingsGroup.create({
      data: {
        name,
        description: description || null,
        inviteCode,
        createdBy: session.user.id,
        contributionFrequency: contributionFrequency || "MONTHLY",
        contributionAmount: contributionAmount ? parseFloat(contributionAmount) : null
      }
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error("Failed to create group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
