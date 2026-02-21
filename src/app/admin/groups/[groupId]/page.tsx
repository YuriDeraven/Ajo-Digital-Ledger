"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, Edit2 } from "lucide-react"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { PaymentProofUpload } from "@/components/admin/payment-proof-upload"

interface GroupMember {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    phone?: string | null
  }
  role: string
}

interface Transaction {
  id: string
  userId: string
  amount: number
  type: string
  user: { name: string }
  createdAt: string
}

export default function AdminGroupPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const groupId = params.groupId as string

  const [members, setMembers] = useState<GroupMember[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberName, setMemberName] = useState("")
  const [memberPhone, setMemberPhone] = useState("")
  const [memberAmount, setMemberAmount] = useState("")
  const [contributionPeriod, setContributionPeriod] = useState("")
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  const [editGroupOpen, setEditGroupOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)
  const [selectedMembersForPayout, setSelectedMembersForPayout] = useState<Set<string>>(new Set())
  const [isPayoutLoading, setIsPayoutLoading] = useState(false)
  const [calculatedPayoutAmount, setCalculatedPayoutAmount] = useState(0)

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
    if (groupId) {
      fetchGroupData()
    }
  }, [groupId, session, router])

  const fetchGroupData = async () => {
    try {
      const [groupRes, membersRes, transRes] = await Promise.all([
        fetch(`/api/admin/groups/${groupId}`),
        fetch(`/api/admin/groups/${groupId}/members`),
        fetch(`/api/admin/groups/${groupId}/transactions`)
      ])

      if (groupRes.ok) {
        const group = await groupRes.json()
        setGroupName(group.name)
        setGroupDescription(group.description || "")
        setEditName(group.name)
        setEditDescription(group.description || "")
      }
      if (membersRes.ok) {
        setMembers(await membersRes.json())
      }
      if (transRes.ok) {
        setTransactions(await transRes.json())
      }
    } catch (error) {
      console.error("Failed to fetch group data:", error)
    } finally {
      setLoading(false)
    }
  }

  const addMember = async () => {
    if (!memberEmail.trim()) return

    try {
      const res = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: memberEmail,
          name: memberName,
          phone: memberPhone 
        })
      })

      if (res.ok) {
        setMemberEmail("")
        setMemberName("")
        setMemberPhone("")
        setAddMemberOpen(false)
        fetchGroupData()
      }
    } catch (error) {
      console.error("Failed to add member:", error)
    }
  }

  const recordPayment = async (memberId: string) => {
    if (!memberAmount.trim()) return

    try {
      setIsRecordingPayment(true)
      const res = await fetch(`/api/admin/groups/${groupId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          amount: parseFloat(memberAmount),
          type: "CONTRIBUTION",
          contributionPeriod: contributionPeriod || null
        })
      })

      if (res.ok) {
        setMemberAmount("")
        setContributionPeriod("")
        setSelectedMemberId("")
        setRecordPaymentOpen(false)
        fetchGroupData()
      }
    } catch (error) {
      console.error("Failed to record payment:", error)
    } finally {
      setIsRecordingPayment(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm("Remove this member from the group?")) return

    try {
      const res = await fetch(`/api/admin/groups/${groupId}/members/${memberId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        fetchGroupData()
      }
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  const runPayout = async () => {
    if (!confirm("Execute payout to all members? This cannot be undone.")) return

    try {
      const res = await fetch(`/api/admin/groups/${groupId}/payout`, {
        method: "POST"
      })

      if (res.ok) {
        fetchGroupData()
      }
    } catch (error) {
      console.error("Failed to execute payout:", error)
    }
  }

  const executePayout = async () => {
    if (selectedMembersForPayout.size === 0) return

    try {
      setIsPayoutLoading(true)
      const selectedMemberIds = Array.from(selectedMembersForPayout)
      
      const res = await fetch(`/api/admin/groups/${groupId}/payout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: selectedMemberIds })
      })

      if (res.ok) {
        setPayoutDialogOpen(false)
        setSelectedMembersForPayout(new Set())
        fetchGroupData()
      }
    } catch (error) {
      console.error("Failed to execute payout:", error)
    } finally {
      setIsPayoutLoading(false)
    }
  }

  const saveGroupEdit = async () => {
    if (!editName.trim()) return

    try {
      setIsSaving(true)
      const res = await fetch(`/api/admin/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription
        })
      })

      if (res.ok) {
        setEditGroupOpen(false)
        fetchGroupData()
      }
    } catch (error) {
      console.error("Failed to update group:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">{groupName}</h1>
          <div className="flex gap-2">
            <Dialog open={editGroupOpen} onOpenChange={setEditGroupOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Group Name</label>
                    <Input
                      placeholder="Group Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Description</label>
                    <Input
                      placeholder="Group Description (optional)"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <Button onClick={saveGroupEdit} className="w-full" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  Run Payout
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Run Payout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm text-slate-600">
                    Select members to receive payout from the group balance
                  </div>
                  {selectedMembersForPayout.size > 0 && calculatedPayoutAmount > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm font-medium text-blue-900">Payout Amount per Member</p>
                      <p className="text-2xl font-bold text-blue-600">₦{calculatedPayoutAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-blue-700 mt-1">For {selectedMembersForPayout.size} selected member(s)</p>
                    </div>
                  )}
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {members.map((member) => {
                      const handleToggle = (checked: boolean) => {
                        const newSelected = new Set(selectedMembersForPayout)
                        if (checked) {
                          newSelected.add(member.id)
                        } else {
                          newSelected.delete(member.id)
                        }
                        setSelectedMembersForPayout(newSelected)
                        
                        // Calculate total pool and payout amount
                        const totalPool = transactions
                          .filter(t => t.type === 'CONTRIBUTION')
                          .reduce((sum, t) => sum + t.amount, 0)
                        const payoutAmount = newSelected.size > 0 ? totalPool / newSelected.size : 0
                        setCalculatedPayoutAmount(payoutAmount)
                      }
                      
                      return (
                        <label key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMembersForPayout.has(member.id)}
                            onChange={(e) => handleToggle(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-medium text-sm">{member.user.name}</p>
                            <p className="text-xs text-slate-500">{member.user.email}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                  <Button 
                    onClick={executePayout} 
                    className="w-full" 
                    disabled={selectedMembersForPayout.size === 0 || isPayoutLoading}
                  >
                    {isPayoutLoading ? "Processing..." : "Execute Payout"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Member to Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Member Name"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                  />
                  <Input
                    placeholder="Member Email"
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Phone Number (optional)"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                  />
                  <Button onClick={addMember} className="w-full">
                    Add Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Record Payment Dialog */}
            <Dialog open={recordPaymentOpen} onOpenChange={setRecordPaymentOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount</label>
                    <Input
                      type="number"
                      placeholder="Payment amount"
                      value={memberAmount}
                      onChange={(e) => setMemberAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contribution Period</label>
                    <Input
                      type="month"
                      value={contributionPeriod}
                      onChange={(e) => setContributionPeriod(e.target.value)}
                    />
                  </div>
                  <PaymentProofUpload groupId={groupId} memberId={selectedMemberId || ""} />
                  <Button 
                    onClick={() => recordPayment(selectedMemberId || "")} 
                    className="w-full"
                  >
                    Record Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard groupId={groupId} />

        {/* Members Section */}
        <Card className="bg-white mb-8 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Group Members</h2>
          </div>
          {members.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No members yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <TableCell className="font-medium">{member.user.name}</TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell>{member.user.phone || '-'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMemberId(member.id)
                          setMemberAmount("")
                          setRecordPaymentOpen(true)
                        }}
                      >
                        Record Payment
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMember(member.id)}
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

        {/* Transactions Section */}
        <Card className="bg-white overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Transactions</h2>
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
                      <span className={`px-2 py-1 rounded text-sm ${
                        trans.type === "CONTRIBUTION" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {trans.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">₦{trans.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(trans.createdAt).toLocaleDateString()}</TableCell>
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
