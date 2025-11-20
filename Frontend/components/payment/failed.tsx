"use client"

import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PaymentFailedPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6">
      <XCircle className="h-16 w-16 text-red-600" />
      <h1 className="text-2xl font-bold">Payment Failed ❌</h1>
      <p className="text-muted-foreground">Your payment could not be completed. Please try again.</p>

      <div className="space-x-4">
        <Button variant="outline" onClick={() => router.push("/library/subscription")}>
          Retry Payment
        </Button>
        <Button onClick={() => router.push("/library/subscription")}>
          Back to Subscription Page
        </Button>
      </div>
    </div>
  )
}
