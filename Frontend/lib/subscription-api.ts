import { api } from "./api"

// ---------- Interfaces ----------
export interface Subscription {
  id: string
  plan: string
  status: string
  startDate?: string
  expiryDate?: string
  duration?: string
  shift?: string
  seatType?: string
  amountPaid?: number
  daysRemaining?: number
  [key: string]: any
}

export interface SubscriptionResponse {
  success: boolean
  data?: Subscription
  message?: string
  [key: string]: any
}

export interface RevenueMetricsResponse {
  success: boolean
  data: {
    totalRevenue: number
    monthlyRevenue: Array<{ _id: number; total: number }>
    subscriptionBreakdown: Array<{ _id: string; total: number }>
    dailyRevenue?: Array<{ day: string; amount: number }>
  }
  message?: string
}

// ---------- API Functions ----------
export const subscriptionApi = {
  getCurrentSubscription: async (): Promise<SubscriptionResponse> => {
    return api.get<SubscriptionResponse>("/subscription/current")
  },

  createSubscription: async (planData: { planType: string; duration?: number }): Promise<SubscriptionResponse> => {
    return api.post<SubscriptionResponse>("/subscription", planData)
  },

  renewSubscription: async (subscriptionId: string): Promise<SubscriptionResponse> => {
    return api.post<SubscriptionResponse>(`/subscription/${subscriptionId}/renew`)
  },

  cancelSubscription: async (subscriptionId: string): Promise<SubscriptionResponse> => {
    return api.put<SubscriptionResponse>(`/subscription/${subscriptionId}/status`, {
      status: "cancelled",
    })
  },

  getRevenueMetrics: async (params: { startDate?: string; endDate?: string }): Promise<RevenueMetricsResponse> => {
    const queryParams = new URLSearchParams()
    if (params.startDate) queryParams.append("startDate", params.startDate)
    if (params.endDate) queryParams.append("endDate", params.endDate)
    
    return api.get<RevenueMetricsResponse>(`/admin/revenue?${queryParams.toString()}`)
  },
}
