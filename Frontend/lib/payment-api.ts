import { api } from "./api"

// ---------- Interfaces ----------
export interface OrderResponse {
  id: string
  amount: number
  currency: string
  receipt?: string
  status?: string
  [key: string]: any // fallback for unknown fields
}

export interface VerifyPaymentResponse {
  success: boolean
  message: string
  subscriptionId?: string
  [key: string]: any
}

export interface PaymentHistoryItem {
  id: string
  amount: number
  status: string
  createdAt: string
  [key: string]: any
}

// ---------- API Functions ----------
export const paymentApi = {
  createOrder: async (plan: string, amount: number): Promise<OrderResponse> => {
    console.log("🔗 API createOrder called with:", { plan, amount })
    return api.post<OrderResponse>("/payment/create-order", { plan, amount })
  },

  verifyPayment: async (paymentData: {
    orderId?: string
    paymentId?: string
    signature?: string
    plan?: string
    duration?: string
    shift?: string
    seatType?: string
    amount?: number
    addOns?: { registration?: boolean; locker?: boolean }
  }): Promise<VerifyPaymentResponse> => {
    const payload = {
      orderId: paymentData.orderId,
      paymentId: paymentData.paymentId,
      signature: paymentData.signature,
      plan: paymentData.plan,
      duration: paymentData.duration,
      shift: paymentData.shift,
      seatType: paymentData.seatType,
      amount: paymentData.amount,
      addOns: paymentData.addOns,
    }
    return api.post<VerifyPaymentResponse>("/payment/verify", payload)
  },

  getPaymentHistory: async (): Promise<PaymentHistoryItem[]> => {
    return api.get<PaymentHistoryItem[]>("/payment/history")
  },
}
