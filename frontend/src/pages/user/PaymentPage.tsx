import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Icons
const CreditCardIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const BankIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const WalletIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const CreditIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
);

const QRCodeIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
    />
  </svg>
);

const CheckIcon = () => (
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
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("credit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);

  // Load credit balance on component mount
  useEffect(() => {
    console.log("=== PaymentPage Debug ===");
    console.log("location.state:", location.state);
    console.log("bookingData:", bookingData);
    console.log("paymentId:", bookingData?.paymentId);
    loadCreditBalance();
  }, []);

  const loadCreditBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payments/credit-balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCreditBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Error loading credit balance:", error);
    }
  };

  // Lấy dữ liệu từ booking hoặc sử dụng mock data
  const bookingData = location.state || {
    tutor: {
      name: "Nguyễn Văn A",
      subject: "Toán học",
      avatar: null,
    },
    sessions: [
      { date: "2024-01-15", time: "14:00 - 15:30" },
      { date: "2024-01-17", time: "14:00 - 15:30" },
      { date: "2024-01-19", time: "14:00 - 15:30" },
    ],
    packageInfo: {
      totalDays: 3,
      packageType: "Gói 12+ buổi",
      pricePerSession: 200000,
      totalPrice: 600000,
      discount: 100000,
      finalPrice: 500000,
    },
  };

  // Xử lý dữ liệu cho single session booking
  const isSingleSession = bookingData.bookingType === "SINGLE_SESSION";
  const displaySessions = isSingleSession
    ? [{ date: bookingData.session?.date, time: bookingData.session?.time }]
    : bookingData.sessions;

  const displayPackageInfo = isSingleSession
    ? {
        totalDays: 1,
        packageType: "Buổi học đơn",
        pricePerSession: bookingData.session?.fee || 0,
        totalPrice: bookingData.session?.fee || 0,
        discount: 0,
        finalPrice: bookingData.session?.fee || 0,
      }
    : bookingData.packageInfo;

  const paymentMethods = [
    {
      id: "credit",
      name: "Thanh toán bằng tín dụng",
      icon: <CreditIcon />,
      description: `Số dư: ${creditBalance.toLocaleString()} VNĐ`,
      available: creditBalance >= displayPackageInfo.finalPrice,
    },
    {
      id: "sepay-qr",
      name: "QR Code SePay",
      icon: <QRCodeIcon />,
      description: "Quét QR để thanh toán",
      available: true,
    },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");

      if (selectedPaymentMethod === "credit") {
        // Thanh toán bằng tín dụng
        console.log("Payment data:", bookingData);
        console.log("Payment ID:", bookingData.paymentId);

        if (bookingData.paymentId) {
          const response = await fetch(
            `/api/payments/${bookingData.paymentId}/credit`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const result = await response.json();

          if (result.success) {
            // Thanh toán thành công - chuyển đến trang buổi học của tôi
            alert("Thanh toán thành công! Đặt lịch hoàn tất.");
            navigate("/my-sessions");
          } else {
            // Xử lý lỗi cụ thể
            if (
              result.message &&
              result.message.includes("Insufficient credit balance")
            ) {
              const confirmTopUp = window.confirm(
                `Số dư tín dụng không đủ!\nSố dư hiện tại: ${creditBalance.toLocaleString()} VNĐ\nSố tiền cần thanh toán: ${displayPackageInfo.finalPrice.toLocaleString()} VNĐ\n\nBạn có muốn chuyển đến trang nạp tín dụng không?`
              );
              if (confirmTopUp) {
                navigate("/settings", { state: { activeTab: "credit" } });
              }
            } else {
              alert("Thanh toán thất bại: " + result.message);
            }
          }
        } else {
          console.error("Payment ID not found:", bookingData);
          alert(
            "Không tìm thấy thông tin thanh toán. Payment ID: " +
              bookingData.paymentId
          );
        }
      } else if (selectedPaymentMethod === "sepay-qr") {
        // Thanh toán QR SePay
        console.log("SePay QR Payment data:", bookingData);
        console.log("SePay Payment ID:", bookingData.paymentId);

        if (bookingData.paymentId) {
          const response = await fetch(
            `/api/payments/${bookingData.paymentId}/sepay-qr`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const result = await response.json();

          if (result.success) {
            // Hiển thị QR code và chờ thanh toán
            navigate("/payment-qr", {
              state: {
                qrCodeUrl: result.qrCodeUrl,
                paymentId: bookingData.paymentId,
                amount: displayPackageInfo.finalPrice,
                bookingId: bookingData.bookingId,
              },
            });
          } else {
            alert("Tạo QR code thất bại: " + result.message);
          }
        } else {
          console.error("SePay Payment ID not found:", bookingData);
          alert(
            "Không tìm thấy thông tin thanh toán SePay. Payment ID: " +
              bookingData.paymentId
          );
        }
      } else {
        // Các phương thức thanh toán khác (mock)
        setTimeout(() => {
          setIsProcessing(false);
          navigate("/booking-success", {
            state: {
              bookingId: Math.floor(Math.random() * 1000),
              amount: displayPackageInfo.finalPrice,
              bookingType: bookingData.bookingType,
              paymentMethod: selectedPaymentMethod,
            },
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra khi thanh toán");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
          <p className="mt-1 text-sm text-gray-600">
            Hoàn tất thanh toán để xác nhận đặt lịch học
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Order Info */}
            <div className="lg:col-span-2 flex flex-col space-y-4 overflow-y-auto">
              {/* Tutor Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin gia sư
                </h2>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  >
                    <span className="text-white font-semibold text-lg">
                      {bookingData.tutor.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {bookingData.tutor.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {bookingData.tutor.subject}
                    </p>
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {isSingleSession ? "Chi tiết buổi học" : "Chi tiết gói học"}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Loại:</span>
                    <span className="font-medium">
                      {displayPackageInfo.packageType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Số buổi học:</span>
                    <span className="font-medium">
                      {displayPackageInfo.totalDays} buổi
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Giá mỗi buổi:</span>
                    <span className="font-medium">
                      {displayPackageInfo.pricePerSession.toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-medium">
                      {displayPackageInfo.totalPrice.toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </span>
                  </div>
                  {displayPackageInfo.discount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-green-600">Giảm giá:</span>
                      <span className="font-medium text-green-600">
                        -{displayPackageInfo.discount.toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-lg font-semibold text-gray-900">
                      Thành tiền:
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{ color: "rgb(148, 204, 230)" }}
                    >
                      {displayPackageInfo.finalPrice.toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Lịch học đã chọn
                </h2>
                <div className="space-y-2">
                  {displaySessions.map(
                    (
                      session: { date: string; time: string },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "rgb(148, 204, 230)" }}
                          >
                            <span className="text-white text-xs font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {session.date}
                            </p>
                            <p className="text-xs text-gray-600">
                              {session.time}
                            </p>
                          </div>
                        </div>
                        <CheckIcon />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Payment */}
            <div className="lg:col-span-1 flex flex-col">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Phương thức thanh toán
                </h2>

                <div className="flex-1 space-y-3 mb-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedPaymentMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            selectedPaymentMethod === method.id
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        >
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {method.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {method.description}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedPaymentMethod === method.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPaymentMethod === method.id && <CheckIcon />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: "rgb(148, 204, 230)" }}
                    >
                      {displayPackageInfo.finalPrice.toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </span>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang xử lý...</span>
                      </div>
                    ) : (
                      "Thanh toán ngay"
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Bằng cách thanh toán, bạn đồng ý với{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Điều khoản sử dụng
                    </a>{" "}
                    và{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Chính sách bảo mật
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
