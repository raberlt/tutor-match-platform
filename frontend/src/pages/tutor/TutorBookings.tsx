import React, { useState } from "react";

const TutorBookings: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Mock data for demonstration
  const mockStats = {
    totalBookings: 24,
    pendingBookings: 3,
    completedBookings: 18,
    cancelledBookings: 3,
    revenue: 2450000,
  };

  const mockBookings = [
    {
      id: 1,
      studentName: "Nguyễn Văn A",
      studentAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      subject: "Toán học",
      date: "27/09/2025",
      time: "14:00 - 15:30",
      type: "Học thử",
      status: "PENDING",
      amount: 150000,
      note: "Học sinh muốn học về đạo hàm",
    },
    {
      id: 2,
      studentName: "Trần Thị B",
      studentAvatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      subject: "Tiếng Anh",
      date: "28/09/2025",
      time: "09:00 - 10:30",
      type: "Gói 12 buổi",
      status: "CONFIRMED",
      amount: 1800000,
      note: "Luyện thi IELTS",
    },
    {
      id: 3,
      studentName: "Lê Văn C",
      studentAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      subject: "Vật lý",
      date: "26/09/2025",
      time: "16:00 - 17:30",
      type: "Buổi đơn",
      status: "COMPLETED",
      amount: 200000,
      note: "Ôn tập chương điện học",
    },
    {
      id: 4,
      studentName: "Phạm Thị D",
      studentAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      subject: "Hóa học",
      date: "25/09/2025",
      time: "10:00 - 11:30",
      type: "Gói 6 buổi",
      status: "CANCELLED",
      amount: 900000,
      note: "Học sinh hủy do bận việc",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REJECTED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "IN_PROGRESS":
        return "Đang diễn ra";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "REJECTED":
        return "Bị từ chối";
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    if (type.includes("Học thử")) return "bg-orange-100 text-orange-800";
    if (type.includes("Gói")) return "bg-indigo-100 text-indigo-800";
    return "bg-blue-100 text-blue-800";
  };

  const filteredBookings =
    selectedStatus === "all"
      ? mockBookings
      : mockBookings.filter((booking) => booking.status === selectedStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Quản lý đặt lịch
              </h1>
              <p className="text-lg text-gray-600">
                Theo dõi và quản lý các buổi học đã đặt
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg">
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Tạo lịch mới
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng đặt lịch
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockStats.totalBookings}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Chờ xác nhận
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {mockStats.pendingBookings}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-600">
                  {mockStats.completedBookings}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
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
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                <p className="text-3xl font-bold text-red-600">
                  {mockStats.cancelledBookings}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {mockStats.revenue.toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-indigo-600"
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

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="IN_PROGRESS">Đang diễn ra</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="REJECTED">Bị từ chối</option>
            </select>

            <div className="flex items-center space-x-2">
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Từ ngày"
              />
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Đến ngày"
              />
            </div>

            <input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có đặt lịch nào
              </h3>
              <p className="text-gray-600">
                Học sinh sẽ có thể đặt lịch học với bạn tại đây.
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Student Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={booking.studentAvatar}
                        alt={booking.studentName}
                        className="w-16 h-16 rounded-full object-cover border-4 border-gray-100"
                      />
                    </div>

                    {/* Booking Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.studentName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusText(booking.status)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            booking.type
                          )}`}
                        >
                          {booking.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {booking.subject}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5 text-gray-400"
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
                          <span className="text-sm text-gray-600">
                            {booking.date}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {booking.time}
                          </span>
                        </div>
                      </div>

                      {booking.note && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                            <span className="font-medium">Ghi chú:</span>{" "}
                            {booking.note}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-indigo-600">
                            {booking.amount.toLocaleString("vi-VN")} VNĐ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {booking.status === "PENDING" && (
                      <>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm">
                          Chấp nhận
                        </button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                          Từ chối
                        </button>
                      </>
                    )}

                    {booking.status === "CONFIRMED" && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                        Bắt đầu
                      </button>
                    )}

                    {booking.status === "IN_PROGRESS" && (
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm">
                        Hoàn thành
                      </button>
                    )}

                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Trước
              </button>
              <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg">
                1
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Sau
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorBookings;
