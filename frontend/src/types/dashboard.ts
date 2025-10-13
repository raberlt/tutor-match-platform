// Types for Dashboard Context
export type GenericStats = Record<string, unknown>;

export interface RecentActivity {
  id: number;
  type: "booking" | "application" | "payment" | "review";
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
}

export interface TopTutor {
  id: number;
  name: string;
  subject: string;
  rating: number;
  totalBookings: number;
  revenue: number;
}

export interface DashboardOverview {
  users: {
    totalUsers: number;
    totalStudents: number;
    totalTutors: number;
    newUsersLast30Days: number;
  };
  bookings: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    todayBookings: number;
  };
  payments: {
    totalPayments: number;
    completedPayments: number;
    pendingPayments: number;
    totalRevenue: number;
  };
  coupons: {
    totalCoupons: number;
    activeCoupons: number;
    usedCoupons: number;
  };
}

// Context Type
export interface DashboardContextType {
  stats: GenericStats | null;
  recentActivities: RecentActivity[];
  topTutors: TopTutor[];
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  updateStats: (newStats: Partial<GenericStats>) => void;
}

// Extend Window interface for dashboard refresh function
declare global {
  interface Window {
    dashboardRefresh?: () => void;
  }
}

