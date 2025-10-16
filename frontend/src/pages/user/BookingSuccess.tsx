import React from "react";
import { useNavigate } from "react-router-dom";

export const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
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
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Đặt lịch thành công!
        </h1>

        <p className="text-gray-600 mb-6">
          Yêu cầu đặt lịch của bạn đã được gửi đến gia sư. Bạn sẽ nhận được
          thông báo khi gia sư phản hồi.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/user/bookings")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem lịch đã đặt
          </button>

          <button
            onClick={() => navigate("/user/search")}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Tìm gia sư khác
          </button>
        </div>
      </div>
    </div>
  );
};
