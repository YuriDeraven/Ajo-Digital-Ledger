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
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const group = await db.savingsGroup.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            members: true,
            transactions: true
          }
        }
      }
    })

    if (!group || group.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error("Failed to fetch group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { groupId } = await params
    const { name, description } = await req.json()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    const group = await db.savingsGroup.findUnique({
      where: { id: groupId }
    })

    if (!group || group.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updatedGroup = await db.savingsGroup.update({
      where: { id: groupId },
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    return NextResponse.json(updatedGroup)
  } catch (error) {
    console.error("Failed to update group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { groupId } = await params

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const group = await db.savingsGroup.findUnique({
      where: { id: groupId }
    })

    if (!group || group.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Delete all related data
    await db.transaction.deleteMany({
      where: { groupId }
    })

    await db.groupMember.deleteMany({
      where: { groupId }
    })

    await db.savingsGroup.delete({
      where: { id: groupId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
