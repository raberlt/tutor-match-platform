import React, { useState } from "react";

interface Booking {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  subject: string;
  type: "single" | "package";
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  price: number;
  totalSessions?: number;
  completedSessions?: number;
  notes?: string;
  createdAt: string;
  packageId?: string;
  packageName?: string;
}

export const StudentManagement: React.FC = () => {
  const [bookings] = useState<Booking[]>([
    {
      id: "1",
      studentName: "Nguyễn Minh An",
      studentEmail: "an@example.com",
      studentPhone: "0901234567",
      subject: "IELTS",
      type: "package",
      date: "2025-01-20",
      startTime: "19:00",
      endTime: "20:30",
      status: "pending",
      price: 300000,
      totalSessions: 20,
      completedSessions: 0,
      notes: "Package IELTS 20 buổi",
      createdAt: "2025-01-15",
      packageId: "PKG001",
      packageName: "IELTS Complete Package",
    },
    {
      id: "2",
      studentName: "Trần Thị Bình",
      studentEmail: "binh@example.com",
      studentPhone: "0987654321",
      subject: "Tiếng Anh",
      type: "single",
      date: "2025-01-18",
      startTime: "16:00",
      endTime: "17:30",
      status: "approved",
      price: 250000,
      notes: "Buổi học Speaking",
      createdAt: "2025-01-10",
    },
    {
      id: "3",
      studentName: "Lê Văn Cường",
      studentEmail: "cuong@example.com",
      studentPhone: "0909123456",
      subject: "IELTS",
      type: "package",
      date: "2025-01-25",
      startTime: "18:30",
      endTime: "20:00",
      status: "completed",
      price: 400000,
      totalSessions: 10,
      completedSessions: 10,
      notes: "Package IELTS 10 buổi - Hoàn thành",
      createdAt: "2024-12-01",
      packageId: "PKG002",
      packageName: "IELTS Basic Package",
    },
    {
      id: "4",
      studentName: "Phạm Thị Dung",
      studentEmail: "dung@example.com",
      studentPhone: "0912345678",
      subject: "Tiếng Anh",
      type: "single",
      date: "2025-01-22",
      startTime: "14:00",
      endTime: "15:30",
      status: "rejected",
      price: 200000,
      notes: "Không phù hợp lịch trình",
      createdAt: "2025-01-12",
    },
  ]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || booking.status === filterStatus;
    const matchesType = filterType === "all" || booking.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "single":
        return "bg-gray-100 text-gray-800";
      case "package":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "single":
        return "Đơn lẻ";
      case "package":
        return "Gói học";
      default:
        return type;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleApproveBooking = (bookingId: string) => {
    console.log("Approving booking:", bookingId);
    alert("Đã chấp nhận đặt lịch!");
  };

  const handleRejectBooking = (bookingId: string) => {
    console.log("Rejecting booking:", bookingId);
    alert("Đã từ chối đặt lịch!");
  };

  const handleReportBooking = (bookingId: string) => {
    console.log("Reporting booking:", bookingId);
    alert("Đã gửi báo cáo!");
  };

  const handleSendMessage = (studentEmail: string) => {
    console.log("Opening message with student:", studentEmail);
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt lịch</h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          className="bg-white p-6 rounded-2xl shadow-lg"
          style={{
            borderColor: "rgba(148, 204, 230, 0.2)",
            borderWidth: "1px",
          }}
        >
          <div className="flex items-center">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
            >
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p
                className="text-sm font-medium"
                style={{ color: "rgb(148, 204, 230)" }}
              >
                Tổng đặt lịch
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.length}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-2xl shadow-lg"
          style={{
            borderColor: "rgba(148, 204, 230, 0.2)",
            borderWidth: "1px",
          }}
        >
          <div className="flex items-center">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
            >
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p
                className="text-sm font-medium"
                style={{ color: "rgb(148, 204, 230)" }}
              >
                Chờ duyệt
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-2xl shadow-lg"
          style={{
            borderColor: "rgba(148, 204, 230, 0.2)",
            borderWidth: "1px",
          }}
        >
          <div className="flex items-center">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
            >
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p
                className="text-sm font-medium"
                style={{ color: "rgb(148, 204, 230)" }}
              >
                Đã duyệt
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "approved").length}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-2xl shadow-lg"
          style={{
            borderColor: "rgba(148, 204, 230, 0.2)",
            borderWidth: "1px",
          }}
        >
          <div className="flex items-center">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
            >
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p
                className="text-sm font-medium"
                style={{ color: "rgb(148, 204, 230)" }}
              >
                Tổng giá trị
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(bookings.reduce((total, b) => total + b.price, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="bg-white p-6 rounded-2xl shadow-lg"
        style={{ borderColor: "rgba(148, 204, 230, 0.2)", borderWidth: "1px" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên, email hoặc môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl transition-colors duration-200"
              style={{
                borderColor: "rgba(148, 204, 230, 0.3)",
                borderWidth: "1px",
                backgroundColor: "rgba(148, 204, 230, 0.05)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgb(148, 204, 230)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(148, 204, 230, 0.3)")
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl transition-colors duration-200"
              style={{
                borderColor: "rgba(148, 204, 230, 0.3)",
                borderWidth: "1px",
                backgroundColor: "rgba(148, 204, 230, 0.05)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgb(148, 204, 230)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(148, 204, 230, 0.3)")
              }
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại đặt lịch
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl transition-colors duration-200"
              style={{
                borderColor: "rgba(148, 204, 230, 0.3)",
                borderWidth: "1px",
                backgroundColor: "rgba(148, 204, 230, 0.05)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgb(148, 204, 230)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(148, 204, 230, 0.3)")
              }
            >
              <option value="all">Tất cả loại</option>
              <option value="single">Đơn lẻ</option>
              <option value="package">Gói học</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            style={{
              borderColor: "rgba(148, 204, 230, 0.2)",
              borderWidth: "1px",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  {booking.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {booking.studentName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {booking.studentEmail}
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {getStatusText(booking.status)}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    booking.type
                  )}`}
                >
                  {getTypeText(booking.type)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Môn học:</span>
                <span className="font-medium">{booking.subject}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ngày học:</span>
                <span className="font-medium">
                  {new Date(booking.date).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-medium">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>

              {booking.type === "package" && booking.totalSessions && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiến độ:</span>
                    <span className="font-medium">
                      {booking.completedSessions || 0}/{booking.totalSessions}{" "}
                      buổi
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${calculateProgress(
                          booking.completedSessions || 0,
                          booking.totalSessions
                        )}%`,
                        backgroundColor: "rgb(148, 204, 230)",
                      }}
                    ></div>
                  </div>
                </>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Học phí:</span>
                <span
                  className="font-medium"
                  style={{ color: "rgb(148, 204, 230)" }}
                >
                  {formatPrice(booking.price)}
                </span>
              </div>

              {booking.notes && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <span className="font-medium">Ghi chú:</span> {booking.notes}
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(booking)}
                  className="flex-1 py-2 text-sm border rounded-xl transition-colors duration-200"
                  style={{
                    borderColor: "rgba(148, 204, 230, 0.3)",
                    color: "rgb(148, 204, 230)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(148, 204, 230, 0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Chi tiết
                </button>
                <button
                  onClick={() => handleSendMessage(booking.studentEmail)}
                  className="flex-1 py-2 text-sm text-white rounded-xl transition-colors duration-200"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(148, 204, 230, 0.8)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgb(148, 204, 230)")
                  }
                >
                  Nhắn tin
                </button>
              </div>

              {booking.status === "pending" && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveBooking(booking.id)}
                    className="flex-1 py-2 text-sm text-white rounded-xl transition-colors duration-200"
                    style={{ backgroundColor: "rgb(34, 197, 94)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgb(22, 163, 74)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgb(34, 197, 94)")
                    }
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => handleRejectBooking(booking.id)}
                    className="flex-1 py-2 text-sm text-white rounded-xl transition-colors duration-200"
                    style={{ backgroundColor: "rgb(239, 68, 68)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgb(220, 38, 38)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgb(239, 68, 68)")
                    }
                  >
                    Từ chối
                  </button>
                </div>
              )}

              <button
                onClick={() => handleReportBooking(booking.id)}
                className="w-full py-2 text-sm border rounded-xl transition-colors duration-200"
                style={{
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  color: "rgb(239, 68, 68)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(239, 68, 68, 0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Báo cáo
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div
          className="bg-white p-12 rounded-2xl shadow-lg text-center"
          style={{
            borderColor: "rgba(148, 204, 230, 0.2)",
            borderWidth: "1px",
          }}
        >
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không có đặt lịch nào
          </h3>
          <p className="text-gray-600 mb-4">
            Hãy thử điều chỉnh bộ lọc để xem các đặt lịch khác
          </p>
        </div>
      )}

      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div
            className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-2xl bg-white"
            style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
          >
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết đặt lịch - {selectedBooking.studentName}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Học viên
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.studentName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.studentEmail}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.studentPhone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày đặt lịch
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedBooking.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>

                {/* Booking Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Thông tin đặt lịch
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Môn học
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedBooking.subject}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Loại đặt lịch
                      </label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          selectedBooking.type
                        )}`}
                      >
                        {getTypeText(selectedBooking.type)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ngày học
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedBooking.date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Thời gian
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedBooking.startTime} - {selectedBooking.endTime}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Trạng thái
                      </label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedBooking.status
                        )}`}
                      >
                        {getStatusText(selectedBooking.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Học phí
                      </label>
                      <p
                        className="mt-1 text-sm font-medium"
                        style={{ color: "rgb(148, 204, 230)" }}
                      >
                        {formatPrice(selectedBooking.price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Package Progress */}
                {selectedBooking.type === "package" &&
                  selectedBooking.totalSessions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Tiến độ gói học
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p
                            className="text-2xl font-bold"
                            style={{ color: "rgb(148, 204, 230)" }}
                          >
                            {selectedBooking.totalSessions}
                          </p>
                          <p className="text-sm text-gray-600">Tổng buổi</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {selectedBooking.completedSessions || 0}
                          </p>
                          <p className="text-sm text-gray-600">Hoàn thành</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Tỷ lệ hoàn thành</span>
                          <span>
                            {calculateProgress(
                              selectedBooking.completedSessions || 0,
                              selectedBooking.totalSessions
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${calculateProgress(
                                selectedBooking.completedSessions || 0,
                                selectedBooking.totalSessions
                              )}%`,
                              backgroundColor: "rgb(148, 204, 230)",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Notes */}
                {selectedBooking.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ghi chú
                    </label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-200"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleSendMessage(selectedBooking.studentEmail);
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors duration-200"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(148, 204, 230, 0.8)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgb(148, 204, 230)")
                  }
                >
                  Nhắn tin
                </button>
                {selectedBooking.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleApproveBooking(selectedBooking.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors duration-200"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => {
                        handleRejectBooking(selectedBooking.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors duration-200"
                    >
                      Từ chối
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    handleReportBooking(selectedBooking.id);
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium border rounded-xl transition-colors duration-200"
                  style={{
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    color: "rgb(239, 68, 68)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(239, 68, 68, 0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Báo cáo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
