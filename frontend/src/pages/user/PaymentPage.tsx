import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Icons

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
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string>("");
  const [tick, setTick] = useState<number>(0);
  const [sepayQrUrl, setSepayQrUrl] = useState<string>("");
  const [sepayStatus, setSepayStatus] = useState<string>("");

  // Lấy dữ liệu từ booking hoặc sử dụng mock data
  const bookingData = useMemo(
    () =>
      location.state || {
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
      },
    [location.state]
  );

  // Load credit balance on component mount
  useEffect(() => {
    console.log("=== PaymentPage Debug ===");
    console.log("location.state:", location.state);
    console.log("bookingData:", bookingData);
    console.log("paymentId:", bookingData?.paymentId);
    console.log("Session data:", bookingData?.session);
    console.log("Session date:", bookingData?.session?.date);
    loadCreditBalance();
  }, [location.state, bookingData]);

  // Countdown timer
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
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

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          bookingType: bookingData.bookingType,
          totalAmount: displayPackageInfo.finalPrice,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAppliedCoupon(result.coupon);
        setCouponError("");
        // Cập nhật giá trị cuối cùng
        const discountAmount = result.discountAmount || 0;
        const finalPrice = displayPackageInfo.finalPrice - discountAmount;
        console.log("Coupon applied:", result.coupon);
        console.log("Discount amount:", discountAmount);
        console.log("Final price:", finalPrice);
      } else {
        setCouponError(result.message || "Mã giảm giá không hợp lệ");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError("Lỗi khi áp dụng mã giảm giá");
      setAppliedCoupon(null);
    }
  };

  const renderCountdown = () => {
    if (!bookingData.paymentDeadline) return null;

    // Sử dụng tick để trigger re-render mỗi giây
    const deadline = new Date(bookingData.paymentDeadline).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((deadline - now) / 1000));

    // Trigger re-render bằng cách sử dụng tick trong dependency
    const currentTick = tick;

    // Nếu hết thời gian, không hiển thị countdown
    if (diff <= 0) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <span className="text-red-800 font-medium text-sm">
              ⏰ Hết hạn thanh toán
            </span>
          </div>
        </div>
      );
    }

    const hh = Math.floor(diff / 3600)
      .toString()
      .padStart(2, "0");
    const mm = Math.floor((diff % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(diff % 60)
      .toString()
      .padStart(2, "0");
    const isUrgent = diff <= 300; // <= 5 phút

    return (
      <div
        className={`border rounded-lg p-3 mb-4 ${
          isUrgent
            ? "bg-red-50 border-red-200"
            : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`font-medium text-sm ${
                isUrgent ? "text-red-800" : "text-yellow-800"
              }`}
            >
              ⏳ Thời gian còn lại để thanh toán (tick: {currentTick})
            </p>
            <p
              className={`text-lg font-bold ${
                isUrgent ? "text-red-900" : "text-yellow-900"
              }`}
            >
              {hh}:{mm}:{ss}
            </p>
          </div>
          {isUrgent && (
            <div className="text-red-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  const generateSepayQr = () => {
    const finalAmount = appliedCoupon
      ? displayPackageInfo.finalPrice - appliedCoupon.discountAmount
      : displayPackageInfo.finalPrice;

    const bookingCode =
      bookingData.bookingCode ||
      `BK${String(bookingData.bookingId || 0).padStart(6, "0")}`;

    const qrUrl = `https://qr.sepay.vn/img?acc=VQRQAESPZ4646&bank=MBBank&amount=${Math.round(
      finalAmount
    )}&des=${bookingCode}`;

    setSepayQrUrl(qrUrl);
    setSepayStatus("Đang chờ thanh toán...");

    // Simulate payment status checking
    setTimeout(() => {
      setSepayStatus("Vui lòng quét QR để thanh toán");
    }, 1000);
  };

  // Xử lý dữ liệu cho single session booking
  const isSingleSession = bookingData.bookingType === "SINGLE_SESSION";
  const displaySessions = isSingleSession
    ? [
        {
          date: bookingData.session?.date,
          time: bookingData.session?.time,
          subjectName: bookingData.session?.subject,
          fee: bookingData.session?.fee,
        },
      ]
    : bookingData.sessions?.map(
        (session: {
          date: string;
          timeSlot: string;
          subjectName: string;
          fee: number;
        }) => ({
          date: session.date,
          time: session.timeSlot,
          subjectName: session.subjectName,
          fee: session.fee,
        })
      ) || [];

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
      console.log("=== Payment Debug ===");
      console.log("bookingData:", bookingData);
      console.log("bookingId:", bookingData.bookingId);
      console.log("totalAmount:", bookingData.totalAmount);
      console.log(
        "displayPackageInfo.finalPrice:",
        displayPackageInfo.finalPrice
      );

      // Validate required data
      if (!bookingData.bookingId) {
        throw new Error(
          "Không tìm thấy thông tin booking. Vui lòng thử lại từ trang 'Buổi học của tôi'."
        );
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập lại");
      }

      if (selectedPaymentMethod === "credit") {
        // Thanh toán bằng tín dụng
        console.log("Payment data:", bookingData);
        console.log("Payment ID:", bookingData.paymentId);

        // Nếu không có paymentId, tạo payment mới với phương thức CREDIT
        let paymentId = bookingData.paymentId;
        if (!paymentId && bookingData.bookingId) {
          console.log(
            "Creating new CREDIT payment for booking:",
            bookingData.bookingId
          );

          const createPaymentResponse = await fetch("/api/payments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              bookingId: bookingData.bookingId,
              amount: bookingData.totalAmount || displayPackageInfo.finalPrice,
              paymentMethod: "CREDIT",
              description: `Payment for booking #${bookingData.bookingId}`,
            }),
          });

          if (createPaymentResponse.ok) {
            const createResult = await createPaymentResponse.json();
            paymentId = createResult.paymentId;
            console.log("Created CREDIT payment with ID:", paymentId);
          } else {
            const errorData = await createPaymentResponse.json();
            throw new Error("Failed to create payment: " + errorData.message);
          }
        }

        if (paymentId) {
          const response = await fetch(`/api/payments/${paymentId}/credit`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

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
          console.error("Cannot create payment:", bookingData);
          alert("Không thể tạo thông tin thanh toán. Vui lòng thử lại.");
        }
      } else if (selectedPaymentMethod === "sepay-qr") {
        // Thanh toán QR SePay
        generateSepayQr();
        return; // Không cần xử lý API, chỉ hiển thị QR
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra khi thanh toán");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-auto pb-24">
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
          <p className="mt-1 text-sm text-gray-600">
            Hoàn tất thanh toán để xác nhận đặt lịch học
          </p>
        </div>

        {/* Countdown Timer */}
        {renderCountdown()}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Order Info */}
            <div className="lg:col-span-2 flex flex-col space-y-4">
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
                      {(bookingData.tutor?.name || "G").charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {bookingData.tutor?.name || "Gia sư"}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {bookingData.tutor?.rating &&
                      bookingData.tutor.rating > 0 ? (
                        <>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (bookingData.tutor?.rating || 0)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {bookingData.tutor.rating}/5
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-blue-600 font-medium">
                          Gia sư mới
                        </span>
                      )}
                    </div>
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
                    <span className="text-gray-600">Mã booking:</span>
                    <span className="font-medium text-blue-600">
                      {bookingData.bookingCode ||
                        `BK${String(bookingData.bookingId || 0).padStart(
                          6,
                          "0"
                        )}`}
                    </span>
                  </div>
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
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {displaySessions.map(
                    (
                      session: {
                        date: string;
                        time: string;
                        subjectName?: string;
                        fee?: number;
                      },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: "rgb(148, 204, 230)" }}
                            >
                              <span className="text-white text-xs font-medium">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {session.subjectName || "Môn học"}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {session.fee
                                      ? `${session.fee.toLocaleString(
                                          "vi-VN"
                                        )} VNĐ`
                                      : "Chưa có"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {session.date
                                      ? new Date(
                                          session.date
                                        ).toLocaleDateString("vi-VN")
                                      : "Chưa xác định"}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {session.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <CheckIcon />
                        </div>

                        {/* Additional session details for package booking */}
                        {bookingData.bookingType === "PACKAGE" && (
                          <div className="ml-9 space-y-1">
                            {session.subjectName && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Môn học:</span>{" "}
                                {session.subjectName}
                              </p>
                            )}
                            {session.fee && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Học phí:</span>{" "}
                                {session.fee.toLocaleString("vi-VN")} VNĐ
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Payment */}
            <div className="lg:col-span-1 flex flex-col">
              {/* Coupon Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Mã giảm giá
                </h2>

                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      Áp dụng
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-red-500 text-sm">{couponError}</p>
                  )}

                  {appliedCoupon && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-800 font-medium text-sm">
                            ✓ Đã áp dụng mã: {appliedCoupon.code}
                          </p>
                          <p className="text-green-600 text-xs">
                            {appliedCoupon.description}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponCode("");
                            setCouponError("");
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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

                {/* SePay QR Display */}
                {selectedPaymentMethod === "sepay-qr" && sepayQrUrl && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Quét QR để thanh toán
                    </h3>
                    <div className="flex flex-col items-center space-y-3">
                      <img
                        src={sepayQrUrl}
                        alt="SePay QR Code"
                        className="w-48 h-48 border border-gray-300 rounded-lg"
                      />
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">
                          Số tiền:{" "}
                          {appliedCoupon
                            ? (
                                displayPackageInfo.finalPrice -
                                appliedCoupon.discountAmount
                              ).toLocaleString("vi-VN")
                            : displayPackageInfo.finalPrice.toLocaleString(
                                "vi-VN"
                              )}{" "}
                          VNĐ
                        </p>
                        <p className="text-xs text-gray-500">
                          Mã đơn hàng:{" "}
                          {bookingData.bookingCode ||
                            `BK${String(bookingData.bookingId || 0).padStart(
                              6,
                              "0"
                            )}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">
                          {sepayStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

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
