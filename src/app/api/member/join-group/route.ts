import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { inviteCode } = await req.json()

    if (!inviteCode?.trim()) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    // Find group by invite code
    const group = await db.savingsGroup.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() }
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
      return NextResponse.json({ error: "You're already a member of this group" }, { status: 400 })
    }

    // Add user to group
    const member = await db.groupMember.create({
      data: {
        userId: session.user.id,
        groupId: group.id,
        role: "MEMBER"
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Successfully joined ${group.name}`,
      group 
    })
  } catch (error) {
    console.error("Failed to join group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
