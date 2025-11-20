"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { subscriptionApi } from "@/lib/subscription-api"
import { DatePicker } from "antd"
import dayjs, { Dayjs } from "dayjs"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface RevenueData {
  totalRevenue: number
  monthlyRevenue: Array<{ month: string; revenue: number }>
  subscriptionBreakdown: Array<{ name: string; value: number; color: string }>
  dailyRevenue: Array<{ day: string; amount: number }>
}

const COLORS: Record<string, string> = {
  "Daily Pass": "#e11d48",
  "Weekly Pass": "#f97316",
  "Monthly Pass": "#10b981",
}

export function RevenueCharts() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const { toast } = useToast()

  async function fetchRevenue() {
    setLoading(true)
    setError(null)
    try {
      const startISO = dateRange?.[0]?.startOf("day").toISOString()
      const endISO = dateRange?.[1]?.endOf("day").toISOString()

      const resp = await subscriptionApi.getRevenueMetrics({
        startDate: startISO,
        endDate: endISO,
      })

      if (!resp.success || !resp.data) throw new Error(resp.message || "Failed to load data")

      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

      const transformed: RevenueData = {
        totalRevenue: resp.data.totalRevenue || 0,
        monthlyRevenue: (resp.data.monthlyRevenue || []).map((m: any) => ({
          month: monthNames[(m._id ?? 1) - 1],
          revenue: m.total || 0,
        })),
        subscriptionBreakdown: (resp.data.subscriptionBreakdown || []).map((s: any) => ({
          name: s._id,
          value: s.total || 0,
          color: COLORS[s._id] || "#6b7280",
        })),
        dailyRevenue: resp.data.dailyRevenue || [],
      }

      setData(transformed)
    } catch (e: any) {
      setError(e.message || "Failed to load data")
      toast({ title: "Error", description: e.message || "Failed to load data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Load all data on mount
  useEffect(() => { fetchRevenue() }, [])

  // Refetch when range changes
  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1]) fetchRevenue()
  }, [dateRange])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-sm text-muted-foreground">{dateRange ? "Filtered by date range" : "Showing all revenue"}</p>
        </div>
        <div className="flex gap-2">
          <DatePicker.RangePicker
            value={dateRange as any}
            onChange={(d) => setDateRange(d ? [d[0], d[1]] : null)}
            format="DD MMM YYYY"
          />
          {dateRange && <Button variant="outline" onClick={() => { setDateRange(null); fetchRevenue() }}>Clear</Button>}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
          <div className="animate-spin h-5 w-5 border-2 border-rose-500 border-t-transparent rounded-full mb-3" />
          <p>Loading revenue data...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center h-[200px] text-center">
          <p className="text-red-500 mb-3">⚠️ {error}</p>
          <Button variant="outline" onClick={fetchRevenue}>Retry</Button>
        </div>
      )}

      {data && !loading && !error && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">₹{(data.totalRevenue || 0).toLocaleString("en-IN")}</p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Revenue over selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {data.monthlyRevenue.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="#e11d48" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">No monthly data</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
              <CardDescription>Revenue breakdown by plan</CardDescription>
            </CardHeader>
            <CardContent>
              {data.subscriptionBreakdown.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={data.subscriptionBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                      label={({ name, value }) => `${name}: ₹${(value || 0).toLocaleString()}`}>
                      {data.subscriptionBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">No plan data</div>
              )}
            </CardContent>
          </Card>

          {data.dailyRevenue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Pattern</CardTitle>
                <CardDescription>Daily revenue during selected range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Revenue"]} />
                    <Line type="monotone" dataKey="amount" stroke="#e11d48" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
