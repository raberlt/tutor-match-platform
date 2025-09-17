import React from "react";
import { Link } from "react-router-dom";

export const AdminDashboard: React.FC = () => {
  const stats = [
    {
      label: "Tổng người dùng",
      value: "2,345",
      change: "+12%",
      color: "blue",
      icon: "👥",
    },
    {
      label: "Gia sư hoạt động",
      value: "567",
      change: "+8%",
      color: "green",
      icon: "👨‍🏫",
    },
    {
      label: "Buổi học hôm nay",
      value: "89",
      change: "+15%",
      color: "yellow",
      icon: "📚",
    },
    {
      label: "Doanh thu tháng",
      value: "125M",
      change: "+23%",
      color: "purple",
      icon: "💰",
    },
  ];

  const recentActivities = [
    {
      type: "user_registered",
      user: "Nguyễn Văn A",
      time: "5 phút trước",
      icon: "👤",
    },
    {
      type: "tutor_approved",
      user: "Trần Thị B",
      time: "10 phút trước",
      icon: "✅",
    },
    {
      type: "session_completed",
      user: "Lê Văn C",
      time: "15 phút trước",
      icon: "📖",
    },
    {
      type: "payment_received",
      user: "Phạm Thị D",
      time: "20 phút trước",
      icon: "💳",
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      name: "Hoàng Minh E",
      type: "Đăng ký gia sư",
      subject: "Tiếng Anh",
      submitted: "2 ngày trước",
    },
    {
      id: 2,
      name: "Lý Thành F",
      type: "Đăng ký gia sư",
      subject: "Toán",
      submitted: "1 ngày trước",
    },
    {
      id: 3,
      name: "Đinh Văn G",
      type: "Cập nhật hồ sơ",
      subject: "Hóa học",
      submitted: "3 giờ trước",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Bảng điều khiển Admin 🛡️</h1>
        <p className="opacity-90">
          Quản lý và giám sát hoạt động hệ thống TutorMatch
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div
                  className={`text-xs font-medium text-${stat.color}-600 mt-1`}
                >
                  {stat.change} so với tháng trước
                </div>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group"
        >
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-medium text-gray-900 group-hover:text-red-600">
            Quản lý Users
          </h3>
        </Link>

        <Link
          to="/admin/tutors"
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group"
        >
          <div className="text-2xl mb-2">👨‍🏫</div>
          <h3 className="font-medium text-gray-900 group-hover:text-red-600">
            Quản lý Tutors
          </h3>
        </Link>

        <Link
          to="/admin/sessions"
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group"
        >
          <div className="text-2xl mb-2">📚</div>
          <h3 className="font-medium text-gray-900 group-hover:text-red-600">
            Quản lý Sessions
          </h3>
        </Link>

        <Link
          to="/admin/reports"
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group"
        >
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-medium text-gray-900 group-hover:text-red-600">
            Báo cáo
          </h3>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Chờ phê duyệt
              </h2>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingApprovals.length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-medium text-sm">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.type} - {item.subject}
                      </p>
                      <p className="text-xs text-gray-400">{item.submitted}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      Phê duyệt
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Hoạt động gần đây
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity, index) => (
              <div key={index} className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="text-xl">{activity.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.type === "user_registered" &&
                        "đã đăng ký tài khoản mới"}
                      {activity.type === "tutor_approved" &&
                        "đã được phê duyệt làm gia sư"}
                      {activity.type === "session_completed" &&
                        "đã hoàn thành buổi học"}
                      {activity.type === "payment_received" &&
                        "đã thanh toán thành công"}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Thống kê người dùng
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Học viên</span>
                <span className="text-sm font-medium text-gray-900">
                  1,678 (72%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "72%" }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gia sư</span>
                <span className="text-sm font-medium text-gray-900">
                  567 (24%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "24%" }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Admin</span>
                <span className="text-sm font-medium text-gray-900">
                  100 (4%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: "4%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Doanh thu 7 ngày qua
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(Math.random() * 20 + 5).toFixed(1)}M
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
