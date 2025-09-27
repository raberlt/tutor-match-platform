import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import type {
  TutorPreviewProfile,
  TutorProfile,
  PackageSchedule,
  PackageInfo,
} from "../../types";

const PackagePayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");

  // Get data from navigation state
  const tutor = location.state?.tutor as
    | TutorPreviewProfile
    | TutorProfile
    | null;
  const subjectId = location.state?.subjectId as number;
  const sessions = location.state?.sessions as PackageSchedule[];
  const packageInfo = location.state?.packageInfo as PackageInfo;
  const note = location.state?.note as string;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    paymentNote: "",
  });

  useEffect(() => {
    if (!tutor || !sessions || !packageInfo) {
      navigate("/find-tutor");
      return;
    }
  }, [tutor, sessions, packageInfo, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.fullName || !formData.email || !formData.phone) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      // Create booking data
      const bookingData = {
        bookingType: "PACKAGE" as const,
        tutorId: tutor?.id || 0,
        subjectId: subjectId,
        sessions: sessions,
        totalAmount: packageInfo.finalPrice,
        paymentMethod: paymentMethod,
        note: note,
        studentInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        paymentNote: formData.paymentNote,
      };

      // Submit booking
      await bookingService.createPackageBooking(bookingData);

      // Navigate to success page
      navigate("/booking-success", {
        state: {
          tutor,
          packageInfo,
          sessions,
          paymentMethod,
        },
      });
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!tutor || !sessions || !packageInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Thanh Toán Gói Học
            </h1>

            {/* Tutor Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Thông tin gia sư
              </h3>
              <div className="flex items-center space-x-4">
                {tutor.imageAvatar ? (
                  <img
                    src={tutor.imageAvatar}
                    alt={`${tutor.firstName || ""} ${tutor.lastName || ""}`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {(tutor.firstName || "").charAt(0)}
                      {(tutor.lastName || "").charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {tutor.firstName || ""} {tutor.lastName || ""}
                  </h4>
                  {tutor.headline && (
                    <p className="text-sm text-gray-600">{tutor.headline}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Form */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Thông tin thanh toán
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Thông tin cá nhân
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Phương thức thanh toán
                    </h3>

                    <div className="space-y-3">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === "bank_transfer"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() =>
                          handlePaymentMethodChange("bank_transfer")
                        }
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank_transfer"
                            checked={paymentMethod === "bank_transfer"}
                            onChange={() =>
                              handlePaymentMethodChange("bank_transfer")
                            }
                            className="mr-3"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Chuyển khoản ngân hàng
                            </h4>
                            <p className="text-sm text-gray-600">
                              Thanh toán qua chuyển khoản
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === "momo"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handlePaymentMethodChange("momo")}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="momo"
                            checked={paymentMethod === "momo"}
                            onChange={() => handlePaymentMethodChange("momo")}
                            className="mr-3"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Ví MoMo
                            </h4>
                            <p className="text-sm text-gray-600">
                              Thanh toán qua ví điện tử MoMo
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === "zalopay"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handlePaymentMethodChange("zalopay")}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="zalopay"
                            checked={paymentMethod === "zalopay"}
                            onChange={() =>
                              handlePaymentMethodChange("zalopay")
                            }
                            className="mr-3"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              ZaloPay
                            </h4>
                            <p className="text-sm text-gray-600">
                              Thanh toán qua ZaloPay
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú thanh toán
                    </label>
                    <textarea
                      name="paymentNote"
                      value={formData.paymentNote}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập ghi chú cho việc thanh toán..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Tóm tắt đơn hàng
                </h2>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  {/* Package Info */}
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Thông tin gói học
                    </h3>
                    <div className="space-y-2 text-sm">
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
                        <span className="text-gray-600">Giá mỗi buổi:</span>
                        <span className="font-medium">
                          {packageInfo.pricePerSession.toLocaleString("vi-VN")}{" "}
                          VNĐ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Chi tiết giá
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng giá gốc:</span>
                        <span className="font-medium">
                          {packageInfo.totalPrice.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giảm giá:</span>
                        <span className="font-medium text-green-600">
                          -{packageInfo.discount.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Tổng thanh toán:
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {packageInfo.finalPrice.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                  </div>

                  {/* Sessions Preview */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Lịch học ({sessions.length} buổi)
                    </h3>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {sessions.slice(0, 10).map((session, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className="font-medium">Buổi {index + 1}:</span>{" "}
                          {new Date(session.date).toLocaleDateString("vi-VN")} -{" "}
                          {session.fromTime} đến {session.toTime}
                        </div>
                      ))}
                      {sessions.length > 10 && (
                        <div className="text-sm text-gray-500">
                          ... và {sessions.length - 10} buổi khác
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Hướng dẫn thanh toán
                  </h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    {paymentMethod === "bank_transfer" && (
                      <>
                        <p>• Chuyển khoản đến tài khoản ngân hàng</p>
                        <p>• Nội dung: "Thanh toan goi hoc - [Họ tên]"</p>
                        <p>• Gửi ảnh biên lai qua email hoặc tin nhắn</p>
                      </>
                    )}
                    {paymentMethod === "momo" && (
                      <>
                        <p>• Quét mã QR MoMo để thanh toán</p>
                        <p>• Hoặc chuyển khoản MoMo đến số: 0123456789</p>
                        <p>• Nội dung: "Thanh toan goi hoc"</p>
                      </>
                    )}
                    {paymentMethod === "zalopay" && (
                      <>
                        <p>• Mở ứng dụng ZaloPay</p>
                        <p>• Quét mã QR để thanh toán</p>
                        <p>• Hoặc chuyển khoản ZaloPay</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagePayment;
