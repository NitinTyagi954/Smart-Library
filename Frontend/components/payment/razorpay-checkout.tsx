"use client"

import { Button } from "@/components/ui/button"
import { useRazorpayCheckout } from "../hooks/useRazorpayCheckout"
import { Duration, Shift, SeatType } from "@/lib/pricing"

interface Props {
  duration: Duration
  shift: Shift
  seatType: SeatType
  amount: number
  label?: string
  planName?: string
  addOns?: { registration: boolean; locker: boolean }
}

export default function RazorpayCheckout({
  duration,
  shift,
  seatType,
  amount,
  label = "Pay Now",
  planName,
  addOns,
}: Props) {
  const { startPayment } = useRazorpayCheckout()

  const handleClick = () => {
    startPayment({
      duration,
      shift,
      seatType,
      amount,
      planName: planName || `${duration} - ${shift} - ${seatType}`,
      addOns: addOns || { registration: false, locker: false },
    })
  }

  return (
    <Button onClick={handleClick}>
      {label}
    </Button>
  )
}
