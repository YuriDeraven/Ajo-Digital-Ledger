"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, Mail } from "lucide-react"

interface Member {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
  }
  role: string
  joinedAt: string
}

interface MemberListProps {
  groupId: string
}

export function MemberList({ groupId }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/groups/${groupId}/members`)
        if (!res.ok) throw new Error("Failed to fetch members")
        const data = await res.json()
        setMembers(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Failed to fetch members:", err)
      } finally {
        setLoading(false)
      }
    }

    if (groupId) {
      fetchMembers()
    }
  }, [groupId])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Group Members</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <p className="text-red-800">Failed to load members: {error}</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">
          Group Members ({members.length})
        </h3>
      </div>

      {members.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No members yet</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{member.user.name}</p>
                <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                  <Mail className="w-3 h-3" />
                  {member.user.email}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  member.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {member.role}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
