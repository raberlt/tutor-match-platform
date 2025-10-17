import React, { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import viData from "../pages/admin/json/dashboard.data.vi.json";
import type {
  GenericStats,
  RecentActivity,
  TopTutor,
  DashboardOverview,
  DashboardContextType,
} from "../types/dashboard";

// Create Context
export const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

// Provider Component
export const DashboardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [stats, setStats] = useState<GenericStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [topTutors, setTopTutors] = useState<TopTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      // Lấy user từ localStorage để check role
      const savedUser = localStorage.getItem("user");
      let userRole = null;
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          userRole = user.role;
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }

      // Chỉ gọi API admin dashboard khi user là ADMIN
      if (userRole !== "ADMIN") {
        // Sử dụng mock data cho non-admin users
        setStats(viData.stats as GenericStats);
        setRecentActivities(viData.activities as RecentActivity[]);
        setTopTutors(viData.topTutors as TopTutor[]);
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Load overview data (chỉ cho ADMIN)
      const overviewResponse = await fetch("/api/admin/dashboard/overview", {
        headers,
      });

      if (!overviewResponse.ok) {
        throw new Error("Failed to load dashboard overview");
      }

      const overviewData: DashboardOverview = await overviewResponse.json();

      // Transform API data to match frontend format
      const transformedStats = {
        totalUsers: overviewData.users.totalUsers,
        totalStudents: overviewData.users.totalStudents,
        totalTutors: overviewData.users.totalTutors,
        totalBookings: overviewData.bookings.totalBookings,
        pendingBookings: overviewData.bookings.pendingBookings,
        confirmedBookings: overviewData.bookings.confirmedBookings,
        completedBookings: overviewData.bookings.completedBookings,
        todayBookings: overviewData.bookings.todayBookings,
        totalRevenue: overviewData.payments.totalRevenue,
        totalPayments: overviewData.payments.totalPayments,
        completedPayments: overviewData.payments.completedPayments,
        pendingPayments: overviewData.payments.pendingPayments,
        totalCoupons: overviewData.coupons.totalCoupons,
        activeCoupons: overviewData.coupons.activeCoupons,
        usedCoupons: overviewData.coupons.usedCoupons,
        monthlyGrowth: overviewData.users.newUsersLast30Days,
      };

      setStats(transformedStats);

      // Lưu dữ liệu thật vào localStorage để sử dụng khi mất kết nối
      localStorage.setItem(
        "dashboard_stats_cache",
        JSON.stringify({
          ...transformedStats,
          lastUpdated: new Date().toISOString(),
          source: "api",
        })
      );

      // Load recent activities (mock data for now)
      setRecentActivities(viData.activities as RecentActivity[]);

      // Load top tutors (mock data for now)
      setTopTutors(viData.topTutors as TopTutor[]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Không thể tải dữ liệu dashboard");

      // Kiểm tra localStorage trước khi fallback về mock data
      const cachedStats = localStorage.getItem("dashboard_stats_cache");
      if (cachedStats) {
        try {
          const parsedStats = JSON.parse(cachedStats);
          console.log("📱 Loading cached dashboard stats:", parsedStats);
          setStats(parsedStats);
          setError(null); // Clear error vì đã load được cached data
        } catch (parseError) {
          console.error("Error parsing cached stats:", parseError);
          // Fallback to mock data
          setStats(viData.stats as GenericStats);
        }
      } else {
        // Fallback to mock data
        setStats(viData.stats as GenericStats);
      }

      setRecentActivities(viData.activities as RecentActivity[]);
      setTopTutors(viData.topTutors as TopTutor[]);
    } finally {
      setLoading(false);
    }
  };

  // Update stats function - cho phép components khác cập nhật stats
  const updateStats = (newStats: Partial<GenericStats>) => {
    setStats((prevStats) => {
      if (!prevStats) return newStats as GenericStats;

      const updatedStats = { ...prevStats, ...newStats };

      // Cập nhật localStorage với stats mới
      localStorage.setItem(
        "dashboard_stats_cache",
        JSON.stringify({
          ...updatedStats,
          lastUpdated: new Date().toISOString(),
          source: "updated",
        })
      );

      console.log("🔄 Dashboard stats updated:", updatedStats);
      console.log("📊 Stats should now reflect in DashboardCards component!");
      return updatedStats;
    });
  };

  // Refresh function
  const refreshDashboard = useCallback(async () => {
    await loadDashboardData();
  }, []);

  // Set up global refresh function
  useEffect(() => {
    window.dashboardRefresh = () => {
      console.log("🔄 Dashboard refresh triggered!");
      refreshDashboard();
    };

    return () => {
      window.dashboardRefresh = undefined;
    };
  }, [refreshDashboard]);

  // Load data on mount
  useEffect(() => {
    // Kiểm tra localStorage trước khi load từ API
    const cachedStats = localStorage.getItem("dashboard_stats_cache");
    if (cachedStats) {
      try {
        const parsedStats = JSON.parse(cachedStats);
        console.log("📱 Loading cached dashboard stats on mount:", parsedStats);
        setStats(parsedStats);
        setLoading(false);
        setError(null);
      } catch (parseError) {
        console.error("Error parsing cached stats on mount:", parseError);
        loadDashboardData();
      }
    } else {
      loadDashboardData();
    }
  }, []);

  const value: DashboardContextType = {
    stats,
    recentActivities,
    topTutors,
    loading,
    error,
    refreshDashboard,
    updateStats,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
