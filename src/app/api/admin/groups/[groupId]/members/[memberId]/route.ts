import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { groupId, memberId } = await params
    
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

    // Delete member
    await db.groupMember.delete({
      where: { id: memberId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
