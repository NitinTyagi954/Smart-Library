"use client"

import { useEffect, useState } from "react"
import { subscriptionApi, Subscription } from "@/lib/subscription-api"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

export default function PaymentSuccessPage() {
  const [sub, setSub] = useState<Subscription | null>(null)
  const router = useRouter()

  useEffect(() => {
    subscriptionApi.getCurrentSubscription().then((res) => {
      setSub(res.data ?? null)
    })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6">
      <CheckCircle className="h-16 w-16 text-green-600" />
      <h1 className="text-2xl font-bold">Payment Successful 🎉</h1>

      {sub && (
        <div className="space-y-2">
          <p>Plan: <b>{sub.plan}</b></p>
          <p>Status: {sub.status}</p>
          <p>Start: {sub.startDate}</p>
          <p>Expiry: {sub.expiryDate}</p>
        </div>
      )}

      <Button onClick={() => router.push("/library/subscription")}>
        Back to Dashboard
      </Button>
    </div>
  )
}
