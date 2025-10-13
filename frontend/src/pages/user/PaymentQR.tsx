import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentQR: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes
  const [isChecking, setIsChecking] = useState(false);

  const { qrCodeUrl, paymentId, amount, bookingId } = location.state || {};

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time expired
      setPaymentStatus("EXPIRED");
    }
  }, [timeLeft]);

  // Check payment status periodically
  useEffect(() => {
    if (paymentStatus === "PENDING" && timeLeft > 0) {
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [paymentStatus, timeLeft]);

  const checkPaymentStatus = async () => {
    if (!paymentId) return;

    setIsChecking(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/payments/${paymentId}/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "COMPLETED") {
          setPaymentStatus("COMPLETED");
          // Redirect to my-sessions page after 2 seconds
          setTimeout(() => {
            alert("Thanh toán thành công! Đặt lịch hoàn tất.");
            navigate("/my-sessions");
          }, 2000);
        } else if (data.status === "FAILED") {
          setPaymentStatus("FAILED");
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleCancel = () => {
    navigate("/my-sessions");
  };

  const handleRetry = () => {
    setPaymentStatus("PENDING");
    setTimeLeft(900);
  };

  if (!qrCodeUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy QR code
          </h2>
          <button
            onClick={() => navigate("/my-sessions")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanh toán QR Code
          </h1>
          <p className="text-gray-600">
            Quét QR code bằng ứng dụng ngân hàng để thanh toán
          </p>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Thông tin thanh toán
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-600">Số tiền</p>
              <p className="text-xl font-bold text-gray-900">
                {amount?.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Thời gian còn lại
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(timeLeft)}
                </p>
              </div>
              {isChecking && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm">Đang kiểm tra...</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8 inline-block">
              <img
                src={qrCodeUrl}
                alt="QR Code for payment"
                className="w-64 h-64 mx-auto"
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Quét QR code bằng ứng dụng ngân hàng để thanh toán
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {paymentStatus === "COMPLETED" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-green-800 font-medium">
                Thanh toán thành công! Đang chuyển hướng...
              </p>
            </div>
          </div>
        )}

        {paymentStatus === "FAILED" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
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
              <p className="text-red-800 font-medium">
                Thanh toán thất bại. Vui lòng thử lại.
              </p>
            </div>
          </div>
        )}

        {paymentStatus === "EXPIRED" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-600 mr-2"
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
              <p className="text-yellow-800 font-medium">
                QR code đã hết hạn. Vui lòng tạo QR code mới.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Hủy thanh toán
          </button>

          {(paymentStatus === "FAILED" || paymentStatus === "EXPIRED") && (
            <button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Hướng dẫn thanh toán:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Mở ứng dụng ngân hàng trên điện thoại</li>
            <li>2. Chọn chức năng "Quét QR" hoặc "Scan QR"</li>
            <li>3. Quét QR code hiển thị trên màn hình</li>
            <li>4. Xác nhận thông tin thanh toán</li>
            <li>5. Nhập mã PIN để hoàn tất thanh toán</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentQR;
