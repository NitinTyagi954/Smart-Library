"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Target, TrendingUp, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { RenewalReminderPopup } from "@/components/library/renewal-reminder-popup"
import { subscriptionApi, Subscription } from "@/lib/subscription-api"
import { PRICING, Duration } from "@/lib/pricing"

interface UserStats {
  currentStreak: number
  totalDays: number
  completedGoals: number
  totalGoals: number
  subscriptionStatus: string
  subscriptionExpiry: string | null
  subscriptionType: string | null
  daysRemaining: number
}

function formatDate(d?: string | null) {
  if (!d) return "N/A"
  try {
    return new Date(d).toDateString()
  } catch {
    return String(d)
  }
}

function calcTotalDays(start?: string, end?: string) {
  if (!start || !end) return 30
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return 30
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24))
}

function simplePlanLabel(sub: Subscription | null): string | null {
  if (!sub) return null
  const duration = sub.duration ?? (sub.plan?.match(/^\s*\d+\s*Month[s]?/i)?.[0] ?? "").trim()
  return duration ? `${duration} Subscription` : sub.plan ?? null
}

function minPriceForDuration(d: Duration): number {
  const shifts = Object.values(PRICING[d])
  const all = shifts.flatMap((m) => Object.values(m))
  return Math.min(...all)
}

export function LibraryDashboard() {
  const [user, setUser] = useState<any>(null)
  const [showRenewalReminder, setShowRenewalReminder] = useState(false)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ref to always read latest stats inside interval callback
  const statsRef = useRef<UserStats | null>(null)
  useEffect(() => {
    statsRef.current = stats
  }, [stats])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    const fetchDashboardData = async () => {
      try {
        // ✅ fetch subscription data
        const subRes = await subscriptionApi.getCurrentSubscription()
        const sub: Subscription | null = subRes.data ?? null

        setStats({
          // dummy fields
          currentStreak: 0,
          totalDays: 0,
          completedGoals: 0,
          totalGoals: 0,

          // real subscription mapping
          subscriptionStatus: sub?.status ?? "Inactive",
          subscriptionExpiry: sub?.expiryDate ?? null,
          subscriptionType: simplePlanLabel(sub),
          daysRemaining: sub?.daysRemaining ?? 0,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setStats({
          currentStreak: 0,
          totalDays: 0,
          completedGoals: 0,
          totalGoals: 0,
          subscriptionStatus: "Inactive",
          subscriptionExpiry: null,
          subscriptionType: null,
          daysRemaining: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Show renewal reminder every 8 minutes while user is on this dashboard
  useEffect(() => {
    const checkAndShow = () => {
      const s = statsRef.current
      const userData = localStorage.getItem("user")
      const localUser = userData ? JSON.parse(userData) : null

      if (
        localUser?.role === "student" &&
        s?.subscriptionStatus === "Active" &&
        typeof s.daysRemaining === "number" &&
        s.daysRemaining <= 7
      ) {
        setShowRenewalReminder(true)
      }
    }

    // initial check immediately
    checkAndShow()

    const intervalId = setInterval(checkAndShow, 8*60*1000) // every 8 minutes

    return () => clearInterval(intervalId)
  }, []) // run once on mount

  // New duration-based plan cards
  const durationCards = [
    { name: "1 Month", fromPrice: minPriceForDuration("1 Month") },
    { name: "3 Months", fromPrice: minPriceForDuration("3 Months") },
    { name: "7 Months", fromPrice: minPriceForDuration("7 Months") },
  ]

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Welcome back, {user?.name || "Student"}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Ready to continue your learning journey? Let's make today count!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{stats?.currentStreak || 0} days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Study Days</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalDays || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goals Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.completedGoals || 0}/{stats?.totalGoals || 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                <Badge
                  variant={stats?.subscriptionStatus === "Active" ? "default" : "outline"}
                  className="mt-1"
                >
                  {stats?.subscriptionStatus || "Inactive"}
                </Badge>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Subscription Status */}
      {stats?.subscriptionStatus === "Active" && stats.subscriptionExpiry ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {stats.subscriptionType || "Subscription"} - Active
                </h3>
                <p className="text-muted-foreground">
                  Expires on {formatDate(stats.subscriptionExpiry)}
                </p>
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">Days remaining</span>
                    <Badge variant="outline">{stats.daysRemaining} days</Badge>
                  </div>
                  <Progress
                    value={(() => {
                      // Use actual duration to compute percentage
                      const total = calcTotalDays(
                        // we don't keep startDate in stats; infer from expiry minus remaining
                        // but Progress only needs a stable bar; use expiry and daysRemaining if possible
                        undefined,
                        stats.subscriptionExpiry || undefined
                      )
                      const remaining = stats.daysRemaining || 0
                      const done = Math.max(0, total - remaining)
                      return Math.min(100, Math.round((done / total) * 100))
                    })()}
                    className="w-full md:w-64"
                  />
                </div>
              </div>
              <Button asChild>
                <Link href="/library/subscription">Manage Subscription</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              No Active Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground">
                  You don't have an active subscription. Choose a plan to get started.
                </p>
              </div>
              <Button asChild>
                <Link href="/library/subscription">Choose Plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* same as before (Goals, Progress, Feedback cards) */}
      </div>

      {/* Available Subscription Plans (Durations) */}
      <Card>
        <CardHeader>
          <CardTitle>Available Subscription Plans</CardTitle>
          <p className="text-muted-foreground">Pick a duration, then choose shift & seat on the next page</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {durationCards.map((plan, idx) => (
              <div
                key={idx}
                className={`relative p-6 rounded-lg border hover:shadow transition border-border`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-foreground">₹{plan.fromPrice}</span>
                    <span className="text-muted-foreground">/from</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li>Choose shift & seat at checkout</li>
                  <li>Optional Registration (₹150) and Locker (₹100)</li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/library/subscription">Choose Plan</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Renewal Reminder Popup */}
      <RenewalReminderPopup
        isOpen={showRenewalReminder}
        onClose={() => setShowRenewalReminder(false)}
        daysRemaining={stats?.daysRemaining ?? 0}
        plan={stats?.subscriptionType ?? "Unknown Plan"}
      />
    </div>
  )
}
