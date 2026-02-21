import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { groupId } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify group and access
    const group = await db.savingsGroup.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Check access
    if (session.user.role === "ADMIN" && group.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (session.user.role === "MEMBER") {
      const isMember = await db.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId
          }
        }
      })
      if (!isMember) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const transactions = await db.transaction.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { groupId } = await params
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { memberId, amount, type, description, contributionPeriod } = await req.json()

    if (!memberId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify group and admin access
    const group = await db.savingsGroup.findUnique({
      where: { id: groupId }
    })

    if (!group || group.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Get member's user ID
    const member = await db.groupMember.findUnique({
      where: { id: memberId }
    })

    if (!member || member.groupId !== groupId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        groupId,
        userId: member.userId,
        amount: parseFloat(amount),
        type: type || "CONTRIBUTION",
        description: description || null,
        contributionPeriod: contributionPeriod || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Failed to record transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
