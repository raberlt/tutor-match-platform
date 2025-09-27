import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type {
  TutorPreviewProfile,
  TutorProfile,
  PackageInfo,
  PackageSchedule,
} from "../../types";

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state
  const tutor = location.state?.tutor as
    | TutorPreviewProfile
    | TutorProfile
    | null;
  const packageInfo = location.state?.packageInfo as PackageInfo;
  const sessions = location.state?.sessions as PackageSchedule[];
  const paymentMethod = location.state?.paymentMethod as string;

  const handleGoToMySessions = () => {
    navigate("/user/my-sessions");
  };

  const handleGoToFindTutor = () => {
    navigate("/find-tutor");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Đặt lịch thành công!
              </h1>
              <p className="text-gray-600">
                Gói học của bạn đã được tạo và đang chờ xác nhận thanh toán
              </p>
            </div>

            {/* Booking Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Tutor Info */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">
                  Thông tin gia sư
                </h2>
                {tutor && (
                  <div className="flex items-center space-x-4">
                    {tutor.imageAvatar ? (
                      <img
                        src={tutor.imageAvatar}
                        alt={`${tutor.firstName || ""} ${tutor.lastName || ""}`}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {(tutor.firstName || "").charAt(0)}
                          {(tutor.lastName || "").charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {tutor.firstName || ""} {tutor.lastName || ""}
                      </h3>
                      {tutor.headline && (
                        <p className="text-sm text-gray-600">
                          {tutor.headline}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Package Info */}
              <div className="bg-green-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-green-900 mb-4">
                  Thông tin gói học
                </h2>
                {packageInfo && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại gói:</span>
                      <span className="font-medium">
                        {packageInfo.packageType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số buổi học:</span>
                      <span className="font-medium">
                        {packageInfo.totalDays} buổi
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Phương thức thanh toán:
                      </span>
                      <span className="font-medium">
                        {paymentMethod === "bank_transfer" && "Chuyển khoản"}
                        {paymentMethod === "momo" && "MoMo"}
                        {paymentMethod === "zalopay" && "ZaloPay"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-900">
                          Tổng thanh toán:
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {packageInfo.finalPrice.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sessions List */}
            {sessions && sessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Lịch học đã đặt ({sessions.length} buổi)
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map((session, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Buổi {index + 1}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(session.date).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {session.fromTime} - {session.toTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-yellow-900 mb-4">
                Bước tiếp theo
              </h2>
              <div className="space-y-3 text-sm text-yellow-800">
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 mr-3 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Thanh toán gói học</p>
                    <p className="text-yellow-700">
                      Vui lòng thực hiện thanh toán theo phương thức đã chọn
                      trong vòng 24 giờ
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 mr-3 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Gửi xác nhận thanh toán</p>
                    <p className="text-yellow-700">
                      Gửi ảnh biên lai hoặc screenshot thanh toán qua email hoặc
                      tin nhắn
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 mr-3 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Xác nhận từ gia sư</p>
                    <p className="text-yellow-700">
                      Gia sư sẽ xác nhận và liên hệ để sắp xếp lịch học chi tiết
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin liên hệ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Email hỗ trợ:</p>
                  <p className="font-medium text-gray-900">
                    support@tutormatch.com
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Hotline:</p>
                  <p className="font-medium text-gray-900">1900 1234</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Thời gian hỗ trợ:</p>
                  <p className="font-medium text-gray-900">
                    8:00 - 22:00 (Thứ 2 - Chủ nhật)
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Zalo:</p>
                  <p className="font-medium text-gray-900">
                    @tutormatch_support
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleGoToMySessions}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Xem lịch học của tôi
              </button>
              <button
                onClick={handleGoToFindTutor}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Tìm gia sư khác
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
