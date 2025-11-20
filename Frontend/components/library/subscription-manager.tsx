"use client"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Calendar, CheckCircle, Clock, CreditCard, ArrowLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { subscriptionApi, Subscription } from "@/lib/subscription-api"
import { paymentApi, PaymentHistoryItem } from "@/lib/payment-api"
import { useRazorpayCheckout } from "../hooks/useRazorpayCheckout"
import { Duration, Shift, SeatType, PRICING, getBasePrice, perMonth, savingsPerMonth } from "@/lib/pricing"

const DURATIONS: Duration[] = ["1 Month", "3 Months", "7 Months"]
const SHIFTS: Shift[] = ["Full Day", "Morning", "Evening"]
const SEATS: SeatType[] = ["Regular", "Special"]

type Step = 1 | 2 | 3 | 4

export function SubscriptionManager() {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [billingHistory, setBillingHistory] = useState<PaymentHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { startPayment } = useRazorpayCheckout()

  // Multi-step selection state
  const [step, setStep] = useState<Step>(1)
  const [duration, setDuration] = useState<Duration | null>(null)
  const [shift, setShift] = useState<Shift | null>(null)
  const [seat, setSeat] = useState<SeatType | null>(null)
  const [addReg, setAddReg] = useState(false)
  const [addLocker, setAddLocker] = useState(false)

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const res = await subscriptionApi.getCurrentSubscription()
        setCurrentSubscription(res.data ?? null)

        try {
          const history = await paymentApi.getPaymentHistory()
          setBillingHistory((history as any)?.history ?? [])
        } catch {
          setBillingHistory([])
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error)
        toast({ title: "Error", description: "Failed to fetch subscription info", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubscriptionData()
  }, [toast])

  const progressPercentage = currentSubscription?.daysRemaining
    ? ((30 - (currentSubscription.daysRemaining ?? 0)) / 30) * 100
    : 0

  // Price calculations
  const basePrice = useMemo(() => {
    if (!duration || !shift || !seat) return 0
    return getBasePrice(duration, shift, seat)
  }, [duration, shift, seat])

  const totalAmount = useMemo(() => {
    return basePrice + (addReg ? 150 : 0) + (addLocker ? 100 : 0)
  }, [basePrice, addReg, addLocker])

  const savePerMonth = useMemo(() => {
    if (!duration || !shift || !seat) return 0
    return savingsPerMonth(duration, shift, seat)
  }, [duration, shift, seat])

  const planName = useMemo(() => {
    if (!duration || !shift || !seat) return ""
    return `${duration} - ${shift} - ${seat}`
  }, [duration, shift, seat])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card><CardContent className="pt-6"><div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-24 bg-muted rounded" /></div></CardContent></Card>
      </div>
    )
  }

  const StepIndicator = () => {
    const items = [
      { id: 1, label: "Duration" },
      { id: 2, label: "Shift" },
      { id: 3, label: "Seat Type" },
      { id: 4, label: "Review" },
    ]
    const pct = ((step - 1) / (items.length - 1)) * 100
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-medium">
          {items.map((s) => (
            <div key={s.id} className={`flex items-center gap-2 ${step === s.id ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${step >= (s.id as Step) ? "bg-primary text-white border-primary" : "bg-background"}`}>{s.id}</div>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <Progress className="mt-3" value={pct} />
      </div>
    )
  }

  const BackButton = () =>
    step > 1 ? (
      <Button variant="ghost" size="sm" onClick={() => setStep((s) => (s - 1) as Step)} className="inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
    ) : null

  const canNext = (s: Step) => {
    if (s === 1) return !!duration
    if (s === 2) return !!shift
    if (s === 3) return !!seat
    return true
  }

  const handlePay = () => {
    console.log("🔘 Pay button clicked")
    console.log("Selected options:", { duration, shift, seat, totalAmount })
    
    if (!duration || !shift || !seat) {
      toast({ title: "Please complete selection", variant: "destructive" })
      return
    }
    
    console.log("✅ All options selected, starting payment...")
    startPayment({
      duration,
      shift,
      seatType: seat,
      amount: totalAmount,
      planName,
      addOns: { registration: addReg, locker: addLocker },
    })
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {currentSubscription ? (
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
                  {currentSubscription.plan || "Subscription"} - {currentSubscription.status}
                </h3>
                <p className="text-muted-foreground">
                  Expires on {currentSubscription.expiryDate ? new Date(currentSubscription.expiryDate).toDateString() : "N/A"}
                </p>
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">Days remaining</span>
                    <Badge variant="outline">{currentSubscription.daysRemaining ?? 0} days</Badge>
                  </div>
                  <Progress value={progressPercentage} className="w-full md:w-64" />
                </div>
              </div>
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
            <p className="text-muted-foreground mb-2">You don't have an active subscription. Choose a plan below.</p>
          </CardContent>
        </Card>
      )}

      {/* Multi-step form */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <p className="text-muted-foreground">Follow the steps to configure your subscription</p>
        </CardHeader>
        <CardContent>
          <StepIndicator />

          {/* Step 1: Duration */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DURATIONS.map((d) => {
                const monthly = d === "1 Month" ? null : `Save ₹${savingsPerMonth(d, "Full Day", "Regular")}/mo*`
                return (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`p-4 rounded-lg border text-left hover:shadow transition ${
                      duration === d ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="font-semibold">{d}</div>
                    <div className="text-sm text-muted-foreground mt-1">Flexible pricing</div>
                    {monthly && <div className="text-xs text-green-600 mt-2">{monthly}</div>}
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 2: Shift */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SHIFTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setShift(s)}
                  className={`p-4 rounded-lg border text-left hover:shadow transition ${
                    shift === s ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="font-semibold">{s}</div>
                  <div className="text-xs text-muted-foreground mt-1">Best for your routine</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Seat type */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SEATS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeat(s)}
                  className={`p-4 rounded-lg border text-left hover:shadow transition ${
                    seat === s ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="font-semibold">{s} Seat</div>
                  <div className="text-xs text-muted-foreground mt-1">Comfortable workspace</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline">{duration}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{shift}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{seat} Seat</Badge>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base price</span>
                    <span>₹{basePrice}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={addReg} onChange={(e) => setAddReg(e.target.checked)} />
                      Include Registration Fee (₹150)
                    </label>
                    <span>₹{addReg ? 150 : 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={addLocker} onChange={(e) => setAddLocker(e.target.checked)} />
                      Include Locker Fee (₹100)
                    </label>
                    <span>₹{addLocker ? 100 : 0}</span>
                  </div>

                  {duration && shift && seat && (
                    <div className="text-xs text-green-700 mt-2">
                      Per-month saving vs 1 Month ({shift}, {seat}): ₹{savePerMonth}/mo
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t mt-3 font-semibold">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={handlePay}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ₹{totalAmount}
              </Button>
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <BackButton />
            <Button
              onClick={() => setStep((s) => Math.min(s + 1, 4) as Step)}
              disabled={!canNext(step)}
            >
              {step < 4 ? "Next" : "Review"}
            </Button>
          </div>
          
        </CardContent>
      </Card>
    </div>
  )
}
