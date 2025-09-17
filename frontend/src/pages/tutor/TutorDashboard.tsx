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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Chào buổi sáng, Gia sư! 🌟</h1>
        <p className="opacity-90">
          Bạn có {upcomingSessions.length} buổi học sắp tới hôm nay
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`text-xs font-medium px-2 py-1 rounded-full bg-${stat.color}-100 text-${stat.color}-800`}
              >
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/tutor/schedule"
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group"
        >
          <div className="text-2xl mb-2">📅</div>
          <h3 className="font-medium text-gray-900 group-hover:text-green-600">
            Xem lịch dạy
          </h3>
        </Link>

        <Link
          to="/tutor/students"
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group"
        >
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-medium text-gray-900 group-hover:text-green-600">
            Học viên
          </h3>
        </Link>

        <Link
          to="/tutor/earnings"
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group"
        >
          <div className="text-2xl mb-2">💰</div>
          <h3 className="font-medium text-gray-900 group-hover:text-green-600">
            Thu nhập
          </h3>
        </Link>

        <Link
          to="/tutor/profile"
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group"
        >
          <div className="text-2xl mb-2">👤</div>
          <h3 className="font-medium text-gray-900 group-hover:text-green-600">
            Hồ sơ
          </h3>
        </Link>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Buổi học sắp tới
            </h2>
            <Link
              to="/tutor/schedule"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Xem lịch đầy đủ
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium text-sm">
                        {session.student.split(" ")[0].charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.student} - {session.subject}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.date} lúc {session.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.type === "online"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {session.type === "online" ? "Online" : "Tại nhà"}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
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
