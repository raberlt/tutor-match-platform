import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import type {
  Booking,
  BookingListResponse,
  BookingStats,
  BookingStatus,
} from "../../types";

// Icons
const CalendarIcon = () => (
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

const ClockIcon = () => (
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
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const UserIcon = () => (
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
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const BookIcon = () => (
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
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const PlusIcon = () => (
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
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const FilterIcon = () => (
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
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const MySessions: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<
    BookingStatus | undefined
  >();

  useEffect(() => {
    loadBookings();
    loadStats();
  }, [currentPage, selectedStatus]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings(
        currentPage,
        10,
        selectedStatus
      );
      setBookings(response.content);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await bookingService.getStudentBookingStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy booking này?")) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      loadBookings();
      loadStats();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "TUTOR_APPROVED":
        return "bg-blue-100 text-blue-800";
      case "PAYMENT_PENDING":
        return "bg-orange-100 text-orange-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "TUTOR_APPROVED":
        return "Giảng viên đã chấp nhận";
      case "PAYMENT_PENDING":
        return "Chờ thanh toán";
      case "PAID":
        return "Đã thanh toán";
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

  const getBookingTypeText = (type: string) => {
    switch (type) {
      case "TRIAL":
        return "Học thử";
      case "SINGLE_SESSION":
        return "Học buổi đơn";
      case "PACKAGE":
        return "Học theo gói";
      default:
        return type;
    }
  };

  const canCancel = (status: BookingStatus) => {
    return status === "PENDING" || status === "PAYMENT_PENDING";
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
              style={{ borderColor: "rgb(148, 204, 230)" }}
            ></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
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
              <BookIcon />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Buổi Học Của Tôi
              </h1>
              <p className="mt-1 text-gray-600">
                Quản lý và theo dõi các buổi học đã đặt
              </p>
            </div>
          </div>
        </div>

        {/* Thống kê - Thiết kế mới */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Tổng Booking */}
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
                    Tổng Booking
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalBookings}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <BookIcon />
                </div>
              </div>
              <div
                className="mt-3 flex items-center text-sm"
                style={{ color: "rgb(148, 204, 230)" }}
              >
                <span className="font-medium">Tất cả buổi học</span>
              </div>
            </div>

            {/* Chờ xử lý */}
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
                    Chờ xử lý
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.pendingBookings}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <ClockIcon />
                </div>
              </div>
              <div
                className="mt-3 flex items-center text-sm"
                style={{ color: "rgb(148, 204, 230)" }}
              >
                <span className="font-medium">Đang chờ phản hồi</span>
              </div>
            </div>

            {/* Hoàn thành */}
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
                    Hoàn thành
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.completedBookings}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div
                className="mt-3 flex items-center text-sm"
                style={{ color: "rgb(148, 204, 230)" }}
              >
                <span className="font-medium">Đã hoàn thành</span>
              </div>
            </div>

            {/* Đã hủy */}
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
                    Đã hủy
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.cancelledBookings}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <div
                className="mt-3 flex items-center text-sm"
                style={{ color: "rgb(148, 204, 230)" }}
              >
                <span className="font-medium">Đã hủy bỏ</span>
              </div>
            </div>
          </div>
        )}

        {/* Bộ lọc và Hành động nhanh */}
        <div
          className="p-6 rounded-2xl shadow-lg mb-6"
          style={{
            backgroundColor: "white",
            borderColor: "rgba(148, 204, 230, 0.2)",
            border: "1px solid",
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Bộ lọc */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <FilterIcon />
                <select
                  value={selectedStatus || ""}
                  onChange={(e) =>
                    setSelectedStatus(
                      (e.target.value as BookingStatus) || undefined
                    )
                  }
                  className="pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700 font-medium transition-colors duration-200"
                  style={{
                    borderColor: "rgba(148, 204, 230, 0.3)",
                    focusRingColor: "rgb(148, 204, 230)",
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="TUTOR_APPROVED">
                    Giảng viên đã chấp nhận
                  </option>
                  <option value="PAYMENT_PENDING">Chờ thanh toán</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="IN_PROGRESS">Đang diễn ra</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="REJECTED">Bị từ chối</option>
                </select>
              </div>
            </div>

            {/* Hành động nhanh */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/find-tutor"
                className="inline-flex items-center px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors duration-200 font-medium"
                style={{
                  backgroundColor: "rgba(148, 204, 230, 0.1)",
                  color: "rgb(148, 204, 230)",
                  focusRingColor: "rgb(148, 204, 230)",
                }}
              >
                <UserIcon />
                <span className="ml-2">Tìm gia sư</span>
              </Link>

              <Link
                to="/user/create-booking"
                className="inline-flex items-center px-6 py-3 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: "rgb(148, 204, 230)",
                  focusRingColor: "rgb(148, 204, 230)",
                }}
              >
                <PlusIcon />
                <span className="ml-2">Đặt lịch mới</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Danh sách booking - Thiết kế mới */}
        {bookings.length === 0 ? (
          <div
            className="rounded-2xl shadow-lg"
            style={{
              backgroundColor: "white",
              borderColor: "rgba(148, 204, 230, 0.2)",
              border: "1px solid",
            }}
          >
            <div className="text-center py-16">
              <div
                className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <BookIcon />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có buổi học nào
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Bắt đầu hành trình học tập của bạn bằng cách đặt lịch học đầu
                tiên với gia sư phù hợp.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/find-tutor"
                  className="inline-flex items-center px-6 py-3 rounded-xl transition-colors duration-200 font-medium"
                  style={{
                    backgroundColor: "rgba(148, 204, 230, 0.1)",
                    color: "rgb(148, 204, 230)",
                  }}
                >
                  <UserIcon />
                  <span className="ml-2">Tìm gia sư</span>
                </Link>
                <Link
                  to="/user/create-booking"
                  className="inline-flex items-center px-6 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <PlusIcon />
                  <span className="ml-2">Đặt lịch mới</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                style={{
                  backgroundColor: "white",
                  borderColor: "rgba(148, 204, 230, 0.2)",
                  border: "1px solid",
                }}
              >
                {/* Header với status */}
                <div
                  className="p-6 border-b"
                  style={{ borderColor: "rgba(148, 204, 230, 0.1)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      >
                        {getBookingTypeText(booking.bookingType)}
                      </span>
                    </div>
                    {canCancel(booking.status) && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors duration-200"
                      >
                        Hủy
                      </button>
                    )}
                  </div>

                  {/* Thông tin gia sư */}
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgb(148, 204, 230)" }}
                    >
                      <span className="text-white font-semibold text-lg">
                        {booking.tutor.user.firstName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.tutor.user.firstName}{" "}
                        {booking.tutor.user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {booking.subject.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Thời gian */}
                    <div className="flex items-center space-x-3 text-gray-600">
                      <CalendarIcon />
                      <span className="text-sm font-medium">
                        {booking.date}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                      <ClockIcon />
                      <span className="text-sm font-medium">
                        {booking.fromTime} - {booking.toTime}
                      </span>
                    </div>

                    {/* Ghi chú */}
                    {booking.note && (
                      <div
                        className="rounded-lg p-3"
                        style={{ backgroundColor: "rgba(148, 204, 230, 0.05)" }}
                      >
                        <p className="text-sm text-gray-700">{booking.note}</p>
                      </div>
                    )}

                    {/* Giá */}
                    {booking.amount > 0 && (
                      <div
                        className="flex items-center justify-between pt-2 border-t"
                        style={{ borderColor: "rgba(148, 204, 230, 0.1)" }}
                      >
                        <span className="text-sm font-medium text-gray-600">
                          Tổng tiền:
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {booking.amount.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="mt-6 pt-4 border-t"
                    style={{ borderColor: "rgba(148, 204, 230, 0.1)" }}
                  >
                    <Link
                      to={`/user/booking-detail/${booking.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 text-white rounded-xl transition-colors duration-200 font-medium"
                      style={{ backgroundColor: "rgb(148, 204, 230)" }}
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phân trang - Thiết kế mới */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav
              className="flex items-center space-x-2 rounded-2xl shadow-lg p-2"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Đầu
              </button>

              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Trước
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                        currentPage === pageNum
                          ? "text-white"
                          : "text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                      style={{
                        backgroundColor:
                          currentPage === pageNum
                            ? "rgb(148, 204, 230)"
                            : "white",
                      }}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Sau
              </button>

              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cuối
              </button>
            </nav>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySessions;
