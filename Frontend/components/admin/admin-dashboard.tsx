"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Users, TrendingUp, Calendar, UserPlus, RefreshCw, AlertCircle, LogOut } from "lucide-react"
import Link from "next/link"
import { adminApi } from "@/lib/admin-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getDashboardStats()
      setDashboardData(response.data)
    } catch (err: any) {
      console.error("Failed to fetch dashboard stats:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout")
      localStorage.removeItem("user")
      toast({ title: "Logged out" })
      router.push("/login")
    } catch (e: any) {
      toast({ title: "Logout failed", description: e.message, variant: "destructive" })
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardStats} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  const { stats, recentActivities, expiringToday } = dashboardData || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 font-serif">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of library operations and performance metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchDashboardStats} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleLogout} variant="destructive" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-IN", { 
                style: "currency", 
                currency: "INR", 
                maximumFractionDigits: 0 
              }).format(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-IN", { 
                style: "currency", 
                currency: "INR", 
                maximumFractionDigits: 0 
              }).format(stats?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newSignups || 0} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.expiringSubscriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`p-2 rounded-lg ${
                        activity.type === "signup" ? "bg-green-100 dark:bg-green-900/20" :
                        activity.type === "renewal" ? "bg-blue-100 dark:bg-blue-900/20" :
                        "bg-orange-100 dark:bg-orange-900/20"
                      }`}>
                        {activity.type === "signup" && <UserPlus className="h-4 w-4 text-green-600" />}
                        {activity.type === "renewal" && <RefreshCw className="h-4 w-4 text-blue-600" />}
                        {activity.type === "expiry" && <AlertCircle className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activities
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Chart coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/admin/revenue">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Revenue
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/admin/reminders">
                  <Calendar className="mr-2 h-4 w-4" />
                  Send Reminders
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full justify-start bg-transparent">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Expiring Today */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                Expiring Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expiringToday && expiringToday.length > 0 ? (
                <div className="space-y-3">
                  {expiringToday.map((user: any, index: number) => (
                    <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.plan}</p>
                      <p className="text-xs text-muted-foreground">{user.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No subscriptions expiring today
                </p>
              )}
            </CardContent>
          </Card>

          {/* Renewal Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Renewal Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats?.renewalRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
