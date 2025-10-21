import React from "react";
import { Link } from "react-router-dom";

export const TutorDashboard: React.FC = () => {
  const upcomingSessions = [
    {
      id: 1,
      student: "Nguyễn Minh An",
      subject: "Tiếng Anh",
      date: "2025-01-15",
      time: "19:00",
      type: "online",
    },
    {
      id: 2,
      student: "Trần Thị Hoa",
      subject: "IELTS",
      date: "2025-01-16",
      time: "16:00",
      type: "offline",
    },
    {
      id: 3,
      student: "Lê Văn Nam",
      subject: "Toán",
      date: "2025-01-17",
      time: "18:30",
      type: "online",
    },
  ];

  const stats = [
    { label: "Tổng học viên", value: 24, change: "+2", color: "blue" },
    { label: "Buổi học tuần này", value: 12, change: "+3", color: "green" },
    {
      label: "Thu nhập tháng này",
      value: "12.5M",
      change: "+15%",
      color: "yellow",
    },
    {
      label: "Đánh giá trung bình",
      value: "4.8",
      change: "+0.2",
      color: "purple",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Tổng quan về hoạt động giảng dạy của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng học viên</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Buổi học tuần này
              </p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-yellow-500">
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Thu nhập tháng này
              </p>
              <p className="text-2xl font-bold text-gray-900">12.5M</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500">
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
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Đánh giá trung bình
              </p>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/tutor/bookings"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
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
            to="/tutor/revenue"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Doanh thu</p>
                <p className="text-xs text-gray-500">Theo dõi thu nhập</p>
              </div>
            </div>
          </Link>

          <Link
            to="/tutor/profile"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Quản lý hồ sơ
                </p>
                <p className="text-xs text-gray-500">Cập nhật thông tin</p>
              </div>
            </div>
          </Link>

          <Link
            to="/tutor/inbox"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Hộp thư</p>
                <p className="text-xs text-gray-500">Tin nhắn học viên</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Buổi học sắp tới
            </h2>
            <Link
              to="/tutor/bookings"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.student}
                    </p>
                    <p className="text-sm text-gray-500">{session.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(session.date).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-sm text-gray-500">{session.time}</p>
                </div>
                <div className="ml-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      session.type === "online"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {session.type === "online" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Đánh giá gần đây
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-xs">A</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Nguyễn Minh An
                </p>
                <div className="flex items-center mt-1">
                  <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                  <span className="ml-2 text-xs text-gray-500">
                    2 ngày trước
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  "Cô dạy rất hay và dễ hiểu. Con em tiến bộ rất nhiều!"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Thống kê tuần này
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số giờ dạy</span>
                <span className="text-sm font-medium text-gray-900">
                  24 giờ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số học viên</span>
                <span className="text-sm font-medium text-gray-900">
                  8 học viên
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Thu nhập</span>
                <span className="text-sm font-medium text-gray-900">
                  3.2M VND
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Đánh giá trung bình
                </span>
                <span className="text-sm font-medium text-gray-900">4.8/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


