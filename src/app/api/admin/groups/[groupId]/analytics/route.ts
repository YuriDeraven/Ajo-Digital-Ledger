import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId } = await params

    // Verify admin owns this group
    const group = await db.savingsGroup.findUnique({
      where: { id: groupId }
    })

    if (!group || group.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Get all transactions for the group
    const transactions = await db.transaction.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            id: true
          }
        }
      }
    })

    // Calculate analytics
    const totalContributions = transactions
      .filter(t => t.type === 'CONTRIBUTION')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalPayouts = transactions
      .filter(t => t.type === 'PAYOUT')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalContributions - totalPayouts

    // Group by member
    const memberStats = new Map<string, {
      name: string
      email: string
      contributions: number
      payouts: number
      balance: number
      transactionCount: number
    }>()

    transactions.forEach(transaction => {
      const memberId = transaction.user.id
      if (!memberStats.has(memberId)) {
        memberStats.set(memberId, {
          name: transaction.user.name || 'Unknown',
          email: transaction.user.email,
          contributions: 0,
          payouts: 0,
          balance: 0,
          transactionCount: 0
        })
      }

      const stats = memberStats.get(memberId)!
      if (transaction.type === 'CONTRIBUTION') {
        stats.contributions += transaction.amount
      } else {
        stats.payouts += transaction.amount
      }
      stats.balance = stats.contributions - stats.payouts
      stats.transactionCount += 1
    })

    return NextResponse.json({
      groupId,
      totalContributions,
      totalPayouts,
      balance,
      totalMembers: memberStats.size,
      totalTransactions: transactions.length,
      memberStats: Array.from(memberStats.entries()).map(([, stats]) => stats)
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
