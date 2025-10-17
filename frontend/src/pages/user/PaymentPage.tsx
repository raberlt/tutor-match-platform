import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  const [sepayReady, setSepayReady] = useState<boolean>(false);
  const [paymentDeadline, setPaymentDeadline] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [apiBooking, setApiBooking] = useState<any | null>(null);

  // Lấy dữ liệu từ booking hoặc sử dụng mock data
  const bookingData = useMemo(
    () =>
      location.state || {
        bookingId: 12345,
        bookingCode: "BK001234",
        bookingType: "SINGLE_SESSION", // hoặc "PACKAGE"
        bookingCreatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 phút trước
        paymentDeadline: new Date(Date.now() + 8 * 60 * 1000).toISOString(), // 8 phút nữa
        tutor: {
          id: 0,
          name: "Nguyễn Văn A",
          subject: "Toán học",
          avatar: "/default-avatar.png",
          rating: 4.5,
        },
        session: {
          date: "2024-01-15",
          time: "14:00 - 15:30",
          subject: "Toán học",
          fee: 200000,
        },
        sessions: [
          {
            date: "2024-01-15",
            timeSlot: "14:00 - 15:30",
            subjectName: "Toán học",
            fee: 200000,
          },
          {
            date: "2024-01-17",
            timeSlot: "14:00 - 15:30",
            subjectName: "Toán học",
            fee: 200000,
          },
          {
            date: "2024-01-19",
            timeSlot: "14:00 - 15:30",
            subjectName: "Toán học",
            fee: 200000,
          },
        ],
        packageInfo: {
          totalDays: 3,
          packageType: "Gói 12+ buổi",
          pricePerSession: 200000,
          totalPrice: 600000,
          discount: 100000,
          finalPrice: 500000,
        },
        totalAmount: 200000,
        note: "Học sinh cần hỗ trợ thêm về phần đạo hàm",
      },
    [location.state]
  );

  const handlePaymentExpired = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !bookingData.bookingId) return;

      // Update booking status to expired
      const response = await fetch(
        `/api/bookings/${bookingData.bookingId}/expire`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        console.log("Booking status updated to expired");
        // Redirect to booking list with expired message
        navigate("/user/bookings", {
          state: {
            message: "Thanh toán đã hết hạn. Đặt lịch đã bị hủy.",
          },
        });
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  }, [bookingData.bookingId, navigate]);

  const setPaymentDeadlineBasedOnBookingType = useCallback(() => {
    const bookingId = bookingData.bookingId || bookingData.bookingCode;
    const localStorageKey = `paymentDeadline_${bookingId}`;

    // Kiểm tra localStorage trước
    const savedDeadline = localStorage.getItem(localStorageKey);
    if (savedDeadline) {
      const deadlineTime = new Date(savedDeadline).getTime();
      const now = Date.now();

      // Nếu deadline đã hết hạn, đánh dấu expired
      if (deadlineTime <= now) {
        setIsExpired(true);
        console.log(`Payment deadline expired: ${savedDeadline}`);
        return;
      }

      setPaymentDeadline(savedDeadline);
      console.log(`Using saved payment deadline: ${savedDeadline}`);
      return;
    }

    // Nếu đã có paymentDeadline từ booking data, sử dụng nó
    if (bookingData.paymentDeadline) {
      setPaymentDeadline(bookingData.paymentDeadline);
      localStorage.setItem(localStorageKey, bookingData.paymentDeadline);
      console.log(
        `Using existing payment deadline: ${bookingData.paymentDeadline}`
      );
      return;
    }

    // Nếu có bookingCreatedAt, tính deadline từ thời điểm tạo booking
    if (bookingData.bookingCreatedAt) {
      const bookingCreatedTime = new Date(
        bookingData.bookingCreatedAt
      ).getTime();
      const isSingleSession = bookingData.bookingType === "SINGLE_SESSION";

      // Single session: 10 minutes, Package: 24 hours
      const deadlineMinutes = isSingleSession ? 10 : 24 * 60;
      const deadline = new Date(
        bookingCreatedTime + deadlineMinutes * 60 * 1000
      );

      setPaymentDeadline(deadline.toISOString());
      localStorage.setItem(localStorageKey, deadline.toISOString());
      console.log(
        `Payment deadline calculated from booking creation: ${deadline.toISOString()} (${
          isSingleSession ? "10 minutes" : "24 hours"
        })`
      );
      return;
    }

    // Fallback: tính từ thời điểm hiện tại (chỉ dùng khi không có dữ liệu)
    const now = new Date();
    const isSingleSession = bookingData.bookingType === "SINGLE_SESSION";

    // Single session: 10 minutes, Package: 24 hours
    const deadlineMinutes = isSingleSession ? 10 : 24 * 60;
    const deadline = new Date(now.getTime() + deadlineMinutes * 60 * 1000);

    setPaymentDeadline(deadline.toISOString());
    localStorage.setItem(localStorageKey, deadline.toISOString());
    console.log(
      `Payment deadline set from current time (fallback): ${deadline.toISOString()} (${
        isSingleSession ? "10 minutes" : "24 hours"
      })`
    );
  }, [
    bookingData.bookingType,
    bookingData.paymentDeadline,
    bookingData.bookingCreatedAt,
    bookingData.bookingId,
    bookingData.bookingCode,
  ]);

  const fetchBookingData = useCallback(async () => {
    // Nếu đã có dữ liệu từ location.state, không cần fetch
    if (location.state?.bookingId) {
      return;
    }

    // Nếu có bookingId trong URL params hoặc localStorage, fetch từ API
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId =
      urlParams.get("bookingId") || localStorage.getItem("currentBookingId");

    if (bookingId) {
      try {
        const token = localStorage.getItem("token");
        // Ưu tiên endpoint trả DTO chi tiết cho student
        const response = await fetch(`/api/booking/student/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched booking data from API:", data);
          if (data?.booking) setApiBooking(data.booking);
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
      }
    }
  }, [location.state]);

  // Chuẩn bị ngữ cảnh tạo payment: lấy studentId (từ localStorage) và tutorUserId (từ API nếu cần)
  const getPaymentContext = useCallback(async (): Promise<{
    studentId?: number;
    tutorUserId?: number;
  }> => {
    try {
      const userStr = localStorage.getItem("user");
      let studentId: number | undefined = undefined;
      if (userStr) {
        const u = JSON.parse(userStr);
        studentId = u?.id;
      }

      // Ưu tiên lấy từ apiBooking nếu đã fetch
      let tutorUserId: number | undefined = (apiBooking as any)?.tutor?.id;

      // Nếu chưa có apiBooking mà chỉ có bookingId trong state, fetch chi tiết để lấy tutor user id
      if (!tutorUserId && bookingData?.bookingId) {
        const token = localStorage.getItem("token");
        const resp = await fetch(
          `/api/booking/student/${bookingData.bookingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (resp.ok) {
          const data = await resp.json();
          tutorUserId = data?.booking?.tutor?.id;
        }
      }

      return { studentId, tutorUserId };
    } catch (_) {
      return {};
    }
  }, [apiBooking, bookingData?.bookingId]);

  // Load credit balance on component mount
  useEffect(() => {
    console.log("=== PaymentPage Debug ===");
    console.log("location.state:", location.state);
    console.log("bookingData:", bookingData);
    console.log("paymentId:", bookingData?.paymentId);
    console.log("Session data:", bookingData?.session);
    console.log("Session date:", bookingData?.session?.date);
    console.log("bookingCreatedAt:", bookingData?.bookingCreatedAt);
    console.log("paymentDeadline:", bookingData?.paymentDeadline);

    loadCreditBalance();
    fetchBookingData();

    // Set payment deadline based on booking type
    setPaymentDeadlineBasedOnBookingType();
  }, [
    location.state,
    bookingData,
    setPaymentDeadlineBasedOnBookingType,
    fetchBookingData,
  ]);

  // Countdown timer
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  // Check if payment is expired
  useEffect(() => {
    if (paymentDeadline) {
      const deadline = new Date(paymentDeadline).getTime();
      const now = Date.now();
      const diff = Math.floor((deadline - now) / 1000);

      if (diff <= 0 && !isExpired) {
        setIsExpired(true);
        handlePaymentExpired();
      }
    }
  }, [tick, paymentDeadline, isExpired, handlePaymentExpired]);

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
    if (!paymentDeadline || isExpired) return null;

    const deadline = new Date(paymentDeadline).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((deadline - now) / 1000));

    // Debug info
    console.log(
      `Countdown debug - Deadline: ${new Date(
        deadline
      ).toISOString()}, Now: ${new Date(now).toISOString()}, Diff: ${diff}s`
    );

    // Nếu hết thời gian, hiển thị thông báo hết hạn
    if (diff <= 0) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-800 font-medium text-sm">
                ⏰ Hết hạn thanh toán
              </span>
            </div>
            <button
              onClick={() => navigate("/user/search")}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Đặt lịch lại
            </button>
          </div>
        </div>
      );
    }

    const isSingleSession = bookingData.bookingType === "SINGLE_SESSION";
    const hh = Math.floor(diff / 3600)
      .toString()
      .padStart(2, "0");
    const mm = Math.floor((diff % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(diff % 60)
      .toString()
      .padStart(2, "0");

    // For single session: urgent if <= 2 minutes, for package: urgent if <= 1 hour
    const isUrgent = isSingleSession ? diff <= 120 : diff <= 3600;

    return (
      <div
        className={`border rounded-lg p-3 mb-4 ${
          isUrgent
            ? "bg-red-50 border-red-200"
            : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div className="flex items-center gap-3 text-sm">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
              isUrgent ? "bg-red-600 text-white" : "bg-yellow-500 text-white"
            }`}
          >
            ⏳
          </span>
          <span className={`${isUrgent ? "text-red-800" : "text-yellow-800"}`}>
            Thời gian còn lại để thanh toán (
            {isSingleSession ? "10 phút" : "24 giờ"})
          </span>
          <span
            className={`font-bold ${
              isUrgent ? "text-red-900" : "text-yellow-900"
            }`}
          >
            {hh}:{mm}:{ss}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-700">
            Deadline: {new Date(paymentDeadline).toLocaleTimeString("vi-VN")}{" "}
            {new Date(paymentDeadline).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>
    );
  };

  const generateSepayQr = () => {
    const finalAmount = appliedCoupon
      ? displayPackageInfo.finalPrice - appliedCoupon.discountAmount
      : displayPackageInfo.finalPrice;

    const bookingCode =
      (bookingData as any)?.bookingCode ||
      (apiBooking as any)?.bookingCode ||
      `BK${String(
        (bookingData as any)?.bookingId || (apiBooking as any)?.id || 0
      ).padStart(6, "0")}`;

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

  // Chọn nguồn dữ liệu ưu tiên từ API nếu có
  const sourceBooking: any = apiBooking || bookingData;

  // Xử lý dữ liệu cho single session / package booking
  const isSingleSession =
    sourceBooking.bookingType === "SINGLE_SESSION" ||
    sourceBooking.bookingType === "SINGLE";

  const mappedPackageSessions = (sourceBooking.sessions || []).map(
    (s: any) => ({
      date: s.sessionDate || s.date,
      time:
        s.timeSlot ||
        (s.startTime && s.endTime
          ? `${s.startTime.toString().slice(0, 5)} - ${s.endTime
              .toString()
              .slice(0, 5)}`
          : undefined),
      subjectName:
        s.subjectName || s.subject?.name || sourceBooking.session?.subject,
      fee: Number(s.fee) || 0,
    })
  );

  const displaySessions = isSingleSession
    ? [
        {
          date: sourceBooking.session?.date || mappedPackageSessions[0]?.date,
          time: sourceBooking.session?.time || mappedPackageSessions[0]?.time,
          subjectName:
            sourceBooking.session?.subject ||
            mappedPackageSessions[0]?.subjectName,
          fee:
            sourceBooking.session?.fee ||
            mappedPackageSessions[0]?.fee ||
            Number(sourceBooking.totalAmount) ||
            0,
        },
      ]
    : mappedPackageSessions;

  // Chuẩn hóa và sắp xếp danh sách buổi (gần nhất → xa nhất)
  const toMinutes = (hhmm?: string) => {
    if (!hhmm || hhmm.length < 5) return 0;
    const h = parseInt(hhmm.slice(0, 2) || "0", 10);
    const m = parseInt(hhmm.slice(3, 5) || "0", 10);
    return h * 60 + m;
  };
  const parseTimeStart = (time?: string) =>
    time ? toMinutes(time.split("-")[0]?.trim()) : 0;
  const parseDateNum = (d?: string) =>
    d ? new Date(d).getTime() : Number.POSITIVE_INFINITY;
  const sortedSessions = (displaySessions || [])
    .map((s) => ({
      date: s.date,
      time: s.time,
      subjectName: s.subjectName,
      fee: s.fee,
      _dateNum: parseDateNum(s.date),
      _startMin: parseTimeStart(s.time),
    }))
    .sort((a, b) =>
      a._dateNum === b._dateNum
        ? a._startMin - b._startMin
        : a._dateNum - b._dateNum
    );

  // Tạo thông tin gói hiển thị an toàn ngay cả khi không có packageInfo trong state
  const computedPackageBaseTotal = !isSingleSession
    ? (Array.isArray(displaySessions) && displaySessions.length > 0
        ? displaySessions.reduce(
            (sum: number, s: { fee?: number }) => sum + (Number(s.fee) || 0),
            0
          )
        : 0) ||
      Number(sourceBooking.totalAmount) ||
      0
    : 0;

  const displayPackageInfo = isSingleSession
    ? {
        totalDays: 1,
        packageType: "Buổi học đơn",
        pricePerSession: sourceBooking.session?.fee || 0,
        totalPrice: sourceBooking.session?.fee || 0,
        discount: 0,
        finalPrice: sourceBooking.session?.fee || 0,
      }
    : sourceBooking.packageInfo || {
        totalDays:
          (Array.isArray(displaySessions) && displaySessions.length) ||
          Number(sourceBooking.totalSessions) ||
          0,
        packageType: "Gói học",
        pricePerSession:
          Array.isArray(displaySessions) && displaySessions.length > 0
            ? Math.round(
                (computedPackageBaseTotal || 0) / displaySessions.length
              )
            : Number(sourceBooking.totalAmount) || 0,
        totalPrice: computedPackageBaseTotal || 0,
        discount: 0,
        finalPrice: computedPackageBaseTotal || 0,
      };

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
      name: "QR Code",
      icon: <QRCodeIcon />,
      description: "Quét QR để thanh toán",
      available: true,
    },
  ];

  // Modal: thiếu tín dụng
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const goToTopUp = () => {
    navigate("/settings?tab=credit#topup", {
      replace: true,
      state: { activeTab: "credit", openTopUp: true },
    });
  };

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
        // Pre-check credit balance: nếu thiếu thì chuyển thẳng tới phần nạp tín dụng
        const requiredAmount = displayPackageInfo.finalPrice;
        if (Number(creditBalance) < Number(requiredAmount)) {
          setShowInsufficientModal(true);
          return;
        }
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

          // Bổ sung studentId và tutorUserId để backend không lỗi id null
          const { studentId, tutorUserId } = await getPaymentContext();

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
              studentId: studentId,
              tutorId: tutorUserId,
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
            // Thanh toán thành công - xóa deadline khỏi localStorage
            const bookingId = bookingData.bookingId || bookingData.bookingCode;
            const localStorageKey = `paymentDeadline_${bookingId}`;
            localStorage.removeItem(localStorageKey);

            // Thanh toán thành công - chuyển đến trang buổi học của tôi
            alert("Thanh toán thành công! Đặt lịch hoàn tất.");
            navigate("/my-sessions");
          } else {
            // Fallback: nếu backend báo thiếu tín dụng, điều hướng thẳng tới phần nạp
            if (
              result.message &&
              result.message.includes("Insufficient credit balance")
            ) {
              setShowInsufficientModal(true);
            } else {
              alert("Thanh toán thất bại: " + result.message);
            }
          }
        } else {
          console.error("Cannot create payment:", bookingData);
          alert("Không thể tạo thông tin thanh toán. Vui lòng thử lại.");
        }
      } else if (selectedPaymentMethod === "sepay-qr") {
        // Thanh toán QR: tạo QR và chuyển sang chế độ hiển thị QR, ẩn nút thanh toán
        generateSepayQr();
        setSepayReady(true);
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      {bookingData.tutor?.avatar ? (
                        <img
                          src={bookingData.tutor.avatar}
                          alt="Tutor Avatar"
                          className="w-12 h-12 object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "rgb(148, 204, 230)" }}
                        >
                          <span className="text-white font-semibold text-lg">
                            {(bookingData.tutor?.name || "G").charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {bookingData.tutor?.name || "Gia sư"}
                      </h3>
                      {/* Ghi chú nếu có */}
                      {bookingData?.note && (
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {bookingData.note}
                        </p>
                      )}
                      <div className="flex items-center space-x-1 mt-1">
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
              </div>

              {/* Package Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {isSingleSession ? "Chi tiết buổi học" : "Chi tiết gói học"}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Mã lịch học:</span>
                    <span className="font-medium ">
                      {(bookingData as any)?.bookingCode ||
                        (bookingData as any)?.booking?.bookingCode ||
                        (bookingData as any)?.code ||
                        `BK${String(
                          (bookingData as any)?.bookingId || 0
                        ).padStart(6, "0")}`}
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
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Lịch học đã chọn
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Buổi
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Môn học
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">
                          Học phí
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Ngày
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Giờ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {sortedSessions.map((s, idx) => (
                        <tr key={`${s.date}-${s.time}-${idx}`}>
                          <td className="px-3 py-2 text-gray-900">{idx + 1}</td>
                          <td className="px-3 py-2 text-gray-900">
                            {s.subjectName || "Môn học"}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900">
                            {typeof s.fee === "number"
                              ? s.fee.toLocaleString("vi-VN") + " VNĐ"
                              : "Chưa có"}
                          </td>
                          <td className="px-3 py-2 text-gray-900">
                            {s.date
                              ? new Date(s.date).toLocaleDateString("vi-VN")
                              : "—"}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {s.time || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3 mb-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedPaymentMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setSelectedPaymentMethod(method.id);
                        // Reset QR display state when switching methods
                        setSepayReady(false);
                        if (method.id !== "sepay-qr") {
                          setSepayQrUrl("");
                          setSepayStatus("");
                        }
                      }}
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
                {selectedPaymentMethod === "sepay-qr" &&
                  sepayReady &&
                  sepayQrUrl && (
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
                            Mã lịch học:{" "}
                            {(bookingData as any)?.bookingCode ||
                              (bookingData as any)?.booking?.bookingCode ||
                              (bookingData as any)?.code ||
                              `BK${String(
                                (bookingData as any)?.bookingId || 0
                              ).padStart(6, "0")}`}
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

                  {isExpired ? (
                    <div className="space-y-3">
                      <button
                        disabled
                        className="w-full py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg opacity-50 cursor-not-allowed"
                        style={{ backgroundColor: "#6B7280" }}
                      >
                        Thanh toán đã hết hạn
                      </button>
                      <button
                        onClick={() => navigate("/user/search")}
                        className="w-full py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      >
                        Đặt lịch lại
                      </button>
                    </div>
                  ) : selectedPaymentMethod === "sepay-qr" &&
                    sepayReady &&
                    sepayQrUrl ? null : (
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
                  )}

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
      {/* Modal: Không đủ tín dụng */}
      {showInsufficientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setShowInsufficientModal(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Không đủ tín dụng
              </h3>
            </div>
            <div className="px-6 py-4 space-y-2">
              <p className="text-sm text-gray-700">
                Số dư tín dụng hiện tại của bạn không đủ để thanh toán giao dịch
                này.
              </p>
              <p className="text-sm text-gray-700">
                Vui lòng nạp thêm tín dụng để tiếp tục.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowInsufficientModal(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={goToTopUp}
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: "rgb(148, 204, 230)" }}
              >
                Nạp tín dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
