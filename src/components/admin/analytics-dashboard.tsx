"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface MemberStat {
  name: string
  email: string
  contributions: number
  payouts: number
  balance: number
  transactionCount: number
}

interface AnalyticsData {
  groupId: string
  totalContributions: number
  totalPayouts: number
  balance: number
  totalMembers: number
  totalTransactions: number
  memberStats: MemberStat[]
}

interface AnalyticsDashboardProps {
  groupId: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6']

export function AnalyticsDashboard({ groupId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/groups/${groupId}/analytics`)
        if (!res.ok) throw new Error("Failed to fetch analytics")
        const data = await res.json()
        setAnalytics(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Failed to fetch analytics:", err)
      } finally {
        setLoading(false)
      }
    }

    if (groupId) {
      fetchAnalytics()
    }
  }, [groupId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <Card className="p-6 bg-red-50 border-red-200 mb-8">
        <p className="text-red-800">Failed to load analytics: {error}</p>
      </Card>
    )
  }

  const contributionsByMember = analytics.memberStats
    .map(m => ({ name: m.name, value: m.contributions }))
    .filter(m => m.value > 0)
    .sort((a, b) => b.value - a.value)

  const balanceByMember = analytics.memberStats
    .map(m => ({ name: m.name, balance: m.balance }))
    .sort((a, b) => b.balance - a.balance)

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Contributions</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">₦{analytics.totalContributions.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Payouts</p>
              <p className="text-3xl font-bold text-green-900 mt-2">₦{analytics.totalPayouts.toLocaleString()}</p>
            </div>
            <ArrowDownLeft className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Group Balance</p>
              <p className="text-3xl font-bold text-amber-900 mt-2">₦{analytics.balance.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Active Members</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{analytics.totalMembers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contributions by Member */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Contributions by Member</h3>
          {contributionsByMember.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contributionsByMember}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => `₦${value.toLocaleString()}`}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">No contribution data available</p>
          )}
        </Card>

        {/* Member Balance Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Member Balances</h3>
          {balanceByMember.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={balanceByMember}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => `₦${value.toLocaleString()}`}
                />
                <Bar dataKey="balance" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">No balance data available</p>
          )}
        </Card>
      </div>

      {/* Member Details Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Member Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Contributions</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Payouts</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {analytics.memberStats.map((member, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-blue-600 font-medium">₦{member.contributions.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 text-green-600 font-medium">₦{member.payouts.toLocaleString()}</td>
                  <td className={`text-right py-3 px-4 font-medium ${member.balance >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    ₦{member.balance.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-slate-700">{member.transactionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
