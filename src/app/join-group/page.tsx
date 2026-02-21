"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, LogOut } from "lucide-react"
import { useToast } from "@/components/ui/enhanced-toast"

interface Group {
  id: string
  name: string
  description?: string
  _count: {
    members: number
    transactions: number
  }
}

export default function JoinGroupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  
  const [myGroups, setMyGroups] = useState<Group[]>([])
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [joinLoading, setJoinLoading] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)

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
    if (session?.user?.role === "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyGroups()
    }
  }, [session])

  const fetchMyGroups = async () => {
    try {
      const res = await fetch("/api/member/groups")
      const data = await res.json()
      setMyGroups(data)
      // If user already has groups, redirect to dashboard
      if (data.length > 0) {
        router.push("/dashboard")
      } else {
        // No groups yet, show invite code dialog
        setShowJoinDialog(true)
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const joinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.warning("Code Required", "Please enter an invite code")
      return
    }

    try {
      setJoinLoading(true)
      const res = await fetch("/api/member/join-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode })
      })

      if (res.ok) {
        toast.success("Success", "You've joined the group!")
        setInviteCode("")
        setShowJoinDialog(false)
        fetchMyGroups()
      } else {
        const error = await res.json()
        toast.error("Failed", error.error || "Invalid invite code")
      }
    } catch (error) {
      console.error("Failed to join group:", error)
      toast.error("Error", "Failed to join group")
    } finally {
      setJoinLoading(false)
    }
  }

  if (status === "loading") return <div className="text-center py-12">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with Logout */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Join a Group</h1>
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

        {/* Join Group Card */}
        <Card className="p-8 bg-white mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              You haven't joined any groups yet
            </h2>
            <p className="text-slate-600 mb-6">
              Ask your admin for an invite code to join a savings group.
            </p>
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => setShowJoinDialog(true)}
              >
                <Plus className="w-5 h-5" />
                Enter Invite Code
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Savings Group</DialogTitle>
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
                      autoFocus
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Enter the 6-character code provided by your admin
                    </p>
                  </div>
                  <Button 
                    onClick={joinGroup} 
                    className="w-full"
                    disabled={joinLoading || !inviteCode.trim()}
                  >
                    {joinLoading ? "Joining..." : "Join Group"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Help Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Ask your admin for a group invite code</li>
            <li>✓ Enter the code above to join the group</li>
            <li>✓ Once joined, you'll see all group transactions and payments</li>
            <li>✓ You can join multiple groups with different codes</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
