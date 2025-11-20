import { api } from "./api";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: "active" | "expired" | "expiring" | "No active plan";
  startDate: string | null;
  endDate: string | null;
  currentPlanAmount: number;
  totalPaid: number;
  daysRemaining: number;
  isExpiringSoon: boolean;
  createdAt: string;
}

export interface UserDetailsResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      createdAt: string;
    };
    currentSubscription: {
      plan: string;
      status: string;
      startDate: string;
      expiryDate: string;
      daysRemaining: number;
    } | null;
    totalPaid: number;
    paymentHistory: Array<{
      _id: string;
      amount: number;
      currency: string;
      status: string;
      plan: string;
      paymentId: string;
      orderId: string;
      createdAt: string;
    }>;
    subscriptionHistory: Array<{
      plan: string;
      status: string;
      startDate: string;
      expiryDate: string;
    }>;
  };
}

export interface AdminUsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
    };
  };
}

export interface DashboardStats {
  success: boolean;
  data: {
    stats: {
      totalRevenue: number;
      monthlyRevenue: number;
      activeStudents: number;
      expiringSubscriptions: number;
      newSignups: number;
      renewalRate: number;
    };
    recentActivities: Array<{
      type: "signup" | "renewal" | "expiry";
      user: string;
      action: string;
      time: string;
    }>;
    expiringToday: Array<{
      name: string;
      plan: string;
      phone: string;
    }>;
  };
}

export type SeatType = "REGULAR" | "SPECIAL";
export type OccupancyType = "FULL_DAY" | "MORNING" | "EVENING";

export interface Seat {
  _id: string;
  seatNumber: string;
  type: SeatType;
  occupied: boolean;
  occupancyType: OccupancyType | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeatsResponse {
  success: boolean;
  data: Seat[];
}

export interface SeatResponse {
  success: boolean;
  data: Seat;
}

export interface DeleteSeatsResponse {
  success: boolean;
  data: { deletedCount: number };
}

export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: () => {
    return api.get<DashboardStats>("/api/admin/dashboard-stats");
  },

  // Get all users with filters
  getUsers: (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    return api.get<AdminUsersResponse>(
      `/api/admin/users${queryString ? `?${queryString}` : ""}`
    );
  },

  // Get user details
  getUserDetails: (userId: string) => {
    return api.get<UserDetailsResponse>(`/api/admin/users/${userId}`);
  },

  // Seats
  getSeats: () => api.get<SeatsResponse>("/api/admin/seats"),
  updateSeat: (id: string, body: Partial<Pick<Seat, "occupied" | "occupancyType">>) =>
    api.patch<SeatResponse>(`/api/admin/seats/${id}`, body),
  addSeatsBulk: (type: SeatType, count: number) =>
    api.post<SeatsResponse>("/api/admin/seats/bulk-add", { type, count }),
  deleteSeats: (ids: string[]) =>
    api.delWithBody<DeleteSeatsResponse>("/api/admin/seats", { ids }),
};