"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Users, Loader2 } from "lucide-react"
import { adminApi } from "@/lib/admin-api"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  plan: string
  status: string
  endDate: string | null
  daysRemaining: number
}

export function WhatsAppReminders() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // ✅ Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const [expiredRes, expiringRes] = await Promise.all([
          adminApi.getUsers({ status: "expired" }),
          adminApi.getUsers({ status: "expiring" }),
        ])
        const users = [...(expiredRes.data.users || []), ...(expiringRes.data.users || [])]

        setStudents(users)
        setError(null)
      } catch (err: any) {
        console.error("Error fetching users:", err)
        setError("Failed to load reminders.")
        toast({
          title: "Error fetching users",
          description: "Could not load expired or expiring users.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  // ✅ Message generator
  const generateWhatsAppMessage = (student: Student) => {
    const expiryText =
      student.status === "expired"
        ? "has expired 😕"
        : student.daysRemaining === 0
        ? "is expiring today ⏰"
        : `is expiring in ${student.daysRemaining} day${
            student.daysRemaining > 1 ? "s" : ""
          } ⏰`

    const message = `Hi ${student.name}! 👋

Your ${student.plan} subscription at Ultimate Success Institute ${expiryText}.

Don't let your learning journey stop! Renew now to continue accessing:
✅ Premium study materials
✅ Progress tracking
✅ Personalized goals
✅ AC study rooms

Renew today and keep fueling your success! 🚀

Best regards,
Ultimate Success Institute Team`

    return encodeURIComponent(message)
  }

  // ✅ Send message to a single user
  const sendWhatsAppMessage = (student: Student) => {
    const message = generateWhatsAppMessage(student)
    const whatsappUrl = `https://wa.me/91${student.phone}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  // ✅ Send all messages at once (with confirmation)
  const sendBulkReminders = () => {
    if (students.length === 0) {
      toast({
        title: "No users to remind",
        description: "There are no expired or expiring users right now.",
      })
      return
    }

    if (!confirm(`You are about to send ${students.length} reminders. Continue?`)) return

    students.forEach((student, index) => {
      setTimeout(() => sendWhatsAppMessage(student), index * 600)
    })

    toast({
      title: "Reminders Sent",
      description: `${students.length} WhatsApp reminder(s) opened.`,
    })
  }

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p>{error}</p>
        <Button onClick={() => location.reload()} className="mt-3">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">WhatsApp Reminders</h2>
          <p className="text-muted-foreground">
            Send renewal reminders to students with expired or expiring subscriptions
          </p>
        </div>
        <Button onClick={sendBulkReminders} className="bg-green-600 hover:bg-green-700">
          <Send className="mr-2 h-4 w-4" />
          Send All Reminders
        </Button>
      </div>

      {/* ✅ User Cards */}
      {students.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          🎉 No expired or expiring users right now!
        </p>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <Card key={student.id} className="border-l-4 border-l-rose-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription>
                      {student.email} • +91 {student.phone}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        student.status === "expired"
                          ? "destructive"
                          : student.status === "expiring"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {student.status === "expired"
                        ? "Expired"
                        : `${student.daysRemaining} days left`}
                    </Badge>
                    <Badge variant="outline">{student.plan}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Expires: {student.endDate ? student.endDate : "N/A"}</p>
                  </div>
                  <Button
                    onClick={() => sendWhatsAppMessage(student)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ✅ Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Reminder Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-destructive">
                {students.filter((s) => s.status === "expired").length}
              </p>
              <p className="text-sm text-muted-foreground">Expired</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {students.filter((s) => s.status === "expiring").length}
              </p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{students.length}</p>
              <p className="text-sm text-muted-foreground">Total Reminders</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
