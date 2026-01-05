import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const groupId = params.groupId

    // Verify user is a member of the group
    const membership = await db.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: groupId
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this group" }, { status: 403 })
    }

    // Fetch transactions for the group
    const transactions = await db.transaction.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const groupId = params.groupId
    const { amount, type, description } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    if (!type || !['CONTRIBUTION', 'PAYOUT'].includes(type)) {
      return NextResponse.json({ error: "Valid transaction type is required" }, { status: 400 })
    }

    // Verify user is a member of the group
    const membership = await db.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: groupId
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this group" }, { status: 403 })
    }

    // For payouts, check if there are sufficient funds
    if (type === 'PAYOUT') {
      const groupTransactions = await db.transaction.findMany({
        where: { groupId }
      })

      const currentBalance = groupTransactions.reduce((total, transaction) => {
        return transaction.type === 'CONTRIBUTION' 
          ? total + transaction.amount 
          : total - transaction.amount
      }, 0)

      if (amount > currentBalance) {
        return NextResponse.json({ error: "Insufficient funds for payout" }, { status: 400 })
      }
    }

    // Create the transaction
    const transaction = await db.transaction.create({
      data: {
        groupId,
        userId: session.user.id,
        amount: parseFloat(amount),
        type,
        description: description?.trim() || null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}