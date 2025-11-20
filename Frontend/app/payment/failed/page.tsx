"use client"

import Link from "next/link"
import { XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentFailed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center space-y-6 p-6">
        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-red-600">Payment Failed</h1>
        <p className="text-muted-foreground">
          Your payment could not be processed. Please try again or contact support.
        </p>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/library/subscription">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
