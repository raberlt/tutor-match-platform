import React from "react";
import { useI18n } from "../../../contexts/I18nContext";
import { useDashboard } from "../../../hooks/useDashboard";
import { StatCard } from "./StatCard";

// Generic type cho stats - hoàn toàn linh hoạt
type GenericStats = Record<string, unknown>;
type MonthlyGrowth = {
  users: number;
  bookings: number;
  revenue: number;
};

export const DashboardCards: React.FC = () => {
  const { t } = useI18n();
  const { stats } = useDashboard();

  // ✅ DEBUG: Log stats khi component re-render
  console.log("📊 DashboardCards re-rendered with stats:", stats);

  if (!stats) {
    return <div>Loading...</div>;
  }
  const color = "rgb(148, 204, 230)";

  // Safe access to monthlyGrowth with fallback
  const monthlyGrowth = (stats.monthlyGrowth as MonthlyGrowth) || {
    users: 0,
    bookings: 0,
    revenue: 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <StatCard
        title={t("stats.totalUsers")}
        value={stats.totalUsers as number}
        growth={monthlyGrowth.users}
        icon={
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        }
        color={color}
        formatType="number"
      />

      <StatCard
        title={t("stats.totalTutors")}
        value={stats.totalTutors as number}
        growth={monthlyGrowth.users}
        icon={
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
        color={color}
        formatType="number"
      />

      <StatCard
        title={t("stats.totalBookings")}
        value={stats.totalBookings as number}
        growth={monthlyGrowth.bookings}
        icon={
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
        color={color}
        formatType="number"
      />

      <StatCard
        title={t("stats.totalRevenue")}
        value={stats.totalRevenue as number}
        growth={monthlyGrowth.revenue}
        icon={
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        }
        color={color}
        formatType="currency"
      />
    </div>
  );
};
