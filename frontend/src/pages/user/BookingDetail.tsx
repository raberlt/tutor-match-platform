import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import type { Booking } from "../../types";

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      loadBookingDetail(parseInt(id));
    }
  }, [id]);

  const loadBookingDetail = async (bookingId: number) => {
    try {
      setLoading(true);
      const bookingData = await bookingService.getStudentBookingDetail(
        bookingId
      );
      setBooking(bookingData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !window.confirm("Bạn có chắc chắn muốn hủy booking này?")) {
      return;
    }

    try {
      setCancelling(true);
      await bookingService.cancelBooking(booking.id);
      navigate("/my-sessions");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ thanh toán";
      case "PAID":
        return "Đã thanh toán";
      case "FAILED":
        return "Thanh toán thất bại";
      case "REFUNDED":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const canCancel = (status: string) => {
    return status === "PENDING" || status === "PAYMENT_PENDING";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Lỗi</h3>
              <p className="mt-1 text-sm text-gray-500">
                {error || "Không tìm thấy booking"}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/my-sessions")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/my-sessions")}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            ← Quay lại danh sách
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Chi Tiết Booking
              </h1>
              <div className="flex items-center space-x-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {getStatusText(booking.status)}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getBookingTypeText(booking.bookingType)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Thông tin cơ bản */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Thông Tin Cơ Bản
                </h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      ID Booking
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      #{booking.id}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Môn học
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {booking.subject.name}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Ngày học
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(booking.date).toLocaleDateString("vi-VN")}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Thời gian
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {booking.fromTime} - {booking.toTime}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Số tiền
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {booking.amount > 0
                        ? `${booking.amount.toLocaleString("vi-VN")} VNĐ`
                        : "Miễn phí"}
                    </dd>
                  </div>

                  {booking.note && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Ghi chú
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {booking.note}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Thông tin giảng viên */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Thông Tin Giảng Viên
                </h3>
                <div className="flex items-center space-x-4">
                  {booking.tutor.user.imageAvatar ? (
                    <img
                      className="h-16 w-16 rounded-full"
                      src={booking.tutor.user.imageAvatar}
                      alt="Avatar"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-lg font-medium">
                        {booking.tutor.user.firstName.charAt(0)}
                        {booking.tutor.user.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {booking.tutor.user.firstName}{" "}
                      {booking.tutor.user.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {booking.tutor.user.email}
                    </p>
                    {booking.tutor.headline && (
                      <p className="text-sm text-gray-500 mt-1">
                        {booking.tutor.headline}
                      </p>
                    )}
                    {booking.tutor.fees && (
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {booking.tutor.fees.toLocaleString("vi-VN")} VNĐ/buổi
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin bổ sung cho gói PACKAGE */}
            {booking.bookingType === "PACKAGE" && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Thông Tin Gói Học
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Số buổi/tuần
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {booking.sessionsPerWeek} buổi
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Thời gian hợp đồng
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {booking.contractDuration} tháng
                    </dd>
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin thanh toán */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Thông Tin Thanh Toán
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Trạng thái thanh toán
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {getPaymentStatusText(booking.paymentStatus)}
                  </dd>
                </div>
                {booking.paymentMethod && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Phương thức thanh toán
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {booking.paymentMethod}
                    </dd>
                  </div>
                )}
                {booking.paymentReference && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Mã tham chiếu
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {booking.paymentReference}
                    </dd>
                  </div>
                )}
                {booking.paymentDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Ngày thanh toán
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(booking.paymentDate).toLocaleString("vi-VN")}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin thời gian */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Thông Tin Thời Gian
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Ngày tạo
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(booking.createdAt).toLocaleString("vi-VN")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Cập nhật lần cuối
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(booking.updatedAt).toLocaleString("vi-VN")}
                  </dd>
                </div>
              </div>
            </div>

            {/* Hợp đồng */}
            {booking.contract && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Hợp Đồng
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Trạng thái hợp đồng
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {booking.contract.status}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Thời hạn
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(
                          booking.contract.startDate
                        ).toLocaleDateString("vi-VN")}{" "}
                        -{" "}
                        {new Date(booking.contract.endDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Nội dung hợp đồng
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {booking.contract.contractContent}
                    </dd>
                  </div>
                </div>
              </div>
            )}

            {/* Hành động */}
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-end space-x-4">
                {canCancel(booking.status) && (
                  <button
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                    className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? "Đang hủy..." : "Hủy Booking"}
                  </button>
                )}
                <button
                  onClick={() => navigate("/my-sessions")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
