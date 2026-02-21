"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Users, TrendingUp, Plus, LogOut } from "lucide-react"
import { MemberList } from "@/components/member/member-list"

interface Group {
  id: string
  name: string
  description?: string
  _count: {
    members: number
    transactions: number
  }
}

interface Transaction {
  id: string
  amount: number
  type: string
  description?: string
  createdAt: string
  user: { name: string }
}

export default function MemberDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [inviteCode, setInviteCode] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
    if (session?.user?.role === "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups()
    }
  }, [session])

  useEffect(() => {
    if (selectedGroup) {
      fetchTransactions(selectedGroup)
    }
  }, [selectedGroup])

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/member/groups")
      const data = await res.json()
      setGroups(data)
      if (data.length > 0) {
        setSelectedGroup(data[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/transactions`)
      const data = await res.json()
      setTransactions(data)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    }
  }

  const joinGroup = async () => {
    if (!inviteCode.trim()) return

    try {
      const res = await fetch("/api/member/join-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode })
      })

      if (res.ok) {
        setInviteCode("")
        setShowJoinDialog(false)
        fetchGroups()
      }
    } catch (error) {
      console.error("Failed to join group:", error)
    }
  }

  if (status === "loading") return <div className="text-center py-12">Loading...</div>

  const currentGroup = groups.find(g => g.id === selectedGroup)
  const contributions = transactions.filter(t => t.type === "CONTRIBUTION")
  const payouts = transactions.filter(t => t.type === "PAYOUT")
  const totalContributed = contributions.reduce((sum, t) => sum + t.amount, 0)
  const totalReceived = payouts.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logout */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Member Dashboard</h1>
            <p className="text-slate-600 mt-2">Welcome, {session?.user?.name}</p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Groups Selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Your Groups</h2>
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Join Another Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Another Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Invite Code
                    </label>
                    <Input
                      placeholder="e.g., ABC123"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={joinGroup} className="w-full">
                    Join Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card
                key={group.id}
                className={`p-6 cursor-pointer transition-all ${
                  selectedGroup === group.id
                    ? "bg-blue-50 border-blue-300 border-2"
                    : "bg-white hover:border-blue-200"
                }`}
                onClick={() => setSelectedGroup(group.id)}
              >
                <h3 className="font-semibold text-lg text-slate-900">{group.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{group.description}</p>
                <div className="flex gap-4 mt-4 text-sm text-slate-600">
                  <span>{group._count.members} members</span>
                  <span>{group._count.transactions} transactions</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {currentGroup && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Contributed</p>
                    <p className="text-3xl font-bold">${totalContributed.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Received (Payout)</p>
                    <p className="text-3xl font-bold">${totalReceived.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Group Members</p>
                    <p className="text-3xl font-bold">{currentGroup._count.members}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Members and Transactions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-1">
                <MemberList groupId={selectedGroup} />
              </div>
              <div className="lg:col-span-2">
                <Card className="bg-white overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">{currentGroup.name} - Transactions</h2>
                  </div>
                  {transactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No transactions yet</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-200">
                          <TableHead>Member</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((trans) => (
                          <TableRow key={trans.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <TableCell className="font-medium">{trans.user.name}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                trans.type === "CONTRIBUTION"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                                {trans.type}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-lg">${trans.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-slate-600">
                              {new Date(trans.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}

        {groups.length === 0 && !loading && (
          <Card className="p-12 text-center bg-white">
            <p className="text-slate-600">You are not part of any groups yet.</p>
            <p className="text-slate-500 text-sm mt-2">Ask an admin to add you to a group.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
