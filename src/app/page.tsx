"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  PlusCircle, 
  Users, 
  TrendingUp, 
  Calendar, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Sparkles,
  DollarSign,
  PiggyBank,
  Gift,
  Target,
  Zap
} from "lucide-react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { FloatingElement, PulseGlow } from "@/components/ui/floating-elements"
import { GradientBackground, GlassPanel } from "@/components/ui/gradient-background"
import { LoadingSkeleton, StaggeredChildren, SlideIn } from "@/components/ui/loading-animations"
import { AnimatedTransaction } from "@/components/ui/animated-transaction"
import { AnimatedGroupCard } from "@/components/ui/animated-group-card"
import { ParticleEffects, Confetti } from "@/components/ui/particle-effects"
import { useToast } from "@/components/ui/enhanced-toast"

interface User {
  id: string
  email: string
  name?: string
}

interface SavingsGroup {
  id: string
  name: string
  description?: string
  inviteCode: string
  createdBy: string
  createdAt: string
  _count: {
    members: number
    transactions: number
  }
  balance: number
}

interface Transaction {
  id: string
  amount: number
  type: "CONTRIBUTION" | "PAYOUT"
  description?: string
  createdAt: string
  user: {
    name?: string
    email: string
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [groups, setGroups] = useState<SavingsGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<SavingsGroup | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [particleType, setParticleType] = useState<'success' | 'error' | 'celebration'>('success')
  
  // Form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('demo@ajo.com') // Pre-filled for demo
  const [name, setName] = useState('Demo User') // Pre-filled for demo
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionType, setTransactionType] = useState<'CONTRIBUTION' | 'PAYOUT'>('CONTRIBUTION')
  const [transactionDescription, setTransactionDescription] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false)
    } else if (status === 'authenticated' && session?.user) {
      // Check user role and redirect accordingly
      if (session.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        // Members go to join-group page to enter invite code
        router.push('/join-group')
      }
    }
  }, [status, session, router])

  const fetchUserData = async () => {
    try {
      const groupsRes = await fetch('/api/groups')
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json()
        setGroups(groupsData)
        if (groupsData.length > 0) {
          setSelectedGroup(groupsData[0])
          fetchTransactions(groupsData[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Error', 'Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/transactions`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.warning('Email Required', 'Please enter your email address')
      return
    }
    
    setAuthLoading(true)
    try {
      console.log('Attempting authentication with:', { email, name: authMode === 'signup' ? name : undefined })
      
      const result = await signIn('credentials', {
        email,
        name: authMode === 'signup' ? name : undefined,
        redirect: false,
      })
      
      console.log('Auth result:', result)
      
      if (result?.ok) {
        setParticleType('success')
        setShowParticles(true)
        toast.success(
          authMode === 'signup' ? 'Account Created!' : 'Welcome Back!',
          `Successfully ${authMode === 'signup' ? 'created account' : 'signed in'}`
        )
        // Let the useEffect handle the redirect based on role
        // Don't reload, just wait for session to update
      } else {
        console.error('Auth failed:', result?.error)
        setParticleType('error')
        setShowParticles(true)
        toast.error('Authentication Failed', result?.error || 'Please try again')
      }
    } catch (error) {
      console.error('Auth error:', error)
      setParticleType('error')
      setShowParticles(true)
      toast.error('Authentication Error', error?.message || 'An unexpected error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.warning('Group Name Required', 'Please enter a name for your group')
      return
    }
    
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, description: groupDescription })
      })
      
      if (res.ok) {
        const newGroup = await res.json()
        setGroups([...groups, newGroup])
        setSelectedGroup(newGroup)
        setGroupName('')
        setGroupDescription('')
        fetchTransactions(newGroup.id)
        setShowConfetti(true)
        toast.success('Group Created!', `"${newGroup.name}" has been created successfully`)
      } else {
        const errorData = await res.json().catch(() => ({}))
        setParticleType('error')
        setShowParticles(true)
        toast.error('Creation Failed', errorData.error || 'Could not create group. Please try again.')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      setParticleType('error')
      setShowParticles(true)
      toast.error('Network Error', 'Failed to connect to server')
    }
  }

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.warning('Invite Code Required', 'Please enter an invite code')
      return
    }
    
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      })
      
      if (res.ok) {
        const joinedGroup = await res.json()
        setGroups([...groups, joinedGroup])
        setSelectedGroup(joinedGroup)
        setInviteCode('')
        fetchTransactions(joinedGroup.id)
        setShowConfetti(true)
        toast.success('Group Joined!', `Successfully joined "${joinedGroup.name}"`)
      } else {
        const errorData = await res.json().catch(() => ({}))
        setParticleType('error')
        setShowParticles(true)
        toast.error('Join Failed', errorData.error || 'Invalid invite code')
      }
    } catch (error) {
      console.error('Error joining group:', error)
      setParticleType('error')
      setShowParticles(true)
      toast.error('Network Error', 'Failed to connect to server')
    }
  }

  const handleAddTransaction = async () => {
    if (!selectedGroup) {
      toast.warning('No Group Selected', 'Please select a group first')
      return
    }
    
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
      toast.warning('Invalid Amount', 'Please enter a valid amount')
      return
    }
    
    try {
      const res = await fetch(`/api/groups/${selectedGroup.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(transactionAmount),
          type: transactionType,
          description: transactionDescription
        })
      })
      
      if (res.ok) {
        setTransactionAmount('')
        setTransactionDescription('')
        fetchTransactions(selectedGroup.id)
        fetchUserData()
        setParticleType('success')
        setShowParticles(true)
        toast.success(
          'Transaction Added!',
          `${transactionType === 'CONTRIBUTION' ? 'Contribution' : 'Payout'} of $${parseFloat(transactionAmount).toFixed(2)} recorded`
        )
      } else {
        const errorData = await res.json().catch(() => ({}))
        setParticleType('error')
        setShowParticles(true)
        toast.error('Transaction Failed', errorData.error || 'Could not add transaction')
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      setParticleType('error')
      setShowParticles(true)
      toast.error('Network Error', 'Failed to connect to server')
    }
  }

  if (loading) {
    return (
      <GradientBackground>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <FloatingElement duration={2} intensity={20}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <PiggyBank className="h-16 w-16 text-purple-600 mx-auto" />
              </motion.div>
            </FloatingElement>
            <LoadingSkeleton lines={3} height="h-2" className="w-64 mx-auto" />
            <p className="mt-4 text-gray-600 animate-pulse">Loading your savings dashboard...</p>
          </motion.div>
        </div>
      </GradientBackground>
    )
  }

  if (!session) {
    return (
      <GradientBackground>
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <PulseGlow color="purple">
              <GlassPanel className="w-full max-w-md p-8">
                <motion.div 
                  className="text-center mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FloatingElement duration={4} intensity={15}>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <PiggyBank className="h-12 w-12 text-purple-600" />
                      </motion.div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Ajo Digital Ledger
                      </h1>
                    </div>
                  </FloatingElement>
                  <p className="text-gray-600 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Transparent savings tracking for your community
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      🎯 Demo Credentials: demo@ajo.com
                    </p>
                  </div>
                </motion.div>

                <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value={authMode} className="space-y-4">
                    <form onSubmit={handleAuth} className="space-y-4">
                      <StaggeredChildren staggerDelay={0.1}>
                        <div>
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              required
                            />
                          </motion.div>
                        </div>
                        {authMode === 'signup' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </motion.div>
                          </motion.div>
                        )}
                        <AnimatedButton 
                          type="submit" 
                          className="w-full"
                          loading={authLoading}
                        >
                          {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                        </AnimatedButton>
                      </StaggeredChildren>
                    </form>
                  </TabsContent>
                </Tabs>
              </GlassPanel>
            </PulseGlow>
          </motion.div>
        </div>
      </GradientBackground>
    )
  }

  return (
    <GradientBackground>
      <ParticleEffects trigger={showParticles} type={particleType} />
      <Confetti trigger={showConfetti} />
      <motion.header 
        className="relative backdrop-blur-md bg-white/10 border-b border-white/20 shadow-xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <FloatingElement duration={6} intensity={8}>
                <motion.img
                  src="/logo.png"
                  alt="Ajo Digital Ledger"
                  className="h-10 w-10 object-contain drop-shadow-lg"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </FloatingElement>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Ajo Digital Ledger
              </h1>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-2"
              >
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Welcome, {session.user?.name || session.user?.email}
                </span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatedButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut()}
                  className="bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent text-white border-white/30"
                >
                  Sign Out
                </AnimatedButton>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Groups */}
          <div className="lg:col-span-1 space-y-6">
            {/* Create/Join Group */}
            <SlideIn direction="left" delay={0.1}>
              <AnimatedCard glow={true}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <PlusCircle className="h-6 w-6 text-purple-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Groups
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StaggeredChildren staggerDelay={0.1}>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Input
                          placeholder="Group name"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Input
                          placeholder="Description (optional)"
                          value={groupDescription}
                          onChange={(e) => setGroupDescription(e.target.value)}
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </motion.div>
                      <AnimatedButton onClick={handleCreateGroup} className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Group
                      </AnimatedButton>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Input
                          placeholder="Invite code"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </motion.div>
                      <AnimatedButton onClick={handleJoinGroup} variant="outline" className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Join Group
                      </AnimatedButton>
                    </div>
                  </StaggeredChildren>
                </CardContent>
              </AnimatedCard>
            </SlideIn>

            {/* Groups List */}
            <SlideIn direction="left" delay={0.2}>
              <AnimatedCard glow={true}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Users className="h-6 w-6 text-blue-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      My Groups
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {groups.map((group, index) => (
                        <AnimatedGroupCard
                          key={group.id}
                          group={group}
                          isSelected={selectedGroup?.id === group.id}
                          onClick={() => {
                            if (session?.user?.role === 'ADMIN') {
                              router.push(`/admin/groups/${group.id}`)
                            } else {
                              setSelectedGroup(group)
                              fetchTransactions(group.id)
                            }
                          }}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                    {groups.length === 0 && (
                      <motion.div 
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No groups yet. Create or join one!
                        </p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </AnimatedCard>
            </SlideIn>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedGroup ? (
              <>
                {/* Group Overview */}
                <SlideIn direction="right" delay={0.1}>
                  <AnimatedCard glow={true}>
                    <CardHeader>
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <CardTitle className="flex items-center gap-3">
                          <FloatingElement duration={4} intensity={10}>
                            <Target className="h-6 w-6 text-purple-600" />
                          </FloatingElement>
                          {selectedGroup.name}
                        </CardTitle>
                        {selectedGroup.description && (
                          <CardDescription className="text-gray-600">
                            {selectedGroup.description}
                          </CardDescription>
                        )}
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <FloatingElement duration={3} intensity={8}>
                            <div className="flex flex-col items-center">
                              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                              <p className="text-3xl font-bold text-green-600">
                                ${selectedGroup.balance.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600">Total Balance</p>
                            </div>
                          </FloatingElement>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <FloatingElement duration={3.5} intensity={6}>
                            <div className="flex flex-col items-center">
                              <Users className="h-8 w-8 text-blue-600 mb-2" />
                              <p className="text-3xl font-bold text-blue-600">
                                {selectedGroup._count.members}
                              </p>
                              <p className="text-sm text-gray-600">Members</p>
                            </div>
                          </FloatingElement>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <FloatingElement duration={4} intensity={7}>
                            <div className="flex flex-col items-center">
                              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                              <p className="text-3xl font-bold text-purple-600">
                                {selectedGroup._count.transactions}
                              </p>
                              <p className="text-sm text-gray-600">Transactions</p>
                            </div>
                          </FloatingElement>
                        </motion.div>
                      </div>
                    </CardContent>
                  </AnimatedCard>
                </SlideIn>

                {/* Add Transaction */}
                <SlideIn direction="right" delay={0.2}>
                  <AnimatedCard glow={true}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Zap className="h-6 w-6 text-yellow-600" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          Add Transaction
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StaggeredChildren staggerDelay={0.1}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount</Label>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={transactionAmount}
                                onChange={(e) => setTransactionAmount(e.target.value)}
                                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </motion.div>
                          </div>
                          <div>
                            <Label htmlFor="type" className="text-sm font-medium text-gray-700">Type</Label>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <select
                                id="type"
                                className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-purple-500"
                                value={transactionType}
                                onChange={(e) => setTransactionType(e.target.value as 'CONTRIBUTION' | 'PAYOUT')}
                              >
                                <option value="CONTRIBUTION">Contribution</option>
                                <option value="PAYOUT">Payout</option>
                              </select>
                            </motion.div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description (optional)</Label>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Input
                              id="description"
                              placeholder="What's this transaction for?"
                              value={transactionDescription}
                              onChange={(e) => setTransactionDescription(e.target.value)}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                          </motion.div>
                        </div>
                        <AnimatedButton onClick={handleAddTransaction} className="w-full">
                          <Gift className="h-4 w-4 mr-2" />
                          Add Transaction
                        </AnimatedButton>
                      </StaggeredChildren>
                    </CardContent>
                  </AnimatedCard>
                </SlideIn>

                {/* Transaction History */}
                <SlideIn direction="right" delay={0.3}>
                  <AnimatedCard glow={true}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                          <Calendar className="h-6 w-6 text-indigo-600" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          Transaction History
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        <AnimatePresence>
                          {transactions.map((transaction, index) => (
                            <AnimatedTransaction
                              key={transaction.id}
                              transaction={transaction}
                              index={index}
                            />
                          ))}
                        </AnimatePresence>
                        {transactions.length === 0 && (
                          <motion.div 
                            className="text-center py-12"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <FloatingElement duration={4} intensity={15}>
                              <div>
                                <ArrowDownCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                  No transactions yet
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                  Add the first transaction to get started!
                                </p>
                              </div>
                            </FloatingElement>
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </AnimatedCard>
                </SlideIn>
              </>
            ) : (
              <SlideIn direction="right" delay={0.1}>
                <AnimatedCard glow={true}>
                  <CardContent className="text-center py-16">
                    <FloatingElement duration={5} intensity={20}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Users className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                          No Group Selected
                        </h3>
                        <p className="text-gray-600 text-lg mb-8">
                          Create a new group or join an existing one to get started.
                        </p>
                        <FloatingElement duration={3} intensity={10}>
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <PulseGlow color="blue">
                              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium">
                                <Sparkles className="h-5 w-5" />
                                Start Saving Together
                                <Sparkles className="h-5 w-5" />
                              </div>
                            </PulseGlow>
                          </motion.div>
                        </FloatingElement>
                      </motion.div>
                    </FloatingElement>
                  </CardContent>
                </AnimatedCard>
              </SlideIn>
            )}
          </div>
        </div>
      </main>
    </GradientBackground>
  )
}