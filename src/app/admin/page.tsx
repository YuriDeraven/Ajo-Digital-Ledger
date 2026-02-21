"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, DollarSign, Send, LogOut, Trash2 } from "lucide-react"

interface Group {
  id: string
  name: string
  description?: string
  inviteCode: string
  _count: {
    members: number
    transactions: number
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "",
    contributionFrequency: "MONTHLY",
    contributionAmount: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
      return
    }
    // If session exists but user data is missing, sign out
    if (status === "authenticated" && !session?.user?.id) {
      signOut({ callbackUrl: "/" })
      return
    }
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups()
    }
  }, [session])

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/admin/groups")
      const data = await res.json()
      setGroups(data)
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete "${groupName}"? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/groups/${groupId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        fetchGroups()
      }
    } catch (error) {
      console.error("Failed to delete group:", error)
    }
  }

  const createGroup = async () => {
    if (!formData.name.trim()) return

    try {
      const res = await fetch("/api/admin/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setFormData({ name: "", description: "", contributionFrequency: "MONTHLY", contributionAmount: "" })
        setCreateGroupOpen(false)
        fetchGroups()
      }
    } catch (error) {
      console.error("Failed to create group:", error)
    }
  }

  if (status === "loading") return <div className="text-center py-12">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Welcome, {session?.user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Savings Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Group Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Textarea
                    placeholder="Group Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contribution Frequency</label>
                    <Select value={formData.contributionFrequency} onValueChange={(value) => setFormData({ ...formData, contributionFrequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Contribution Amount (per period)"
                    type="number"
                    value={formData.contributionAmount}
                    onChange={(e) => setFormData({ ...formData, contributionAmount: e.target.value })}
                  />
                  <Button onClick={createGroup} className="w-full">
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Groups</p>
                <p className="text-3xl font-bold">{groups.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Members</p>
                <p className="text-3xl font-bold">{groups.reduce((sum, g) => sum + g._count.members, 0)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Send className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Transactions</p>
                <p className="text-3xl font-bold">{groups.reduce((sum, g) => sum + g._count.transactions, 0)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Groups Table */}
        <Card className="bg-white overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Your Groups</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading groups...</div>
          ) : groups.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No groups yet. Create one to get started!</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200">
                  <TableHead>Group Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Invite Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow 
                    key={group.id} 
                    className="border-b border-slate-100 hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/groups/${group.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell className="cursor-pointer">
                      <div>
                        <p className="font-medium text-blue-600 hover:underline">{group.name}</p>
                        <p className="text-sm text-slate-500">{group.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="cursor-pointer">{group._count.members}</TableCell>
                    <TableCell className="cursor-pointer">{group._count.transactions}</TableCell>
                    <TableCell className="cursor-pointer">
                      <code className="bg-slate-100 px-2 py-1 rounded text-sm">{group.inviteCode}</code>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/admin/groups/${group.id}`)}
                      >
                        Manage
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteGroup(group.id, group.name)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  )
}
