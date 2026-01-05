import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
        },
        transactions: {
          select: {
            amount: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate balance for each group
    const groupsWithBalance = groups.map(group => {
      const balance = group.transactions.reduce((total, transaction) => {
        return transaction.type === 'CONTRIBUTION' 
          ? total + transaction.amount 
          : total - transaction.amount
      }, 0)

      return {
        ...group,
        balance,
        transactions: undefined // Remove transactions from response
      }
    })

    return NextResponse.json(groupsWithBalance)
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const group = await db.savingsGroup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        inviteCode,
        createdBy: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN"
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
      }
    })

    return NextResponse.json({
      ...group,
      balance: 0
    })
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}