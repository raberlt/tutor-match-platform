import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";

interface BookingPaymentData {
  bookingId: number;
  paymentId: number;
  status: string;
  amount: number;
  paymentMethod: string;
  transactionRef?: string;
  qrCodeUrl?: string;
  paidAt?: string;
  createdAt: string;
}

const BookingPaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<BookingPaymentData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (bookingId) {
      checkPaymentStatus();
    }
  }, [bookingId]);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/booking-payment/${bookingId}/status`);
      if (response.data.success) {
        setPaymentData(response.data);
      } else {
        setError(response.data.message || "Lỗi kiểm tra trạng thái thanh toán");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Lỗi kiểm tra trạng thái thanh toán"
      );
    } finally {
      setLoading(false);
    }
  };

  const createSePayQR = async () => {
    try {
      setActionLoading(true);
      const response = await api.post(`/booking-payment/${bookingId}/sepay-qr`);
      if (response.data.success) {
        setPaymentData((prev) => ({
          ...prev!,
          qrCodeUrl: response.data.qrCodeUrl,
          transactionRef: response.data.transactionRef,
          status: "PROCESSING",
        }));
      } else {
        setError(response.data.message || "Lỗi tạo QR thanh toán");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tạo QR thanh toán");
    } finally {
      setActionLoading(false);
    }
  };

  const payWithCredit = async () => {
    try {
      setActionLoading(true);
      const response = await api.post(`/booking-payment/${bookingId}/credit`);
      if (response.data.success) {
        setPaymentData((prev) => ({
          ...prev!,
          status: "COMPLETED",
        }));
        alert("Thanh toán thành công!");
      } else {
        setError(response.data.message || "Lỗi thanh toán");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi thanh toán");
    } finally {
      setActionLoading(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    try {
      setActionLoading(true);
      const response = await api.post(
        `/booking-payment/${bookingId}/simulate-success`
      );
      if (response.data.success) {
        setPaymentData((prev) => ({
          ...prev!,
          status: "COMPLETED",
        }));
        alert("Mô phỏng thanh toán thành công!");
      } else {
        setError(response.data.message || "Lỗi mô phỏng thanh toán");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi mô phỏng thanh toán");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ thanh toán";
      case "PROCESSING":
        return "Đang xử lý";
      case "COMPLETED":
        return "Đã thanh toán";
      case "FAILED":
        return "Thanh toán thất bại";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "PROCESSING":
        return "text-blue-600 bg-blue-100";
      case "COMPLETED":
        return "text-green-600 bg-green-100";
      case "FAILED":
        return "text-red-600 bg-red-100";
      case "CANCELLED":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin thanh toán</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Thanh toán Booking #{paymentData.bookingId}
          </h1>

          {/* Thông tin thanh toán */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số tiền
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {paymentData.amount.toLocaleString("vi-VN")} VND
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    paymentData.status
                  )}`}
                >
                  {getStatusText(paymentData.status)}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {paymentData.qrCodeUrl && (
            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quét mã QR để thanh toán
              </h3>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img
                  src={paymentData.qrCodeUrl}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              {paymentData.transactionRef && (
                <p className="mt-2 text-sm text-gray-600">
                  Mã giao dịch:{" "}
                  <span className="font-mono">
                    {paymentData.transactionRef}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Các nút hành động */}
          <div className="space-y-4">
            {paymentData.status === "PENDING" && (
              <>
                <button
                  onClick={createSePayQR}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Đang tạo..." : "Tạo QR Sepay"}
                </button>
                <button
                  onClick={payWithCredit}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Đang xử lý..." : "Thanh toán bằng tín dụng"}
                </button>
              </>
            )}

            {paymentData.status === "PROCESSING" && (
              <button
                onClick={checkPaymentStatus}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Đang kiểm tra..." : "Kiểm tra trạng thái"}
              </button>
            )}

            {/* Nút mô phỏng (chỉ để test) */}
            <button
              onClick={simulatePaymentSuccess}
              disabled={actionLoading || paymentData.status === "COMPLETED"}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading
                ? "Đang mô phỏng..."
                : "Mô phỏng thanh toán thành công (Test)"}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Quay lại
            </button>
          </div>

          {/* Thông tin bổ sung */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Thông tin bổ sung
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Payment ID: {paymentData.paymentId}</p>
              <p>Phương thức: {paymentData.paymentMethod}</p>
              <p>
                Tạo lúc:{" "}
                {new Date(paymentData.createdAt).toLocaleString("vi-VN")}
              </p>
              {paymentData.paidAt && (
                <p>
                  Thanh toán lúc:{" "}
                  {new Date(paymentData.paidAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentPage;

