import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Types based on backend entities
interface DashboardStats {
  totalUsers: number;
  totalTutors: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApplications: number;
  activeCoupons: number;
  averageRating: number;
  monthlyGrowth: {
    users: number;
    bookings: number;
    revenue: number;
  };
}

interface RecentActivity {
  id: number;
  type: "booking" | "application" | "payment" | "review";
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
}

interface TopTutor {
  id: number;
  name: string;
  subject: string;
  rating: number;
  totalBookings: number;
  revenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [topTutors, setTopTutors] = useState<TopTutor[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockStats: DashboardStats = {
      totalUsers: 1250,
      totalTutors: 89,
      totalBookings: 3420,
      totalRevenue: 125000000,
      pendingApplications: 12,
      activeCoupons: 8,
      averageRating: 4.6,
      monthlyGrowth: {
        users: 15.2,
        bookings: 23.8,
        revenue: 18.5,
      },
    };

    const mockActivities: RecentActivity[] = [
      {
        id: 1,
        type: "booking",
        description: "Nguyễn Văn A đã đặt lịch học Toán với gia sư Trần Thị B",
        timestamp: "2024-01-25T10:30:00Z",
        status: "success",
      },
      {
        id: 2,
        type: "application",
        description: "Có đơn đăng ký gia sư mới từ Phạm Văn C",
        timestamp: "2024-01-25T09:15:00Z",
        status: "info",
      },
      {
        id: 3,
        type: "payment",
        description: "Thanh toán thành công cho buổi học #1234 - 500,000 VNĐ",
        timestamp: "2024-01-25T08:45:00Z",
        status: "success",
      },
      {
        id: 4,
        type: "review",
        description: "Đánh giá 5 sao mới từ học viên Lê Thị D",
        timestamp: "2024-01-25T07:20:00Z",
        status: "success",
      },
      {
        id: 5,
        type: "booking",
        description: "Hủy buổi học #1233 - Lý do: Gia sư bận việc",
        timestamp: "2024-01-24T16:30:00Z",
        status: "warning",
      },
    ];

    const mockTopTutors: TopTutor[] = [
      {
        id: 1,
        name: "Trần Thị B",
        subject: "Toán học",
        rating: 4.9,
        totalBookings: 156,
        revenue: 12500000,
      },
      {
        id: 2,
        name: "Phạm Văn C",
        subject: "Vật lý",
        rating: 4.8,
        totalBookings: 134,
        revenue: 10800000,
      },
      {
        id: 3,
        name: "Lê Thị D",
        subject: "Hóa học",
        rating: 4.7,
        totalBookings: 98,
        revenue: 8900000,
      },
    ];

    setStats(mockStats);
    setRecentActivities(mockActivities);
    setTopTutors(mockTopTutors);
    setLoading(false);
  }, []);

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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: "rgb(148, 204, 230)" }}
          ></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "rgb(148, 204, 230)" }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Tổng quan
              </h1>
              <p className="mt-1 text-gray-600">
                Tổng quan về hoạt động và hiệu suất của hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Main Statistics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(148, 204, 230, 0.1)",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    Tổng người dùng
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalUsers.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +{stats.monthlyGrowth.users}% so với tháng trước
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
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
              </div>
            </div>

            <div
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(148, 204, 230, 0.1)",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    Tổng gia sư
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalTutors}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.pendingApplications} đơn chờ duyệt
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
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
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(148, 204, 230, 0.1)",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    Tổng buổi học
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalBookings.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +{stats.monthlyGrowth.bookings}% so với tháng trước
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
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
              </div>
            </div>

            <div
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(148, 204, 230, 0.1)",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    Tổng doanh thu
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalRevenue.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +{stats.monthlyGrowth.revenue}% so với tháng trước
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
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
              </div>
            </div>
          </div>
        )}

        {/* Secondary Statistics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div
              className="p-6 rounded-2xl shadow-lg"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Đánh giá trung bình
                </h3>
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: "rgb(148, 204, 230)" }}
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
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.averageRating}
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(stats.averageRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({stats.averageRating}/5.0)
                </span>
              </div>
            </div>

            <div
              className="p-6 rounded-2xl shadow-lg"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Mã giảm giá hoạt động
                </h3>
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: "rgb(148, 204, 230)" }}
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
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.activeCoupons}
              </div>
              <div className="text-sm text-gray-600">
                Mã giảm giá đang hoạt động
              </div>
            </div>

            <div
              className="p-6 rounded-2xl shadow-lg"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Đơn chờ duyệt
                </h3>
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: "rgb(148, 204, 230)" }}
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
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.pendingApplications}
              </div>
              <div className="text-sm text-gray-600">
                Đơn đăng ký gia sư chờ duyệt
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div
            className="p-6 rounded-2xl shadow-lg"
            style={{
              backgroundColor: "white",
              borderColor: "rgba(148, 204, 230, 0.2)",
              border: "1px solid",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Hoạt động gần đây
              </h3>
              <Link
                to="/admin/activities"
                className="text-sm font-medium"
                style={{ color: "rgb(148, 204, 230)" }}
              >
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg ${getStatusColor(
                      activity.status
                    )}`}
                    style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tutors */}
          <div
            className="p-6 rounded-2xl shadow-lg"
            style={{
              backgroundColor: "white",
              borderColor: "rgba(148, 204, 230, 0.2)",
              border: "1px solid",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Gia sư hàng đầu
              </h3>
              <Link
                to="/admin/tutors"
                className="text-sm font-medium"
                style={{ color: "rgb(148, 204, 230)" }}
              >
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {topTutors.map((tutor, index) => (
                <div
                  key={tutor.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: "rgb(148, 204, 230)" }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {tutor.name}
                      </p>
                      <p className="text-xs text-gray-500">{tutor.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">
                        {tutor.rating}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {tutor.totalBookings} buổi học
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link
              to="/admin/bookings"
              className="p-4 rounded-xl text-center hover:shadow-lg transition-all duration-200"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div
                className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: "rgb(148, 204, 230)" }}
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
              <p className="text-sm font-medium text-gray-900">Buổi học</p>
            </Link>

            <Link
              to="/admin/payments"
              className="p-4 rounded-xl text-center hover:shadow-lg transition-all duration-200"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div
                className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: "rgb(148, 204, 230)" }}
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
              <p className="text-sm font-medium text-gray-900">Thanh toán</p>
            </Link>

            <Link
              to="/admin/tutor-applications"
              className="p-4 rounded-xl text-center hover:shadow-lg transition-all duration-200"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div
                className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: "rgb(148, 204, 230)" }}
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
              </div>
              <p className="text-sm font-medium text-gray-900">Đơn đăng ký</p>
            </Link>

            <Link
              to="/admin/ratings"
              className="p-4 rounded-xl text-center hover:shadow-lg transition-all duration-200"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div
                className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: "rgb(148, 204, 230)" }}
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
              </div>
              <p className="text-sm font-medium text-gray-900">Đánh giá</p>
            </Link>

            <Link
              to="/admin/schedules"
              className="p-4 rounded-xl text-center hover:shadow-lg transition-all duration-200"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div
                className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: "rgb(148, 204, 230)" }}
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
              <p className="text-sm font-medium text-gray-900">Lịch học</p>
            </Link>

            <Link
              to="/admin/coupons"
              className="p-4 rounded-xl text-center hover:shadow-lg transition-all duration-200"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div
                className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: "rgb(148, 204, 230)" }}
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
              </div>
              <p className="text-sm font-medium text-gray-900">Mã giảm giá</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
