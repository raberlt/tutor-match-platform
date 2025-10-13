import React from "react";
import { useI18n } from "../../../contexts/I18nContext";
import { useDashboard } from "../../../hooks/useDashboard";
import { StatCard } from "./StatCard";

// Generic type cho stats - hoàn toàn linh hoạt
type GenericStats = Record<string, unknown>;

export const SecondaryStatsCards: React.FC = () => {
  const { t } = useI18n();
  const { stats } = useDashboard();

  if (!stats) {
    return <div>Loading...</div>;
  }
  const color = "rgb(148, 204, 230)";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
      <StatCard
        title={t("stats.averageRating")}
        value={stats.averageRating as number}
        icon={
          <svg
            className="w-5 h-5"
            style={{ color }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        }
        color={color}
        formatType="number"
        showGrowth={false}
        showStars={true}
      />

      <StatCard
        title={t("stats.activeCoupons")}
        value={stats.activeCoupons as number}
        icon={
          <svg
            className="w-5 h-5"
            style={{ color }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        }
        color={color}
        formatType="number"
        showGrowth={false}
      />

      <StatCard
        title={t("stats.pendingApplications")}
        value={stats.pendingApplications as number}
        icon={
          <svg
            className="w-5 h-5"
            style={{ color }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
        color={color}
        formatType="number"
        showGrowth={false}
      />
    </div>
  );
};
