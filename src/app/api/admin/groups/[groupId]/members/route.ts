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

    // Verify group exists and user has access
    const group = await db.savingsGroup.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Check if user is admin or member
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

    const members = await db.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Failed to fetch members:", error)
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

    const { email, name, phone } = await req.json()

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Verify group and admin access
    const group = await db.savingsGroup.findUnique({
      where: { id: groupId }
    })

    if (!group || group.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          phone: phone || null,
          role: "MEMBER"
        }
      })
    } else if (name || phone) {
      // Update existing user with name/phone if provided
      user = await db.user.update({
        where: { email },
        data: {
          ...(name && { name }),
          ...(phone && { phone })
        }
      })
    }

    // Add member to group
    const member = await db.groupMember.create({
      data: {
        userId: user.id,
        groupId,
        role: "MEMBER"
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

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Failed to add member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
