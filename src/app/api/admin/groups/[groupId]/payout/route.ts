import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

    // Verify group and admin access
    const group = await db.savingsGroup.findUnique({
      where: { id: groupId }
    })

    if (!group || group.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Get request body to check if specific members selected
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // No body, proceed with all members
    }
    
    const memberIds = body?.memberIds || null

    // Get members to payout to
    const members = await db.groupMember.findMany({
      where: {
        groupId,
        ...(memberIds && { id: { in: memberIds } })
      },
      include: {
        user: true
      }
    })

    if (members.length === 0) {
      return NextResponse.json({ error: "No members selected" }, { status: 400 })
    }

    // Calculate total contributions per member
    const contributions = await db.transaction.groupBy({
      by: ["userId"],
      where: {
        groupId,
        type: "CONTRIBUTION"
      },
      _sum: {
        amount: true
      }
    })

    const totalPool = contributions.reduce((sum, c) => sum + (c._sum.amount || 0), 0)
    const payoutPerMember = members.length > 0 ? totalPool / members.length : 0

    // Create payout transactions
    const payouts: any[] = []
    for (const member of members) {
      const payout = await db.transaction.create({
        data: {
          groupId,
          userId: member.userId,
          amount: payoutPerMember,
          type: "PAYOUT",
          description: `Payout from ${group.name}`
        }
      })
      payouts.push(payout)
    }

    return NextResponse.json({
      success: true,
      totalPool,
      payoutPerMember,
      payouts
    })
  } catch (error) {
    console.error("Failed to execute payout:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
