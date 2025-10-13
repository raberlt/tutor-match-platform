import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../contexts/I18nContext";
import { useDashboard } from "../../hooks/useDashboard";
import { DashboardCards } from "./components/DashboardCards";
import { RecentActivities } from "./components/RecentActivities";
import { TopTutors } from "./components/TopTutors";
import { SecondaryStatsCards } from "./components/SecondaryStatsCards";

const AdminDashboard: React.FC = () => {
  const { t } = useI18n();
  const { loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("dashboard.title")}
        </h1>
        <p className="text-gray-600">{t("dashboard.subtitle")}</p>
      </div>

      {/* Main Stats Cards */}
      <DashboardCards />

      {/* Secondary Stats */}
      <SecondaryStatsCards />

      {/* Recent Activities and Top Tutors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentActivities />  
        <TopTutors />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Quản lý người dùng
                </p>
                <p className="text-xs text-gray-500">
                  Xem và quản lý tài khoản
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/tutor-approval"
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Duyệt hồ sơ gia sư
                </p>
                <p className="text-xs text-gray-500">Xét duyệt đơn đăng ký</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/bookings"
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
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
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Quản lý đặt lịch
                </p>
                <p className="text-xs text-gray-500">Xem và quản lý lịch học</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/payments"
            className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
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
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Quản lý thanh toán
                </p>
                <p className="text-xs text-gray-500">
                  Xem và quản lý giao dịch
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
