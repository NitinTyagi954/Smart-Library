"use client"

import React, { useState, useEffect, useCallback, JSX } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Flame, Target, TrendingUp } from "lucide-react"

const PROGRESS_KEY = "progressData" // same as TodoManager

export function ProgressTracker() {
  const [progressData, setProgressData] = useState<{ [key: string]: boolean }>({})
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [totalCompletedDays, setTotalCompletedDays] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const today = new Date()
  const currentYear = today.getFullYear()
  const todayStr = today.toISOString().split("T")[0]

  const loadProgress = useCallback(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      setProgressData(parsed)

      const completedDays = Object.values(parsed).filter(Boolean).length
      setTotalCompletedDays(completedDays)

      const { current, longest } = calculateStreaks(parsed, todayStr)
      setCurrentStreak(current)
      setLongestStreak(longest)
    } catch (e) {
      console.error("Failed to load progress", e)
      setProgressData({})
      setCurrentStreak(0)
      setLongestStreak(0)
      setTotalCompletedDays(0)
    } finally {
      setIsLoading(false)
    }
  }, [todayStr])

  useEffect(() => {
    loadProgress()
    window.addEventListener("progress-update", loadProgress)
    return () => window.removeEventListener("progress-update", loadProgress)
  }, [loadProgress])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

  const daysSinceYearStart = getDaysSinceYearStart(currentYear, today)
  const completionRate = daysSinceYearStart > 0 ? Math.round((totalCompletedDays / daysSinceYearStart) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Days</p>
                <p className="text-2xl font-bold text-foreground">{totalCompletedDays}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview (LeetCode Style) */}
      <Card className="border-none shadow-none rounded-xl overflow-hidden bg-[#07102a]">
        <CardHeader className="text-white rounded-t-xl border-b border-[#0e2748]">
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-blue-300" />
            {currentYear} Progress Overview
          </CardTitle>

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm text-blue-150 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#0f2342] border border-[#112a4b] rounded-sm" />
              <span className="text-blue-200">No activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#1f5cff] rounded-sm border border-[#184fcc]" />
              <span className="text-blue-200">Goals completed</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="rounded-b-xl px-6 py-6 overflow-x-auto">
          {/* Yearly horizontal layout like LeetCode */}
          {/* months laid out horizontally (columns), each month label on top */}
          <div className="flex gap-6 min-w-max items-start">
            {Array.from({ length: 12 }).map((_, month) => {
              const monthName = new Date(currentYear, month).toLocaleString("default", { month: "short" })
              const daysInMonth = new Date(currentYear, month + 1, 0).getDate()
              const firstDay = new Date(currentYear, month, 1).getDay()

              const days: JSX.Element[] = []
              for (let i = 0; i < firstDay; i++) {
                days.push(<div key={`empty-${month}-${i}`} className="w-3 h-3" />)
              }

              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentYear, month, day)
                const dateStr = date.toISOString().split("T")[0]
                const isCompleted = Boolean(progressData[dateStr])
                const isFuture = date > today

                days.push(
                  <div
                    key={`${month}-${day}`}
                    title={`${monthName} ${day}: ${isFuture ? "Future" : isCompleted ? "Completed" : "No activity"}`}
                    className={`w-3 h-3 rounded-sm transition-all duration-200 ${
                      isFuture ? "bg-[#1b2b5c]" : isCompleted ? "bg-blue-500 hover:bg-blue-400" : "bg-[#1b2b5c] hover:bg-[#243a78]"
                    }`}
                  />,
                )
              }

              return (
                <div key={month} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-blue-200">{monthName}</span>
                  <div className="grid grid-rows-7 grid-flow-col gap-1">{days}</div>
                </div>
              )
            })}
          </div>
         </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`flex items-center gap-3 p-4 border border-border rounded-lg ${currentStreak >= 7 ? "" : "opacity-50"}`}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Streak Master</h4>
                <p className="text-sm text-muted-foreground">7+ day streak</p>
              </div>
              <Badge variant={currentStreak >= 7 ? "default" : "outline"}>{currentStreak >= 7 ? "Earned" : "Locked"}</Badge>
            </div>

            <div className={`flex items-center gap-3 p-4 border border-border rounded-lg ${totalCompletedDays >= 50 ? "" : "opacity-50"}`}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Goal Crusher</h4>
                <p className="text-sm text-muted-foreground">50+ completed days</p>
              </div>
              <Badge variant={totalCompletedDays >= 50 ? "default" : "outline"}>{totalCompletedDays >= 50 ? "Earned" : "Locked"}</Badge>
            </div>

            <div className={`flex items-center gap-3 p-4 border border-border rounded-lg ${totalCompletedDays >= 100 ? "" : "opacity-50"}`}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Century Club</h4>
                <p className="text-sm text-muted-foreground">100+ completed days</p>
              </div>
              <Badge variant={totalCompletedDays >= 100 ? "default" : "outline"}>{totalCompletedDays >= 100 ? "Earned" : "Locked"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------- Helpers ---------- */

function getDaysSinceYearStart(year: number, upTo: Date) {
  const start = new Date(year, 0, 1)
  const diff = Math.floor((upTo.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : 0
}

function calculateStreaks(progressData: { [k: string]: boolean }, todayStr: string) {
  const dates = Object.keys(progressData).sort()
  let longest = 0
  let running = 0
  for (let i = 0; i < dates.length; i++) {
    if (progressData[dates[i]]) {
      running++
      if (running > longest) longest = running
    } else {
      running = 0
    }
  }

  let current = 0
  let cursor = new Date(todayStr)
  while (true) {
    const key = cursor.toISOString().split("T")[0]
    if (progressData[key]) {
      current++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return { current, longest }
}
