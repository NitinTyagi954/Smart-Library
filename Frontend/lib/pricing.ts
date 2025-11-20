export type Duration = "1 Month" | "3 Months" | "7 Months"
export type Shift = "Full Day" | "Morning" | "Evening"
export type SeatType = "Regular" | "Special"

export const PRICING: Record<Duration, Record<Shift, Record<SeatType, number>>> = {
  "1 Month": {
    "Full Day": { Regular: 900, Special: 1000 },
    "Morning": { Regular: 700, Special: 750 },
    "Evening": { Regular: 600, Special: 700 },
  },
  "3 Months": {
    "Full Day": { Regular: 2500, Special: 2800 },
    "Morning": { Regular: 1900, Special: 2100 },
    "Evening": { Regular: 1700, Special: 2000 },
  },
  "7 Months": {
    "Full Day": { Regular: 5400, Special: 6000 },
    "Morning": { Regular: 4200, Special: 4500 },
    "Evening": { Regular: 3600, Special: 4200 },
  },
}

export function getBasePrice(duration: Duration, shift: Shift, seat: SeatType): number {
  return PRICING[duration][shift][seat]
}

export function perMonth(amount: number, duration: Duration): number {
  const months = duration === "1 Month" ? 1 : duration === "3 Months" ? 3 : 7
  return Math.round(amount / months)
}

export function savingsPerMonth(duration: Duration, shift: Shift, seat: SeatType): number {
  if (duration === "1 Month") return 0
  const monthlyBase = PRICING["1 Month"][shift][seat]
  const thisPerMonth = perMonth(PRICING[duration][shift][seat], duration)
  return Math.max(0, monthlyBase - thisPerMonth)
}