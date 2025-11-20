"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useGlobalSpinner } from "@/components/ui/GlobalSpinner"
import { paymentApi } from "@/lib/payment-api"

declare global {
  interface Window {
    Razorpay: any
  }
}

export function useRazorpayCheckout() {
  const router = useRouter()
  const { toast } = useToast()
  const { show, hide } = useGlobalSpinner()

  type StartPayload = {
    duration: string
    shift: string
    seatType: string
    amount: number
    planName?: string
    addOns?: { registration: boolean; locker: boolean }
  }

  const startPayment = async (payload: StartPayload) => {
    try {
      console.log("🚀 Payment flow starting...")
      show()

      const planName =
        payload.planName ||
        `${payload.duration} - ${payload.shift} - ${payload.seatType}`

      console.log("💰 Payment details:", { planName, amount: payload.amount })

      // Check if Razorpay SDK is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.")
      }

      // Check if key is available
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!key) {
        throw new Error("Razorpay key not configured")
      }

      console.log("✅ Razorpay SDK loaded, creating order...")

      // Step 1: Create order
      const order = await paymentApi.createOrder(planName, payload.amount)
      console.log("✅ Order created:", order)

      // Check if we're in test mode
      const isTestMode = key.includes("test")
      
      if (isTestMode) {
        console.log("🧪 TEST MODE: Using simulated payment flow")
        // In test mode, show a simpler checkout or automatic verification
        await handleTestModePayment(
          order,
          planName,
          payload
        )
      } else {
        // Production mode - use real Razorpay checkout
        await handleLivePayment(order, planName, payload)
      }
    } catch (err: any) {
      console.error("❌ Payment init failed:", err)
      toast({
        title: "Payment Init Failed",
        description: err.message,
        variant: "destructive",
      })
      hide()
    }
  }

  const handleTestModePayment = async (
    order: any,
    planName: string,
    payload: StartPayload
  ) => {
    try {
      // In test mode, auto-generate test payment response
      const testResponse = {
        razorpay_order_id: order.id,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: "test_signature_" + order.id,
      }

      console.log("🧪 Test mode: Auto-verifying payment...")
      
      await paymentApi.verifyPayment({
        orderId: testResponse.razorpay_order_id,
        paymentId: testResponse.razorpay_payment_id,
        signature: testResponse.razorpay_signature,
        plan: planName,
        duration: payload.duration,
        shift: payload.shift,
        seatType: payload.seatType,
        amount: payload.amount,
        addOns: payload.addOns,
      })
      
      toast({ title: "Payment Successful 🎉 (Test Mode)" })
      router.push("/payment/success")
    } catch (err: any) {
      console.error("❌ Test payment verification failed:", err)
      toast({
        title: "Payment Failed",
        description: err.message,
        variant: "destructive",
      })
      router.push("/payment/failed")
    } finally {
      hide()
    }
  }

  const handleLivePayment = async (
    order: any,
    planName: string,
    payload: StartPayload
  ) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Ultimate Success Institute",
      description: `${planName} Subscription`,
      order_id: order.id,
      image: "https://razorpay.com/favicon.png",
      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },
      notes: {
        plan: planName,
      },
      handler: async (response: any) => {
        console.log("✅ Payment successful, verifying...")
        try {
          await paymentApi.verifyPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            plan: planName,
            duration: payload.duration,
            shift: payload.shift,
            seatType: payload.seatType,
            amount: payload.amount,
            addOns: payload.addOns,
          })
          toast({ title: "Payment Successful 🎉" })
          router.push("/payment/success")
        } catch (err: any) {
          console.error("❌ Verification failed:", err)
          toast({
            title: "Verification Failed",
            description: err.message,
            variant: "destructive",
          })
          router.push("/payment/failed")
        } finally {
          hide()
        }
      },
      modal: {
        ondismiss: () => {
          console.log("⚠️ Payment modal dismissed")
          hide()
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment",
            variant: "destructive",
          })
        },
      },
      theme: { color: "#0f172a" },
    }

    console.log("🔓 Opening Razorpay checkout...")
    const rzp = new window.Razorpay(options)

    rzp.on("payment.failed", function (response: any) {
      console.error("❌ Payment failed:", response.error)
      hide()
      toast({
        title: "Payment Failed",
        description: response.error.description || "Something went wrong",
        variant: "destructive",
      })
    })

    rzp.on("payment.authorized", function (response: any) {
      console.log("✅ Payment authorized:", response)
    })

    rzp.open()
  }

  return { startPayment }
}
