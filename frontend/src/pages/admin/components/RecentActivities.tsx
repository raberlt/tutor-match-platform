import React from "react";
import { useDashboard } from "../../../hooks/useDashboard";
import { formatTimeAgo } from "../../../utils/format";

interface Activity {
  id: number;
  type: "booking" | "application" | "payment" | "review";
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "text-green-600";
    case "warning":
      return "text-yellow-600";
    case "error":
      return "text-red-600";
    case "info":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "booking":
      return (
        <svg
          className="w-5 h-5"
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
      );
    case "application":
      return (
        <svg
          className="w-5 h-5"
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
      );
    case "payment":
      return (
        <svg
          className="w-5 h-5"
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
      );
    case "review":
      return (
        <svg
          className="w-5 h-5"
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
      );
    default:
      return null;
  }
};

export const RecentActivities: React.FC = () => {
  const locale = "vi";
  const { recentActivities } = useDashboard();
  return (
    <div
      className="p-4 rounded-xl shadow-md"
      style={{
        backgroundColor: "white",
        borderColor: "rgba(148, 204, 230, 0.2)",
        border: "1px solid",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Hoạt động gần đây
        </h3>
        <a
          className="text-sm font-medium"
          style={{ color: "rgb(148, 204, 230)" }}
        >
          Xem tất cả
        </a>
      </div>
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div
              className={`p-2 rounded-xl ${getStatusColor(activity.status)}`}
              style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
            >
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatTimeAgo(activity.timestamp, locale)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
