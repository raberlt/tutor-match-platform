import React, { useState, useEffect } from "react";
import { bookingService } from "../services/bookingService";
import type { BookingSystemInfo, BookingType, BookingStatus } from "../types";

const BookingDemo: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<BookingSystemInfo | null>(null);
  const [bookingTypes, setBookingTypes] = useState<BookingType[]>([]);
  const [bookingStatuses, setBookingStatuses] = useState<BookingStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [info, types, statuses] = await Promise.all([
        bookingService.getBookingSystemInfo(),
        bookingService.getBookingTypes(),
        bookingService.getBookingStatuses(),
      ]);

      setSystemInfo(info);
      setBookingTypes(types);
      setBookingStatuses(statuses);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demo Booking API</h1>
          <p className="mt-2 text-gray-600">
            Kiểm tra các API booking hoạt động
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông Tin Hệ Thống
            </h2>
            {systemInfo ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">
                    {systemInfo.systemName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Version: {systemInfo.version}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tính năng:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {systemInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Luồng Booking:
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(systemInfo.bookingFlow).map(
                      ([type, flow]) => (
                        <div key={type} className="text-sm">
                          <span className="font-medium text-gray-700">
                            {type}:
                          </span>
                          <span className="text-gray-600 ml-2">{flow}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Không có dữ liệu</p>
            )}
          </div>

          {/* Booking Types */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Loại Booking
            </h2>
            {bookingTypes.length > 0 ? (
              <div className="space-y-3">
                {bookingTypes.map((type, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{type}</span>
                      <span className="text-sm text-gray-500">
                        {type === "TRIAL" && "Học thử"}
                        {type === "SINGLE_SESSION" && "Học buổi đơn"}
                        {type === "PACKAGE" && "Học theo gói"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Không có dữ liệu</p>
            )}
          </div>

          {/* Booking Statuses */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Trạng Thái Booking
            </h2>
            {bookingStatuses.length > 0 ? (
              <div className="space-y-2">
                {bookingStatuses.map((status, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {status === "PENDING" && "Chờ xử lý"}
                      {status === "TUTOR_APPROVED" && "Giảng viên đã chấp nhận"}
                      {status === "PAYMENT_PENDING" && "Chờ thanh toán"}
                      {status === "PAID" && "Đã thanh toán"}
                      {status === "CONFIRMED" && "Đã xác nhận"}
                      {status === "IN_PROGRESS" && "Đang diễn ra"}
                      {status === "COMPLETED" && "Hoàn thành"}
                      {status === "CANCELLED" && "Đã hủy"}
                      {status === "REJECTED" && "Bị từ chối"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Không có dữ liệu</p>
            )}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            API Endpoints
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Public APIs</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">GET</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/info
                  </code>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">GET</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/types
                  </code>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">GET</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/statuses
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Student APIs</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">POST</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/create
                  </code>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">GET</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/student/my-bookings
                  </code>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">GET</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/student/{"{id}"}
                  </code>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">PUT</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/student/{"{id}"}/cancel
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tutor APIs</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">GET</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/tutor/my-bookings
                  </code>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">PUT</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/tutor/{"{id}"}/approve
                  </code>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">PUT</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/tutor/{"{id}"}/reject
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Admin APIs</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">GET</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/admin/all
                  </code>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">GET</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/admin/{"{id}"}
                  </code>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">PUT</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/admin/{"{id}"}/status
                  </code>
                </div>
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">DELETE</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/booking/admin/{"{id}"}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test APIs
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reload Data
            </button>
            <button
              onClick={() => window.open("/api/booking/info", "_blank")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Test System Info API
            </button>
            <button
              onClick={() => window.open("/api/booking/types", "_blank")}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Test Types API
            </button>
            <button
              onClick={() => window.open("/api/booking/statuses", "_blank")}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Test Statuses API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDemo;
