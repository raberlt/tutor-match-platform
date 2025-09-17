import React, { useState, useEffect } from "react";
import { bookingService } from "../../services/bookingService";
import type {
  Booking,
  BookingListResponse,
  BookingStats,
  BookingStatus,
} from "../../types";

const TutorBookings: React.FC = () => {
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
      const response = await bookingService.getTutorBookings(
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
      const statsData = await bookingService.getTutorBookingStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleApproveBooking = async (bookingId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn chấp nhận booking này?")) {
      return;
    }

    try {
      await bookingService.acceptBooking(bookingId);
      loadBookings();
      loadStats();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối booking này?")) {
      return;
    }

    try {
      await bookingService.rejectBooking(bookingId);
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

  const canApprove = (booking: Booking) => {
    return booking.bookingType === "PACKAGE" && booking.status === "PENDING";
  };

  const canReject = (booking: Booking) => {
    return booking.bookingType === "PACKAGE" && booking.status === "PENDING";
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Booking</h1>
          <p className="mt-2 text-gray-600">Quản lý các booking của học sinh</p>
        </div>

        {/* Thống kê */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
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
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng Booking
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalBookings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.pendingBookings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Hoàn thành
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.completedBookings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.cancelledBookings}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bộ lọc */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedStatus || ""}
              onChange={(e) =>
                setSelectedStatus(
                  (e.target.value as BookingStatus) || undefined
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="TUTOR_APPROVED">Giảng viên đã chấp nhận</option>
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

        {/* Danh sách booking */}
        <div className="bg-white shadow rounded-lg">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chưa có booking nào
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Chưa có học sinh nào đặt lịch với bạn.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusText(booking.status)}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getBookingTypeText(booking.bookingType)}
                        </span>
                      </div>

                      <div className="mt-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {booking.student.user.firstName}{" "}
                          {booking.student.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.subject.name} • {booking.date} •{" "}
                          {booking.fromTime} - {booking.toTime}
                        </p>
                        {booking.note && (
                          <p className="mt-1 text-sm text-gray-500">
                            {booking.note}
                          </p>
                        )}
                        {booking.amount > 0 && (
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {booking.amount.toLocaleString("vi-VN")} VNĐ
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          window.open(
                            `/tutor/booking-detail/${booking.id}`,
                            "_blank"
                          )
                        }
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Xem chi tiết
                      </button>
                      {canApprove(booking) && (
                        <button
                          onClick={() => handleApproveBooking(booking.id)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          Chấp nhận
                        </button>
                      )}
                      {canReject(booking) && (
                        <button
                          onClick={() => handleRejectBooking(booking.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Từ chối
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đầu
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default TutorBookings;
