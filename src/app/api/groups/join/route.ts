import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { inviteCode } = await request.json()

    if (!inviteCode?.trim()) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    // Find group by invite code
    const group = await db.savingsGroup.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() }
    })

    if (!group) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })
    }

    // Check if user is already a member
    const existingMember = await db.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: group.id
        }
      }
    })

    if (existingMember) {
      return NextResponse.json({ error: "Already a member of this group" }, { status: 400 })
    }

    // Add user to group
    await db.groupMember.create({
      data: {
        userId: session.user.id,
        groupId: group.id,
        role: "MEMBER"
      }
    })

    // Return group with counts and balance
    const groupWithDetails = await db.savingsGroup.findUnique({
      where: { id: group.id },
      include: {
        _count: {
          select: {
            members: true,
            transactions: true
          }
        },
        transactions: {
          select: {
            amount: true,
            type: true
          }
        }
      }
    })

    if (!groupWithDetails) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const balance = groupWithDetails.transactions.reduce((total, transaction) => {
      return transaction.type === 'CONTRIBUTION' 
        ? total + transaction.amount 
        : total - transaction.amount
    }, 0)

    return NextResponse.json({
      ...groupWithDetails,
      balance,
      transactions: undefined
    })
  } catch (error) {
    console.error("Error joining group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}