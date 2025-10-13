import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { BookingStats, BookingStatus } from "../../types";

// Icons
const CalendarIcon = () => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ClockIcon = () => (
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
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const UserIcon = () => (
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
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const CreditIcon = () => (
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
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
);

const QRCodeIcon = () => (
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
      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
    />
  </svg>
);

const BookIcon = () => (
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
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const CancelIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const RefundIcon = () => (
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
      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
    />
  </svg>
);

const MySessions: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isCalendarView, setIsCalendarView] = useState<boolean>(() => {
    try {
      return localStorage.getItem("mysessions_view") === "calendar";
    } catch {
      return false;
    }
  });

  const [calendarViewType, setCalendarViewType] = useState<
    "day" | "month" | "year"
  >(() => {
    try {
      return (
        (localStorage.getItem("mysessions_calendar_type") as
          | "day"
          | "month"
          | "year") || "month"
      );
    } catch {
      return "month";
    }
  });

  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    try {
      localStorage.setItem(
        "mysessions_view",
        isCalendarView ? "calendar" : "list"
      );
    } catch {}
  }, [isCalendarView]);

  useEffect(() => {
    try {
      localStorage.setItem("mysessions_calendar_type", calendarViewType);
    } catch {}
  }, [calendarViewType]);

  const toggleView = () => setIsCalendarView((prev) => !prev);

  const navigateCalendar = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (calendarViewType === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (calendarViewType === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (calendarViewType === "year") {
      newDate.setFullYear(
        newDate.getFullYear() + (direction === "next" ? 1 : -1)
      );
    }
    setCurrentDate(newDate);
  };

  const getCalendarInfo = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const date = baseDate.getDate();

    if (calendarViewType === "day") {
      return { year, month, date, type: "day" as const };
    } else if (calendarViewType === "month") {
      const firstDayOfMonth = new Date(year, month, 1);
      const startWeekday = firstDayOfMonth.getDay(); // 0=Sun
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return { year, month, startWeekday, daysInMonth, type: "month" as const };
    } else {
      return { year, type: "year" as const };
    }
  };

  const getDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const buildBookingMapByDate = (items: any[]) => {
    const map = new Map<string, any[]>();
    for (const b of items) {
      const key = b?.date ?? "";
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return map;
  };
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "ALL">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // States for cancel/refund functionality
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [refundMethod, setRefundMethod] = useState<"credit" | "bank">("credit");
  const [userCreditBalance, setUserCreditBalance] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(50000);

  // Load bookings from API
  useEffect(() => {
    loadBookings();
  }, [selectedStatus, currentPage]);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: (currentPage - 1).toString(), // Convert to zero-based pagination
        size: "10",
        ...(selectedStatus !== "ALL" && { status: selectedStatus }),
      });

      console.log("API call params:", params.toString());

      const response = await fetch(
        `/api/booking/student/my-bookings?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("=== MySessions API Response ===");
        console.log("Full response:", data);
        console.log("Content:", data.content);
        console.log("Content length:", data.content?.length);

        setBookings(data.content || []);
        setTotalPages(data.totalPages || 1);

        // Calculate stats
        const statsData = {
          totalBookings: data.totalElements || 0,
          pendingBookings:
            data.content?.filter((b: any) => b.status === "PENDING").length ||
            0,
          completedBookings:
            data.content?.filter((b: any) => b.status === "COMPLETED").length ||
            0,
          cancelledBookings:
            data.content?.filter((b: any) => b.status === "CANCELLED").length ||
            0,
        };
        setStats(statsData);
        console.log("Stats calculated:", statsData);
      } else {
        console.error("API Error:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        alert("Không thể tải danh sách buổi học");
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      alert("Có lỗi xảy ra khi tải dữ liệu");
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "CREDIT":
        return <CreditIcon />;
      case "SEPAY_QR":
        return <QRCodeIcon />;
      default:
        return <CreditIcon />;
    }
  };

  // Get payment method name
  const getPaymentMethodName = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "CREDIT":
        return "Tín dụng";
      case "SEPAY_QR":
        return "QR SePay";
      default:
        return "Thẻ tín dụng";
    }
  };

  const handlePayment = async (booking: any) => {
    try {
      // Create payment for existing booking
      const token = localStorage.getItem("token");
      const paymentRequest = {
        bookingId: booking.id,
        studentId: booking.student?.id,
        tutorId: booking.tutor?.user?.id,
        amount: booking.totalAmount || booking.sessionFee || 0,
        originalAmount: booking.totalAmount || booking.sessionFee || 0,
        paymentMethod: "CREDIT", // Default payment method
        description: `Payment for booking #${booking.id}`,
        couponId: null,
      };

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentRequest),
      });

      const result = await response.json();

      if (result.success) {
        // Navigate to payment page with payment data
        navigate("/payment", {
          state: {
            bookingId: booking.id,
            paymentId: result.payment.id,
            bookingType: "SINGLE_SESSION",
            totalAmount: booking.totalAmount || booking.sessionFee || 0,
            tutor: {
              id: booking.tutor?.id,
              name: `${booking.tutor?.user?.firstName || ""} ${
                booking.tutor?.user?.lastName || ""
              }`,
              subject: booking.subject?.name || "",
              avatar: booking.tutor?.user?.imageAvatar || "/default-avatar.png",
            },
            session: {
              date: booking.date,
              time: `${booking.fromTime} - ${booking.toTime}`,
              subject: booking.subject?.name || "",
              fee: booking.totalAmount || booking.sessionFee || 0,
            },
            note: booking.note,
          },
        });
      } else {
        alert("Không thể tạo thanh toán: " + result.message);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Có lỗi xảy ra khi tạo thanh toán");
    }
  };

  // Get refund percentage based on cancellation time
  const getRefundPercentage = (booking: any) => {
    const sessionTime = new Date(`${booking.date}T${booking.fromTime}`);
    const now = new Date();
    const hoursUntilSession =
      (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSession >= 48) {
      return 100; // Full refund
    } else if (hoursUntilSession >= 24) {
      return 50; // 50% refund
    } else {
      return 0; // No refund
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async (booking: any) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  // Confirm cancellation
  const confirmCancellation = async () => {
    if (!bookingToCancel) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/booking/student/cancel/${bookingToCancel.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setShowCancelModal(false);
        setBookingToCancel(null);
        loadBookings(); // Reload bookings
        alert("Hủy lịch học thành công!");
      } else {
        alert("Không thể hủy lịch học");
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      alert("Có lỗi xảy ra khi hủy lịch học");
    }
  };

  // Handle refund request
  const handleRefundRequest = async (booking: any) => {
    setSelectedBooking(booking);
    setShowRefundModal(true);
  };

  // Confirm refund
  const confirmRefund = async () => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem("token");
      const refundPercentage = getRefundPercentage(selectedBooking);
      const refundAmount =
        (selectedBooking.totalAmount * refundPercentage) / 100;

      const response = await fetch(
        `/api/payments/refund/${selectedBooking.payment.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            refundAmount,
            refundMethod: refundMethod,
            reason: "Hủy lịch học",
          }),
        }
      );

      if (response.ok) {
        setShowRefundModal(false);
        setSelectedBooking(null);
        loadBookings(); // Reload bookings
        alert(
          `Yêu cầu hoàn tiền thành công! Số tiền hoàn: ${refundAmount.toLocaleString()} VNĐ`
        );
      } else {
        alert("Không thể tạo yêu cầu hoàn tiền");
      }
    } catch (error) {
      console.error("Refund error:", error);
      alert("Có lỗi xảy ra khi tạo yêu cầu hoàn tiền");
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return "bg-orange-100 text-orange-800";
      case "PAYMENT_COMPLETED":
        return "bg-green-100 text-green-800";
      case "TUTOR_APPROVED":
        return "bg-blue-100 text-blue-800";
      case "TUTOR_REJECTED":
        return "bg-red-100 text-red-800";
      case "UPCOMING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        // Handle unknown statuses like PAYMENT_COMPLETED
        if (String(status) === "PAYMENT_COMPLETED") {
          return "bg-green-100 text-green-800";
        }
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return "Chờ thanh toán";
      case "PAYMENT_COMPLETED":
        return "Đã thanh toán";
      case "TUTOR_APPROVED":
        return "Giảng viên đã chấp nhận";
      case "TUTOR_REJECTED":
        return "Giảng viên đã từ chối";
      case "UPCOMING":
        return "Sắp diễn ra";
      case "IN_PROGRESS":
        return "Đang diễn ra";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "REJECTED":
        return "Bị từ chối";
      default:
        if (String(status) === "PAYMENT_COMPLETED") {
          return "Đã thanh toán";
        }
        return String(status);
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

  const canCancel = (status: BookingStatus) => {
    const s = String(status);
    return (
      s === "PAYMENT_PENDING" ||
      s === "PAYMENT_COMPLETED" ||
      s === "TUTOR_APPROVED" ||
      s === "UPCOMING"
    );
  };

  const canCancelBooking = (booking: any) => {
    // Check status first - allow cancel for all cancellable statuses
    if (!canCancel(booking.status)) {
      console.log(
        `❌ Cannot cancel booking ${booking.id}: status ${booking.status} not allowed`
      );
      return false;
    }

    // Always allow cancel button to show, but with different policies
    const hoursUntil = getHoursUntilSession(booking.date, booking.time);

    console.log(`🔍 Booking ${booking.id} cancel check:`, {
      status: booking.status,
      paymentStatus: booking.payment?.paymentStatus,
      hoursUntil,
      result: true, // Always show cancel button
    });

    return true; // Always show cancel button
  };

  // Debug function to test button logic
  const debugButtonLogic = () => {
    console.log("🧪 Testing button logic with sample data:");

    const sampleBookings = [
      {
        id: 1,
        status: "PENDING",
        payment: null,
        date: "2024-12-15",
        time: "10:00",
      },
      {
        id: 2,
        status: "PAYMENT_PENDING",
        payment: { paymentStatus: "PENDING" },
        date: "2024-12-15",
        time: "10:00",
      },
      {
        id: 3,
        status: "PAID",
        payment: { paymentStatus: "COMPLETED" },
        date: "2024-12-15",
        time: "10:00",
      },
      {
        id: 4,
        status: "TUTOR_APPROVED",
        payment: { paymentStatus: "COMPLETED" },
        date: "2024-12-15",
        time: "10:00",
      },
      {
        id: 5,
        status: "CONFIRMED",
        payment: { paymentStatus: "COMPLETED" },
        date: "2024-12-15",
        time: "10:00",
      },
      {
        id: 6,
        status: "COMPLETED",
        payment: { paymentStatus: "COMPLETED" },
        date: "2024-10-01",
        time: "10:00",
      },
    ];

    sampleBookings.forEach((booking) => {
      console.log(`\n📋 Booking ${booking.id}:`, {
        status: booking.status,
        paymentStatus: booking.payment?.paymentStatus,
        date: booking.date,
        time: booking.time,
      });

      // Test payment button
      const statusStr = String(booking.status);
      const alreadyPaidByStatus =
        statusStr === "PAYMENT_COMPLETED" ||
        statusStr === "TUTOR_APPROVED" ||
        statusStr === "UPCOMING";
      const showPayment =
        !alreadyPaidByStatus &&
        (!booking.payment || booking.payment.paymentStatus !== "COMPLETED");
      console.log(`  💳 Payment button: ${showPayment ? "SHOW" : "HIDE"}`);

      // Test cancel button
      const canCancel = canCancelBooking(booking);
      console.log(`  ❌ Cancel button: ${canCancel ? "SHOW" : "HIDE"}`);

      // Test reschedule button
      const canRescheduleResult = canReschedule(booking);
      console.log(
        `  🔄 Reschedule button: ${canRescheduleResult ? "SHOW" : "HIDE"}`
      );
    });
  };

  // Helper functions for booking actions
  const getHoursUntilSession = (sessionDate: string, sessionTime: string) => {
    if (!sessionDate || !sessionTime) return 0;
    try {
      const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
      const now = new Date();
      return Math.floor(
        (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      );
    } catch (error) {
      console.error("Error calculating hours until session:", error);
      return 0;
    }
  };

  const canReschedule = (booking: any) => {
    const hoursUntil = getHoursUntilSession(booking.date, booking.time);
    const canRescheduleByTime = hoursUntil >= 48;
    const s = String(booking.status);
    const canRescheduleByStatus =
      s === "PAYMENT_PENDING" ||
      s === "PAYMENT_COMPLETED" ||
      s === "TUTOR_APPROVED" ||
      s === "UPCOMING";

    console.log(`🔄 Booking ${booking.id} reschedule check:`, {
      status: booking.status,
      paymentStatus: booking.payment?.paymentStatus,
      hoursUntil,
      canRescheduleByTime,
      canRescheduleByStatus,
      result: canRescheduleByTime && canRescheduleByStatus,
    });

    return canRescheduleByTime && canRescheduleByStatus;
  };

  const canRequestRefund = (booking: any) => {
    // Can request refund within 48 hours after session completion
    if (booking.status !== "COMPLETED") return false;

    try {
      const sessionDateTime = new Date(`${booking.date}T${booking.time}`);
      const sessionEndTime = new Date(
        sessionDateTime.getTime() + 2 * 60 * 60 * 1000
      ); // Add 2 hours for session duration
      const now = new Date();
      const hoursSinceEnd = Math.floor(
        (now.getTime() - sessionEndTime.getTime()) / (1000 * 60 * 60)
      );
      return hoursSinceEnd <= 48;
    } catch (error) {
      console.error("Error calculating refund eligibility:", error);
      return false;
    }
  };

  // Get cancellation policy based on hours until session
  const getCancellationPolicy = (booking: any) => {
    const hoursUntil = getHoursUntilSession(booking.date, booking.time);

    if (hoursUntil >= 48) {
      return {
        type: "FULL_REFUND",
        title: "Hủy trước 48 giờ",
        description: "Bạn sẽ được hoàn tiền 100% hoặc đổi lịch học",
        refundPercentage: 100,
        canReschedule: true,
        canRefund: true,
      };
    } else if (hoursUntil >= 24) {
      return {
        type: "PARTIAL_REFUND",
        title: "Hủy trước 24 giờ",
        description: "Bạn sẽ được hoàn tiền 50% vào tài khoản hệ thống",
        refundPercentage: 50,
        canReschedule: false,
        canRefund: true,
      };
    } else {
      return {
        type: "NO_REFUND",
        title: "Hủy trong vòng 24 giờ",
        description: "Bạn sẽ không được hoàn tiền",
        refundPercentage: 0,
        canReschedule: false,
        canRefund: false,
      };
    }
  };

  // Handle message navigation
  const handleMessage = (booking: any) => {
    console.log("handleMessage called with booking:", booking);

    // Try different ways to get tutor ID
    let tutorId = null;

    if (booking.tutor?.user?.id) {
      tutorId = booking.tutor.user.id;
    } else if (booking.tutorId) {
      tutorId = booking.tutorId;
    } else if (booking.tutor?.id) {
      tutorId = booking.tutor.id;
    } else if (booking.tutorUserId) {
      tutorId = booking.tutorUserId;
    }

    console.log("Resolved tutorId:", tutorId);

    if (tutorId) {
      navigate(`/messages?tutor=${tutorId}`);
    } else {
      console.error("Could not find tutor ID in booking:", booking);
      alert("Không thể xác định thông tin giảng viên để nhắn tin");
    }
  };

  // Handle reschedule
  const handleReschedule = (booking: any) => {
    const hoursUntil = getHoursUntilSession(booking.date, booking.time);
    if (hoursUntil < 48) {
      alert("Chỉ có thể đổi lịch trước 48 giờ!");
      return;
    }
    navigate(`/booking/reschedule/${booking.id}`);
  };

  // Handle rating
  const handleRating = (booking: any) => {
    navigate(`/rating/${booking.id}`);
  };

  // Handle tip
  const handleTip = async (booking: any) => {
    // Check user credit balance first
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/credit/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Show tip modal with current balance
        setSelectedBooking(booking);
        setShowTipModal(true);
        setUserCreditBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Error checking balance:", error);
      alert("Không thể kiểm tra số dư tín dụng");
    }
  };

  // Confirm tip payment
  const confirmTip = async () => {
    if (!selectedBooking) return;

    if (userCreditBalance < tipAmount) {
      // Navigate to top-up page
      navigate("/settings?tab=credit");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/credit/tip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tutorId: selectedBooking.tutor?.user?.id || selectedBooking.tutorId,
          amount: tipAmount,
          bookingId: selectedBooking.id,
          description: `Tip cho buổi học ${
            selectedBooking.subject?.name || "N/A"
          }`,
        }),
      });

      if (response.ok) {
        setShowTipModal(false);
        setSelectedBooking(null);
        alert(`Tip thành công ${tipAmount.toLocaleString()} VNĐ!`);
      } else {
        alert("Không thể gửi tip");
      }
    } catch (error) {
      console.error("Tip error:", error);
      alert("Có lỗi xảy ra khi gửi tip");
    }
  };

  // Helper to format time from HH:MM:SS to HH:MM
  const formatTime = (time?: string) => {
    if (!time) return "";
    const parts = String(time).split(":");
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return String(time);
  };

  const getBookingFee = (booking: any): number => {
    return booking?.totalAmount ?? booking?.amount ?? booking?.sessionFee ?? 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Thống kê */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Tổng Booking
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalBookings}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <BookIcon />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Chờ xử lý
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.pendingBookings}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <ClockIcon />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Hoàn thành
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.completedBookings}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Đã hủy
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.cancelledBookings}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <svg
                    className="w-5 h-5 text-white"
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bộ lọc và Hành động */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <select
                  value={selectedStatus || ""}
                  onChange={(e) =>
                    setSelectedStatus(
                      (e.target.value as BookingStatus) || undefined
                    )
                  }
                  className="pl-4 pr-8 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 font-medium"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PAYMENT_PENDING">Chờ thanh toán</option>
                  <option value="PAYMENT_COMPLETED">Đã thanh toán</option>
                  <option value="TUTOR_APPROVED">
                    Giảng viên đã chấp nhận
                  </option>
                  <option value="TUTOR_REJECTED">Giảng viên đã từ chối</option>
                  <option value="UPCOMING">Sắp diễn ra</option>
                  <option value="IN_PROGRESS">Đang diễn ra</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="REFUNDED">Đã hoàn tiền</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <Link
                to="/find-tutor"
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                <UserIcon />
                <span className="ml-2">Tìm gia sư</span>
              </Link>
              <button
                onClick={toggleView}
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2v-8H3v8a2 2 0 002 2z"
                  />
                </svg>
                {isCalendarView ? "Dạng danh sách" : "Dạng lịch"}
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách / Lịch booking */}
        {isCalendarView ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            {/* Calendar Header with Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateCalendar("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                  {(() => {
                    const info = getCalendarInfo(currentDate);
                    if (info.type === "day") {
                      return `${currentDate.getDate()}/${
                        currentDate.getMonth() + 1
                      }/${currentDate.getFullYear()}`;
                    } else if (info.type === "month") {
                      return `Tháng ${
                        currentDate.getMonth() + 1
                      }/${currentDate.getFullYear()}`;
                    } else {
                      return `Năm ${currentDate.getFullYear()}`;
                    }
                  })()}
                </h3>
                <button
                  onClick={() => navigateCalendar("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={calendarViewType}
                  onChange={(e) =>
                    setCalendarViewType(
                      e.target.value as "day" | "month" | "year"
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">Ngày</option>
                  <option value="month">Tháng</option>
                  <option value="year">Năm</option>
                </select>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Hôm nay
                </button>
              </div>
            </div>

            {/* Calendar Content */}
            {(() => {
              const info = getCalendarInfo(currentDate);
              const bookingMap = buildBookingMapByDate(bookings);

              if (info.type === "day") {
                const key = getDateKey(currentDate);
                const items = bookingMap.get(key) || [];
                return (
                  <div className="space-y-3">
                    <div className="text-center text-gray-600 mb-4">
                      {items.length} buổi học trong ngày
                    </div>
                    {items.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Không có buổi học nào trong ngày này
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {items.map((bk) => (
                          <div
                            key={bk.id}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {bk.subject?.name || "Môn học"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {(bk.fromTime || "").slice(0, 5)} -{" "}
                                  {(bk.toTime || "").slice(0, 5)}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const tutorId = bk.tutor?.id || bk.tutorId;
                                  if (tutorId) navigate(`/tutor/${tutorId}`);
                                }}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else if (info.type === "month") {
                const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                const emptyCells = Array.from(
                  { length: info.startWeekday! },
                  () => null
                );
                const dayCells = Array.from(
                  { length: info.daysInMonth! },
                  (_, i) => i + 1
                );
                const cells: (number | null)[] = [...emptyCells, ...dayCells];

                return (
                  <>
                    <div className="grid grid-cols-7 gap-2 text-xs text-gray-600 mb-2">
                      {weekDays.map((w) => (
                        <div key={w} className="text-center font-medium">
                          {w}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {cells.map((day, idx) => {
                        if (day === null) {
                          return (
                            <div
                              key={`empty-${idx}`}
                              className="h-28 bg-gray-50 border border-gray-100 rounded-lg"
                            />
                          );
                        }
                        const date = new Date(info.year, info.month!, day);
                        const key = getDateKey(date);
                        const items = bookingMap.get(key) || [];
                        return (
                          <div
                            key={key}
                            className="h-28 bg-white border border-gray-200 rounded-lg p-2 flex flex-col"
                          >
                            <div className="text-right text-xs text-gray-500">
                              {day}
                            </div>
                            <div className="mt-1 space-y-1 overflow-auto">
                              {items.slice(0, 3).map((bk) => (
                                <button
                                  key={bk.id}
                                  onClick={() => {
                                    const tutorId = bk.tutor?.id || bk.tutorId;
                                    if (tutorId) navigate(`/tutor/${tutorId}`);
                                  }}
                                  className="w-full text-left px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-[11px] text-blue-700 truncate"
                                  title={`${bk.subject?.name || "Môn"} • ${
                                    bk.date
                                  } ${bk.fromTime?.slice(0, 5) || ""}`}
                                >
                                  {bk.subject?.name || "Môn"} •{" "}
                                  {(bk.fromTime || "").slice(0, 5)}
                                </button>
                              ))}
                              {items.length > 3 && (
                                <div className="text-[11px] text-gray-500">
                                  +{items.length - 3} buổi
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              } else {
                // Year view - show months
                const months = Array.from({ length: 12 }, (_, i) => i);
                return (
                  <div className="grid grid-cols-4 gap-4">
                    {months.map((monthIdx) => {
                      const monthBookings = bookings.filter((b) => {
                        const bookingDate = new Date(b.date);
                        return (
                          bookingDate.getFullYear() === info.year &&
                          bookingDate.getMonth() === monthIdx
                        );
                      });
                      return (
                        <button
                          key={monthIdx}
                          onClick={() => {
                            setCurrentDate(new Date(info.year, monthIdx, 1));
                            setCalendarViewType("month");
                          }}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                        >
                          <div className="font-medium text-gray-900">
                            Tháng {monthIdx + 1}
                          </div>
                          <div className="text-sm text-gray-600">
                            {monthBookings.length} buổi học
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              }
            })()}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-center py-16">
              <div
                className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <BookIcon />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có buổi học nào
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Bắt đầu hành trình học tập của bạn bằng cách đặt lịch học đầu
                tiên với gia sư phù hợp.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/find-tutor"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  <UserIcon />
                  <span className="ml-2">Tìm gia sư</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Header với status */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      >
                        {getBookingTypeText(booking.bookingType)}
                      </span>
                      {booking.paymentMethod && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          {getPaymentMethodIcon(booking.paymentMethod)}
                          <span className="ml-1">
                            {getPaymentMethodName(booking.paymentMethod)}
                          </span>
                        </span>
                      )}
                    </div>
                    {/* nút Hủy ở góc phải đã xóa theo yêu cầu */}
                  </div>

                  {/* Hàng thông tin gọn: avatar + tên/môn + (ngày • giờ • học phí) */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                        onClick={() => {
                          const tutorId = booking.tutor?.id || booking.tutorId;
                          if (tutorId) {
                            navigate(`/tutor/${tutorId}`);
                          } else {
                            alert("Không tìm thấy thông tin giảng viên");
                          }
                        }}
                      >
                        <span className="text-white font-semibold text-lg">
                          {(
                            booking.tutor?.user?.firstName ??
                            booking.tutor?.firstName ??
                            "G"
                          ).charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:underline"
                          onClick={() => {
                            const tutorId =
                              booking.tutor?.id || booking.tutorId;
                            if (tutorId) {
                              navigate(`/tutor/${tutorId}`);
                            } else {
                              alert("Không tìm thấy thông tin giảng viên");
                            }
                          }}
                        >
                          {(booking.tutor?.user?.firstName ??
                            booking.tutor?.firstName ??
                            "") +
                            " " +
                            (booking.tutor?.user?.lastName ??
                              booking.tutor?.lastName ??
                              "")}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {booking.subject?.name ?? ""}
                        </p>
                      </div>
                    </div>
                    {/* compact meta info next to name/subject (2 lines) */}
                    <div className="flex flex-col text-sm text-gray-600 gap-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <CalendarIcon />
                          <span className="font-medium">{booking.date}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1">
                          <ClockIcon />
                          <span className="font-medium">
                            {formatTime(booking.fromTime)} -{" "}
                            {formatTime(booking.toTime)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">
                          Học phí:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {getBookingFee(booking).toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                    </div>
                    {/* Cụm nút 2 hàng căn phải */}
                    <div className="ml-auto flex flex-col items-end gap-2">
                      <div className="flex flex-wrap gap-2 justify-end">
                        {(() => {
                          const statusStr = String(booking.status);
                          const alreadyPaidByStatus =
                            statusStr === "PAYMENT_COMPLETED" ||
                            statusStr === "TUTOR_APPROVED" ||
                            statusStr === "UPCOMING";
                          const showPayment =
                            !alreadyPaidByStatus &&
                            (!booking.payment ||
                              booking.payment.paymentStatus !== "COMPLETED");
                          return showPayment;
                        })() && (
                          <button
                            onClick={() => handlePayment(booking)}
                            className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
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
                            Thanh toán
                          </button>
                        )}
                        {(() => {
                          const s = String(booking.status);
                          const showMessage =
                            s !== "PAYMENT_PENDING" && s !== "CANCELLED";
                          return showMessage;
                        })() && (
                          <button
                            onClick={() => handleMessage(booking)}
                            className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            Nhắn tin
                          </button>
                        )}
                        {canReschedule(booking) && (
                          <button
                            onClick={() => handleReschedule(booking)}
                            className="inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Đổi lịch
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {canCancelBooking(booking) && (
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            className="inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm"
                          >
                            <CancelIcon />
                            <span className="ml-2">Hủy lịch</span>
                          </button>
                        )}
                        {booking.status === "COMPLETED" && (
                          <button
                            onClick={() => handleRating(booking)}
                            className="inline-flex items-center justify-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium text-sm"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                            Đánh giá
                          </button>
                        )}
                        {booking.status === "COMPLETED" && (
                          <button
                            onClick={() => handleTip(booking)}
                            className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
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
                            Tip
                          </button>
                        )}
                        {booking.status === "COMPLETED" &&
                          canRequestRefund(booking) && (
                            <button
                              onClick={() => handleRefundRequest(booking)}
                              className="inline-flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium text-sm"
                            >
                              <RefundIcon />
                              <span className="ml-2">Hoàn tiền</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Ghi chú đặt cuối cùng, học phí đã hiển thị ở header */}
                    {booking.note && (
                      <div className="rounded-lg p-3 bg-gray-50 border border-gray-100">
                        <p className="text-sm text-gray-700">
                          📝 {booking.note}
                        </p>
                      </div>
                    )}

                    {/* Thông tin thanh toán */}
                    {booking.payment && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Phương thức thanh toán:
                          </span>
                          <span className="font-medium text-gray-900">
                            {getPaymentMethodName(
                              booking.payment.paymentMethod
                            )}
                          </span>
                        </div>
                        {booking.payment.paymentStatus && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-600">
                              Trạng thái thanh toán:
                            </span>
                            <span
                              className={`font-medium ${
                                booking.payment.paymentStatus === "COMPLETED"
                                  ? "text-green-600"
                                  : booking.payment.paymentStatus === "PENDING"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {booking.payment.paymentStatus === "COMPLETED"
                                ? "Đã thanh toán"
                                : booking.payment.paymentStatus === "PENDING"
                                ? "Chờ thanh toán"
                                : "Thất bại"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions (đã dời lên header) */}
                  <div className="mt-6 pt-4 border-t border-gray-100 hidden">
                    <div className="flex flex-wrap gap-2 justify-end">
                      {/* Nút thanh toán - chỉ hiển thị khi chưa thanh toán */}
                      {(() => {
                        const statusStr = String(booking.status);
                        const alreadyPaidByStatus =
                          statusStr === "PAYMENT_COMPLETED" ||
                          statusStr === "TUTOR_APPROVED" ||
                          statusStr === "UPCOMING";
                        const showPayment =
                          !alreadyPaidByStatus &&
                          (!booking.payment ||
                            booking.payment.paymentStatus !== "COMPLETED");
                        console.log(
                          `💳 Booking ${booking.id} payment button:`,
                          {
                            hasPayment: !!booking.payment,
                            paymentStatus: booking.payment?.paymentStatus,
                            status: statusStr,
                            alreadyPaidByStatus,
                            showPayment,
                            result: showPayment ? "SHOW" : "HIDE",
                          }
                        );
                        return showPayment;
                      })() && (
                        <button
                          onClick={() => handlePayment(booking)}
                          className="flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
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
                          Thanh toán
                        </button>
                      )}

                      {/* Nút nhắn tin - ẩn với PENDING/PAYMENT_PENDING/CANCELLED */}
                      {(() => {
                        const s = String(booking.status);
                        const showMessage =
                          s !== "PAYMENT_PENDING" && s !== "CANCELLED";
                        console.log(
                          `💬 Booking ${booking.id} message button:`,
                          {
                            status: s,
                            showMessage,
                          }
                        );
                        return showMessage;
                      })() && (
                        <button
                          onClick={() => handleMessage(booking)}
                          className="flex-1 min-w-[100px] inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          Nhắn tin
                        </button>
                      )}

                      {/* Nút đổi lịch - chỉ hiển thị khi có thể đổi */}
                      {canReschedule(booking) && (
                        <button
                          onClick={() => handleReschedule(booking)}
                          className="flex-1 min-w-[100px] inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Đổi lịch
                        </button>
                      )}

                      {/* Nút hủy lịch - chỉ hiển thị khi có thể hủy */}
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="flex-1 min-w-[100px] inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm"
                        >
                          <CancelIcon />
                          <span className="ml-2">Hủy lịch</span>
                        </button>
                      )}

                      {/* Nút đánh giá - chỉ hiển thị sau khi hoàn thành */}
                      {booking.status === "COMPLETED" && (
                        <button
                          onClick={() => handleRating(booking)}
                          className="flex-1 min-w-[100px] inline-flex items-center justify-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium text-sm"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                          Đánh giá
                        </button>
                      )}

                      {/* Nút tip - chỉ hiển thị sau khi hoàn thành */}
                      {booking.status === "COMPLETED" && (
                        <button
                          onClick={() => handleTip(booking)}
                          className="flex-1 min-w-[80px] inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
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
                          Tip
                        </button>
                      )}

                      {/* Nút hoàn tiền - chỉ hiển thị khi cần */}
                      {booking.status === "COMPLETED" &&
                        canRequestRefund(booking) && (
                          <button
                            onClick={() => handleRefundRequest(booking)}
                            className="flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium text-sm"
                          >
                            <RefundIcon />
                            <span className="ml-2">Hoàn tiền</span>
                          </button>
                        )}

                      {/* Nút xem thông tin giảng viên */}
                      <button
                        onClick={() => {
                          const tutorId = booking.tutor?.id || booking.tutorId;
                          if (tutorId) {
                            navigate(`/tutor/${tutorId}`);
                          } else {
                            alert("Không tìm thấy thông tin giảng viên");
                          }
                        }}
                        className="flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      >
                        <UserIcon />
                        <span className="ml-1">Xem thông tin giảng viên</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Đầu
              </button>

              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Trước
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                        currentPage === pageNum
                          ? "text-white"
                          : "text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                      style={{
                        backgroundColor:
                          currentPage === pageNum
                            ? "rgb(148, 204, 230)"
                            : "white",
                      }}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Sau
              </button>

              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cuối
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal &&
        bookingToCancel &&
        (() => {
          const policy = getCancellationPolicy(bookingToCancel);
          const hoursUntil = getHoursUntilSession(
            bookingToCancel.date,
            bookingToCancel.time
          );

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Xác nhận hủy lịch học
                </h3>

                {/* Booking Info */}
                <div className="mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Ngày học:</strong> {bookingToCancel.date}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Thời gian:</strong> {bookingToCancel.time}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Môn học:</strong>{" "}
                      {bookingToCancel.subject?.name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Còn lại:</strong> {hoursUntil} giờ
                    </p>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">
                    {policy.title}
                  </h4>
                  <div
                    className={`p-3 rounded-lg ${
                      policy.type === "FULL_REFUND"
                        ? "bg-green-50 border border-green-200"
                        : policy.type === "PARTIAL_REFUND"
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        policy.type === "FULL_REFUND"
                          ? "text-green-800"
                          : policy.type === "PARTIAL_REFUND"
                          ? "text-yellow-800"
                          : "text-red-800"
                      }`}
                    >
                      {policy.description}
                    </p>

                    {policy.canReschedule && (
                      <p className="text-sm text-green-700 mt-2">
                        ✅ Có thể đổi lịch học
                      </p>
                    )}

                    {policy.refundPercentage > 0 && (
                      <p className="text-sm text-blue-700 mt-2">
                        💰 Hoàn tiền: {policy.refundPercentage}%
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setBookingToCancel(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmCancellation}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Xác nhận hủy
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Refund Request Modal */}
      {showRefundModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Yêu cầu hoàn tiền
            </h3>
            <div className="mb-4">
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Ngày học:</strong> {selectedBooking.date}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Thời gian:</strong> {selectedBooking.fromTime} -{" "}
                  {selectedBooking.toTime}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Số tiền:</strong>{" "}
                  {selectedBooking.totalAmount?.toLocaleString()} VNĐ
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Tỷ lệ hoàn tiền:</strong>{" "}
                  {getRefundPercentage(selectedBooking)}%
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Số tiền hoàn:</strong>{" "}
                  {(
                    (selectedBooking.totalAmount *
                      getRefundPercentage(selectedBooking)) /
                    100
                  ).toLocaleString()}{" "}
                  VNĐ
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức nhận hoàn tiền:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="refundMethod"
                      value="credit"
                      checked={refundMethod === "credit"}
                      onChange={(e) =>
                        setRefundMethod(e.target.value as "credit" | "bank")
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">Nhận vào tài khoản tín dụng</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="refundMethod"
                      value="bank"
                      checked={refundMethod === "bank"}
                      onChange={(e) =>
                        setRefundMethod(e.target.value as "credit" | "bank")
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">
                      Chuyển vào tài khoản ngân hàng
                    </span>
                  </label>
                </div>
              </div>

              {refundMethod === "bank" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Để nhận hoàn tiền vào tài khoản ngân
                    hàng, bạn cần cập nhật thông tin tài khoản trong phần Cài
                    đặt.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (refundMethod === "bank") {
                    // Redirect to settings to update bank info
                    navigate("/settings", { state: { activeTab: "bank" } });
                  } else {
                    confirmRefund();
                  }
                }}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {refundMethod === "bank"
                  ? "Cập nhật thông tin"
                  : "Xác nhận hoàn tiền"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Gửi tip cho giảng viên
            </h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Gửi tip cho giảng viên {selectedBooking.tutor?.user?.firstName}{" "}
                {selectedBooking.tutor?.user?.lastName}
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Số dư tín dụng hiện tại:</strong>{" "}
                  {userCreditBalance.toLocaleString()} VNĐ
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền tip
                </label>
                <div className="space-y-2">
                  {[50000, 100000, 200000, 500000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTipAmount(amount)}
                      className={`w-full p-3 rounded-lg border text-left ${
                        tipAmount === amount
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {amount.toLocaleString()} VNĐ
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">
                    Hoặc nhập số tiền khác:
                  </label>
                  <input
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min="10000"
                    step="10000"
                  />
                </div>
              </div>
              {userCreditBalance < tipAmount && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">
                    Số dư không đủ. Bạn sẽ được chuyển đến trang nạp tín dụng.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTipModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmTip}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {userCreditBalance < tipAmount ? "Nạp tín dụng" : "Gửi tip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;
