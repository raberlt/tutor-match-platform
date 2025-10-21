import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { BookingStatus } from "../../types";
import api from "../../services/api";

// Types
interface Session {
  id: number;
  sessionDate: string;
  date?: string; // Field từ backend DTO
  startTime: string;
  endTime: string;
  status: string;
  rescheduleCount: number;
  fee?: number;
  subject?: { id?: number; name?: string; fees?: number };
}

interface Booking {
  id: number;
  bookingCode?: string;
  status: BookingStatus;
  bookingType: string;
  note?: string;
  totalSessions?: number;
  totalAmount?: number;
  tutor?: {
    id: number;
    firstName?: string;
    lastName?: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
  tutorId?: number;
  sessions?: Session[];
  paymentDeadline?: string;
  paymentStatus?: string; // Thêm thông tin trạng thái thanh toán
}

interface SessionHistory {
  id: number;
  oldDate: string;
  newDate: string;
  oldStartTime: string;
  newStartTime: string;
  changedAt: string;
}

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

const BookIcon = () => (
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
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const ChevronDownIcon = () => (
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
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const ChevronUpIcon = () => (
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
      d="M5 15l7-7 7 7"
    />
  </svg>
);

// MoneyIcon removed (table layout shows fee inline)

const MySessions: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isCalendarView, setIsCalendarView] = useState<boolean>(() => {
    try {
      return localStorage.getItem("mysessions_view") === "calendar";
    } catch {
      return false;
    }
  });

  const [calendarViewType, setCalendarViewType] = useState<
    "day" | "week" | "month" | "year"
  >(() => {
    try {
      return (
        (localStorage.getItem("mysessions_calendar_type") as
          | "day"
          | "week"
          | "month"
          | "year") || "month"
      );
    } catch {
      return "month";
    }
  });

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [tick, setTick] = useState<number>(0);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // Accordion state for session details
  const [expandedBookings, setExpandedBookings] = useState<Set<number>>(
    new Set()
  );

  // Session history modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSessionHistory, setSelectedSessionHistory] = useState<
    SessionHistory[]
  >([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        "mysessions_view",
        isCalendarView ? "calendar" : "list"
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [isCalendarView]);

  // Global ticker for countdown
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("mysessions_calendar_type", calendarViewType);
    } catch {
      // Ignore localStorage errors
    }
  }, [calendarViewType]);

  const toggleView = () => setIsCalendarView((prev) => !prev);

  // Toggle booking expansion for accordion
  const toggleBookingExpansion = (bookingId: number) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };

  // Fetch session change history
  const fetchSessionHistory = async (sessionId: number) => {
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/change-history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch session history");
      }

      const data = await response.json();
      setSelectedSessionHistory(data.data || []);
      setSelectedSessionId(sessionId);
      setShowHistoryModal(true);
    } catch (err) {
      console.error("Error fetching session history:", err);
    }
  };

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

    if (calendarViewType === "day") {
      return {
        title: baseDate.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        subtitle: "",
      };
    } else if (calendarViewType === "month") {
      return {
        title: baseDate.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
        }),
        subtitle: "",
      };
    } else {
      return {
        title: year.toString(),
        subtitle: "",
      };
    }
  };

  const loadBookings = async () => {
    try {
      const response = await api.get(
        "/booking/student/my-bookings?page=0&size=10"
      );

      console.log("Bookings data:", response.data);

      if (response.data.success && response.data.content) {
        setBookings(response.data.content || []);
      } else {
        console.error("Error response:", response.data);
        setBookings([]);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return "bg-orange-100 text-orange-800";
      case "PAYMENT_EXPIRED":
        return "bg-red-100 text-red-800";
      case "PAYMENT_COMPLETED":
        return "bg-green-100 text-green-800";
      case "TUTOR_ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "AWAITING_TUTOR_ACCEPT":
        return "bg-cyan-100 text-cyan-800";
      case "TUTOR_REJECTED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
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
      case "PAYMENT_EXPIRED":
        return "Quá hạn thanh toán";
      case "PAYMENT_COMPLETED":
        return "Đã thanh toán";
      case "AWAITING_TUTOR_ACCEPT":
        return "Chờ gia sư chấp nhận";
      case "TUTOR_ACCEPTED":
        return "Chờ thanh toán";
      case "TUTOR_REJECTED":
        return "Giảng viên đã từ chối";
      case "CANCELLED":
        return "Đã hủy";
      case "REFUNDED":
        return "Đã hoàn tiền";
      case "COMPLETED":
        return "Đã hoàn thành";
      default:
        if (String(status) === "PAYMENT_COMPLETED") {
          return "Đã thanh toán";
        }
        return String(status);
    }
  };

  const getBookingTypeText = (type: string) => {
    switch (type) {
      case "SINGLE":
        return "Học đơn";
      case "PACKAGE":
        return "Học theo gói";
      default:
        return type;
    }
  };

  // Session status helpers
  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
      case "PAYMENT_COMPLETED":
        return "bg-green-100 text-green-800";
      case "UPCOMING":
        return "bg-indigo-100 text-indigo-800";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800";
      case "RESCHEDULED":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  // Booking action buttons depending on status/type
  const renderBookingActions = (booking: Booking) => {
    const actions: React.ReactElement[] = [];
    const isPackage = booking.bookingType === "PACKAGE";

    // Tính giờ còn lại đến buổi học gần nhất (SINGLE)
    const getNextSessionHoursLeft = (): number | null => {
      try {
        if (!booking.sessions || booking.sessions.length === 0) return null;
        const sorted = [...booking.sessions].sort(
          (
            a: { sessionDate?: string; date?: string; startTime?: string },
            b: { sessionDate?: string; date?: string; startTime?: string }
          ) => {
            const ad = new Date(
              (a.sessionDate || a.date || "1970-01-01") as string
            ).getTime();
            const bd = new Date(
              (b.sessionDate || b.date || "1970-01-01") as string
            ).getTime();
            const at = (a.startTime || "00:00").substring(0, 5);
            const bt = (b.startTime || "00:00").substring(0, 5);
            return ad !== bd ? ad - bd : at.localeCompare(bt);
          }
        );
        const now = new Date();
        for (const s of sorted) {
          const d = new Date(
            (s.sessionDate || s.date || "1970-01-01") as string
          );
          const [hh, mm] = String(s.startTime || "00:00")
            .substring(0, 5)
            .split(":");
          d.setHours(Number(hh) || 0, Number(mm) || 0, 0, 0);
          const diffMs = d.getTime() - now.getTime();
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          if (diffMs > 0) return hours;
        }
        return null;
      } catch {
        return null;
      }
    };
    switch (String(booking.status)) {
      case "AWAITING_TUTOR_ACCEPT":
        if (isPackage) {
          actions.push(
            <button
              key="chat"
              className="px-3 py-2 rounded-md text-white shadow-lg hover:shadow-xl"
              style={{ backgroundColor: "#94cce6" }}
              onClick={() => handleChat(booking)}
            >
              Nhắn tin
            </button>
          );
          actions.push(
            <button
              key="cancel-booking"
              className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => openCancelBooking(booking.id)}
            >
              Huỷ & hoàn 100%
            </button>
          );
        }
        break;
      case "TUTOR_ACCEPTED":
        actions.push(
          <button
            key="chat"
            className="px-3 py-2 rounded-md text-white shadow-lg hover:shadow-xl"
            style={{ backgroundColor: "#94cce6" }}
            onClick={() => handleChat(booking)}
          >
            Nhắn tin
          </button>
        );
        actions.push(
          <button
            key="pay"
            className="px-3 py-2 rounded-md border border-sky-300 text-sky-700 hover:bg-sky-50"
            onClick={() => handlePayment(booking.id)}
          >
            Thanh toán
          </button>
        );
        actions.push(
          <button
            key="cancel-booking"
            className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => openCancelBooking(booking.id)}
          >
            Huỷ
          </button>
        );
        break;
      case "PAYMENT_PENDING":
        actions.push(
          <button
            key="pay"
            className="px-3 py-2 rounded-md border border-sky-300 text-sky-700 hover:bg-sky-50"
            onClick={() => handlePayment(booking.id)}
          >
            Thanh toán
          </button>
        );
        {
          // Logic khác nhau cho booking đơn và booking gói
          if (isPackage) {
            // Booking gói: chỉ hiện "Huỷ lịch" khi chờ thanh toán
            actions.push(
              <button
                key="cancel-booking"
                className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => openCancelBooking(booking.id)}
              >
                Huỷ lịch
              </button>
            );
          } else {
            // Booking đơn: áp dụng logic hoàn tiền theo giờ còn lại
            const hoursLeft = getNextSessionHoursLeft();
            let label = "Huỷ lịch";
            if (hoursLeft !== null && hoursLeft >= 48)
              label = "Huỷ & hoàn 100%";
            else if (hoursLeft !== null && hoursLeft >= 24)
              label = "Huỷ & hoàn 50%";
            actions.push(
              <div key="cancel-wrap" className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => openCancelBooking(booking.id)}
                >
                  {label}
                </button>
                {hoursLeft !== null && (
                  <span className="text-xs text-gray-500">
                    Còn {hoursLeft}h tới buổi học
                  </span>
                )}
              </div>
            );
          }
        }
        break;
      case "PAYMENT_EXPIRED":
        actions.push(
          <button
            key="rebook"
            className="px-3 py-2 rounded-md text-white shadow-lg hover:shadow-xl"
            style={{ backgroundColor: "#94cce6" }}
            onClick={() => navigate("/find-tutor")}
          >
            Đặt lịch lại
          </button>
        );
        break;
      case "PAYMENT_COMPLETED":
      case "PAID":
        actions.push(
          <button
            key="chat"
            className="px-3 py-2 rounded-md text-white shadow-lg hover:shadow-xl"
            style={{ backgroundColor: "#94cce6" }}
            onClick={() => handleChat(booking)}
          >
            Nhắn tin
          </button>
        );
        break;
      case "CANCELLED":
        // Chỉ hiển thị nút hoàn tiền nếu đã thanh toán trước khi huỷ
        // Đối với học đơn: chỉ hoàn tiền nếu đã thanh toán
        // Đối với học gói: có thể hoàn tiền theo chính sách
        const isPaid =
          booking.paymentStatus === "PAYMENT_COMPLETED" ||
          booking.paymentStatus === "PAID";

        if (isPaid) {
          actions.push(
            <button
              key="refund"
              className="px-3 py-2 rounded-md border border-sky-300 text-sky-700 hover:bg-sky-50"
              onClick={() => console.log("Request refund", booking.id)}
            >
              Hoàn tiền
            </button>
          );
        } else if (isPackage) {
          // Học gói chưa thanh toán vẫn có thể hoàn tiền (theo chính sách)
          actions.push(
            <button
              key="refund"
              className="px-3 py-2 rounded-md border border-sky-300 text-sky-700 hover:bg-sky-50"
              onClick={() => console.log("Request refund", booking.id)}
            >
              Hoàn tiền
            </button>
          );
        }
        // Học đơn chưa thanh toán: không hiển thị nút hoàn tiền
        break;
      case "REFUNDED":
        actions.push(
          <span
            key="refunded"
            className="px-3 py-2 rounded-md bg-purple-100 text-purple-800"
          >
            Đã hoàn tiền
          </span>
        );
        break;
      case "COMPLETED":
        actions.push(
          <button
            key="chat"
            className="px-3 py-2 rounded-md text-white shadow-lg hover:shadow-xl"
            style={{ backgroundColor: "#94cce6" }}
            onClick={() => handleChat(booking)}
          >
            Nhắn tin
          </button>
        );
        actions.push(
          <button
            key="rate"
            className="px-3 py-2 rounded-md border border-sky-300 text-sky-700 hover:bg-sky-50"
            onClick={() => console.log("Rate tutor", booking.id)}
          >
            Đánh giá
          </button>
        );
        actions.push(
          <button
            key="rebook"
            className="px-3 py-2 rounded-md border border-sky-300 text-sky-700 hover:bg-sky-50"
            onClick={() => navigate("/find-tutor")}
          >
            Đặt thêm lịch
          </button>
        );
        actions.push(
          <button
            key="tip"
            className="px-3 py-2 rounded-md border border-sky-300 text-sky-700 hover:bg-sky-50"
            onClick={() => console.log("Send tip", booking.id)}
          >
            Tip
          </button>
        );
        break;
      case "TUTOR_REJECTED":
        actions.push(
          <button
            key="chat"
            className="px-3 py-2 rounded-md text-white shadow-lg hover:shadow-xl"
            style={{ backgroundColor: "#94cce6" }}
            onClick={() => handleChat(booking)}
          >
            Nhắn tin
          </button>
        );
        actions.push(
          <button
            key="rebook"
            className="px-3 py-2 rounded-md border border-sky-300 text-sky-700 hover:bg-sky-50"
            onClick={() => navigate("/find-tutor")}
          >
            Đặt lịch lại
          </button>
        );
        break;
      default:
        break;
    }
    return <div className="flex items-center gap-2 flex-wrap">{actions}</div>;
  };

  const renderCountdown = (booking: Booking) => {
    if (!booking.paymentDeadline) return null;

    // Sử dụng tick để trigger re-render mỗi giây
    const deadline = new Date(booking.paymentDeadline).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((deadline - now) / 1000));

    // Trigger re-render bằng cách sử dụng tick trong dependency
    const currentTick = tick;

    // Nếu hết thời gian, không hiển thị countdown
    if (diff <= 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          ⏰ Hết hạn
        </span>
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
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isUrgent ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
        }`}
        title={`Thời gian còn lại để thanh toán (tick: ${currentTick})`}
      >
        ⏳ {hh}:{mm}:{ss}
      </span>
    );
  };

  const getSessionStatusDisplayName = (status: string) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return "Chờ thanh toán";
      case "PAYMENT_COMPLETED":
        return "Đã thanh toán";
      case "UPCOMING":
        return "Sắp diễn ra";
      case "IN_PROGRESS":
        return "Đang diễn ra";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "REFUNDED":
        return "Đã hoàn tiền";
      case "RESCHEDULED":
        return "Đã đổi lịch";
      default:
        return status;
    }
  };

  const calendarInfo = getCalendarInfo(currentDate);

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter((booking) => {
    // Debug log
    if (searchTerm) {
      console.log("Filtering booking:", booking.id, {
        tutorName: `${booking.tutor?.firstName || ""} ${
          booking.tutor?.lastName || ""
        }`.trim(),
        tutorUserName: `${booking.tutor?.user?.firstName || ""} ${
          booking.tutor?.user?.lastName || ""
        }`.trim(),
        subjectName: booking.sessions?.[0]?.subject?.name,
        searchTerm,
      });
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        booking.id.toString().includes(searchLower) ||
        booking.bookingCode?.toLowerCase().includes(searchLower) ||
        // Check tutor name from both tutor object and user object
        (booking.tutor?.firstName &&
          booking.tutor.firstName.toLowerCase().includes(searchLower)) ||
        (booking.tutor?.lastName &&
          booking.tutor.lastName.toLowerCase().includes(searchLower)) ||
        (booking.tutor?.user?.firstName &&
          booking.tutor.user.firstName.toLowerCase().includes(searchLower)) ||
        (booking.tutor?.user?.lastName &&
          booking.tutor.user.lastName.toLowerCase().includes(searchLower)) ||
        // Check subject name from sessions
        booking.sessions?.some((session) =>
          session.subject?.name?.toLowerCase().includes(searchLower)
        );

      console.log("Search match result:", matchesSearch);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filterStatus !== "all") {
      if (
        filterStatus === "payment_pending" &&
        booking.status !== "PAYMENT_PENDING"
      )
        return false;
      if (
        filterStatus === "payment_completed" &&
        booking.status !== "PAYMENT_COMPLETED"
      )
        return false;
      if (
        filterStatus === "awaiting_tutor_accept" &&
        booking.status !== "AWAITING_TUTOR_ACCEPT"
      )
        return false;
      if (
        filterStatus === "tutor_accepted" &&
        booking.status !== "TUTOR_ACCEPTED"
      )
        return false;
      if (
        filterStatus === "tutor_rejected" &&
        booking.status !== "TUTOR_REJECTED"
      )
        return false;
      if (filterStatus === "cancelled" && booking.status !== "CANCELLED")
        return false;
      if (filterStatus === "completed" && booking.status !== "COMPLETED")
        return false;
      if (filterStatus === "refunded" && booking.status !== "REFUNDED")
        return false;
      if (
        filterStatus === "payment_expired" &&
        booking.status !== "PAYMENT_EXPIRED"
      )
        return false;
    }

    // Type filter
    if (filterType !== "all") {
      if (filterType === "single" && booking.bookingType !== "SINGLE")
        return false;
      if (filterType === "package" && booking.bookingType !== "PACKAGE")
        return false;
    }

    return true;
  });

  // ====== Cancel & Refund Modals State ======
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<{
    type: "booking" | "session";
    id: number;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelHoursLeft, setCancelHoursLeft] = useState<number | null>(null);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [cancelBookingType, setCancelBookingType] = useState<string>("");

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundBookingId, setRefundBookingId] = useState<number | null>(null);
  const [refundMethod, setRefundMethod] = useState<"BANK" | "CREDIT">("CREDIT");

  // Openers
  const openCancelBooking = (bookingId: number) => {
    setCancelTarget({ type: "booking", id: bookingId });
    setCancelReason("");
    setIsRescheduleMode(false);
    setRescheduleDate("");
    setRescheduleTime("");
    // Tính giờ còn lại tới buổi gần nhất của booking
    try {
      const b = bookings.find((bk) => bk.id === bookingId);
      if (!b || !b.sessions || b.sessions.length === 0) {
        setCancelHoursLeft(null);
        setCancelBookingType("");
      } else {
        setCancelBookingType(b.bookingType || "");
        const sorted = [...b.sessions].sort(
          (
            a: { sessionDate?: string; date?: string; startTime?: string },
            b: { sessionDate?: string; date?: string; startTime?: string }
          ) => {
            const ad = new Date(
              (a.sessionDate || a.date || "1970-01-01") as string
            ).getTime();
            const bd = new Date(
              (b.sessionDate || b.date || "1970-01-01") as string
            ).getTime();
            const at = (a.startTime || "00:00").substring(0, 5);
            const bt = (b.startTime || "00:00").substring(0, 5);
            return ad !== bd ? ad - bd : at.localeCompare(bt);
          }
        );
        const now = new Date();
        let hours: number | null = null;
        for (const s of sorted) {
          const d = new Date(
            (s.sessionDate || s.date || "1970-01-01") as string
          );
          const [hh, mm] = String(s.startTime || "00:00")
            .substring(0, 5)
            .split(":");
          d.setHours(Number(hh) || 0, Number(mm) || 0, 0, 0);
          const diffMs = d.getTime() - now.getTime();
          if (diffMs > 0) {
            hours = Math.floor(diffMs / (1000 * 60 * 60));
            break;
          }
        }
        setCancelHoursLeft(hours);
      }
    } catch {
      setCancelHoursLeft(null);
    }
    setShowCancelModal(true);
  };

  const openCancelSession = (sessionId: number) => {
    setCancelTarget({ type: "session", id: sessionId });
    setCancelReason("");
    setIsRescheduleMode(false);
    setRescheduleDate("");
    setRescheduleTime("");
    // Tính giờ còn lại cho session
    try {
      let found: {
        sessionDate?: string;
        date?: string;
        startTime?: string;
      } | null = null;
      let parentBookingType = "";
      for (const bk of bookings) {
        const s = bk.sessions?.find(
          (x: {
            id: number;
            sessionDate?: string;
            date?: string;
            startTime?: string;
          }) => x.id === sessionId
        );
        if (s) {
          found = s;
          parentBookingType = bk.bookingType || "";
          break;
        }
      }
      setCancelBookingType(parentBookingType);
      if (!found) {
        setCancelHoursLeft(null);
      } else {
        const d = new Date(
          (found.sessionDate || found.date || "1970-01-01") as string
        );
        const [hh, mm] = String(found.startTime || "00:00")
          .substring(0, 5)
          .split(":");
        d.setHours(Number(hh) || 0, Number(mm) || 0, 0, 0);
        const diffMs = d.getTime() - new Date().getTime();
        setCancelHoursLeft(Math.floor(diffMs / (1000 * 60 * 60)));
      }
    } catch {
      setCancelHoursLeft(null);
    }
    setShowCancelModal(true);
  };

  // ====== Handler Functions ======
  const handlePayment = async (bookingId: number) => {
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) {
        alert("Không tìm thấy thông tin booking");
        return;
      }

      // Navigate to payment page with booking info
      console.log("=== Payment Debug Info ===");
      console.log("Booking found:", booking);
      console.log("First session:", booking.sessions?.[0]);
      console.log("Session date field:", booking.sessions?.[0]?.date);
      console.log(
        "Session sessionDate field:",
        booking.sessions?.[0]?.sessionDate
      );
      console.log("Session fee:", booking.sessions?.[0]?.fee);
      console.log(
        "Session subject fees:",
        booking.sessions?.[0]?.subject?.fees
      );
      console.log("Booking totalAmount:", booking.totalAmount);

      navigate("/payment", {
        state: {
          bookingId: bookingId,
          bookingCode: booking.bookingCode,
          bookingType:
            booking.bookingType === "SINGLE" ? "SINGLE_SESSION" : "PACKAGE",
          totalAmount: booking.totalAmount || 0,
          tutor: {
            id: booking.tutor?.id || booking.tutorId,
            name:
              `${
                booking.tutor?.user?.firstName || booking.tutor?.firstName || ""
              } ${
                booking.tutor?.user?.lastName || booking.tutor?.lastName || ""
              }`.trim() || "Gia sư",
            subject:
              booking.sessions?.[0]?.subject?.name ||
              (booking as any).subject?.name ||
              "Môn học",
            avatar:
              booking.tutor?.user?.imageAvatar ||
              (booking.tutor as any)?.imageAvatar ||
              "/default-avatar.png",
          },
          // Đơn lẻ: truyền 1 session; Gói: truyền mảng sessions
          session:
            booking.bookingType === "SINGLE" && booking.sessions?.[0]
              ? {
                  date:
                    (booking.sessions[0] as any).date ||
                    (booking.sessions[0] as any).sessionDate,
                  time: `${String(
                    (booking.sessions[0] as any).startTime || ""
                  ).substring(0, 5)} - ${String(
                    (booking.sessions[0] as any).endTime || ""
                  ).substring(0, 5)}`,
                  subject:
                    (booking.sessions[0] as any).subject?.name ||
                    (booking.sessions[0] as any).subjectName ||
                    "Môn học",
                  fee:
                    Number((booking.sessions[0] as any).fee) ||
                    Number((booking.sessions[0] as any).subject?.fees) ||
                    Number(booking.totalAmount) ||
                    0,
                }
              : undefined,
          sessions:
            booking.bookingType === "PACKAGE"
              ? (booking.sessions || []).map((s) => ({
                  date: (s as any).date || (s as any).sessionDate,
                  timeSlot:
                    (s as any).timeSlot ||
                    ((s as any).startTime && (s as any).endTime
                      ? `${String((s as any).startTime).substring(
                          0,
                          5
                        )} - ${String((s as any).endTime).substring(0, 5)}`
                      : undefined),
                  subjectName:
                    (s as any).subjectName ||
                    (s as any).subject?.name ||
                    "Môn học",
                  fee: Number((s as any).fee) || 0,
                }))
              : undefined,
          note: booking.note,
        },
      });
    } catch (error) {
      console.error("Payment navigation error:", error);
      alert("Không thể chuyển đến trang thanh toán");
    }
  };

  const handleChat = (booking: Booking) => {
    const tutorId = booking.tutor?.id || booking.tutorId;
    if (tutorId) {
      navigate(`/messages?tutor=${tutorId}`);
    } else {
      alert("Không tìm thấy thông tin giảng viên");
    }
  };

  // Call APIs
  const submitCancel = async () => {
    if (!cancelTarget) return;
    try {
      if (cancelTarget.type === "booking") {
        await api.post(`/booking/${cancelTarget.id}/cancel`, null, {
          params: { actor: "STUDENT", reason: cancelReason },
        });
      } else {
        await api.post(`/session/${cancelTarget.id}/cancel`, null, {
          params: { actor: "STUDENT", reason: cancelReason },
        });
      }
      setShowCancelModal(false);
      setCancelTarget(null);
      setCancelReason("");
      await loadBookings();
    } catch (e) {
      console.error("Cancel error", e);
      alert("Huỷ không thành công. Vui lòng thử lại.");
    }
  };

  const submitRefund = async () => {
    if (!refundBookingId) return;
    try {
      await api.post(`/api/booking/${refundBookingId}/refund`, null, {
        params: { method: refundMethod, actor: "STUDENT" },
      });
      setShowRefundModal(false);
      setRefundBookingId(null);
      await loadBookings();
    } catch (e) {
      console.error("Refund error", e);
      alert("Yêu cầu hoàn tiền không thành công. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Buổi học của tôi
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div
          className="bg-white p-6 rounded-2xl shadow-lg mb-6"
          style={{
            borderColor: "rgba(148, 204, 230, 0.2)",
            borderWidth: "1px",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  placeholder="Tìm theo mã booking, tên gia sư hoặc môn học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl transition-colors duration-200"
                  style={{
                    borderColor: "rgba(148, 204, 230, 0.3)",
                    borderWidth: "1px",
                    backgroundColor: "rgba(148, 204, 230, 0.05)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgb(148, 204, 230)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(148, 204, 230, 0.3)")
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl transition-colors duration-200"
                  style={{
                    borderColor: "rgba(148, 204, 230, 0.3)",
                    borderWidth: "1px",
                    backgroundColor: "rgba(148, 204, 230, 0.05)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgb(148, 204, 230)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(148, 204, 230, 0.3)")
                  }
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="awaiting_tutor_accept">
                    Chờ gia sư chấp nhận
                  </option>
                  <option value="tutor_accepted">Gia sư đã chấp nhận</option>
                  <option value="payment_pending">Chờ thanh toán</option>
                  <option value="payment_completed">Đã thanh toán</option>
                  <option value="tutor_rejected">Gia sư từ chối</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="refunded">Đã hoàn tiền</option>
                  <option value="payment_expired">Quá hạn thanh toán</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại đặt lịch
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl transition-colors duration-200"
                  style={{
                    borderColor: "rgba(148, 204, 230, 0.3)",
                    borderWidth: "1px",
                    backgroundColor: "rgba(148, 204, 230, 0.05)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgb(148, 204, 230)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(148, 204, 230, 0.3)")
                  }
                >
                  <option value="all">Tất cả loại</option>
                  <option value="single">Đơn lẻ</option>
                  <option value="package">Gói học</option>
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="px-4 py-2 text-sm font-medium text-white rounded-2xl transition-colors duration-200"
                style={{
                  backgroundColor: showCalendar
                    ? "rgb(100, 150, 200)"
                    : "rgb(148, 204, 230)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(148, 204, 230, 0.8)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = showCalendar
                    ? "rgb(100, 150, 200)"
                    : "rgb(148, 204, 230)")
                }
              >
                {showCalendar ? "Ẩn lịch" : "Xem lịch"}
              </button>
            </div>
          </div>

          {showCalendar && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        1
                      )
                    )
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentDate.toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                  })}
                </h3>
                <button
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1,
                        1
                      )
                    )
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
              <div className="text-center py-8">
                <div
                  className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                >
                  <CalendarIcon />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Chế độ xem lịch
                </h4>
                <p className="text-gray-500">
                  Tính năng xem lịch sẽ được phát triển trong phiên bản tiếp
                  theo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Calendar View */}
        {isCalendarView ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {calendarInfo.title}
                </h2>
                {calendarInfo.subtitle && (
                  <p className="text-sm text-gray-600">
                    {calendarInfo.subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCalendarViewType("day")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      calendarViewType === "day"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Ngày
                  </button>
                  <button
                    onClick={() => setCalendarViewType("week")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      calendarViewType === "week"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Tuần
                  </button>
                  <button
                    onClick={() => setCalendarViewType("month")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      calendarViewType === "month"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Tháng
                  </button>
                  <button
                    onClick={() => setCalendarViewType("year")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      calendarViewType === "year"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Năm
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateCalendar("prev")}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                  <button
                    onClick={() => navigateCalendar("next")}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
              </div>
            </div>
            <div className="text-center py-16">
              <div
                className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <CalendarIcon />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chế độ xem lịch
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Tính năng xem lịch sẽ được phát triển trong phiên bản tiếp theo.
              </p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-center py-16">
              <div
                className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <BookIcon />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== "all" || filterType !== "all"
                  ? "Không tìm thấy kết quả"
                  : "Chưa có buổi học nào"}
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {searchTerm || filterStatus !== "all" || filterType !== "all"
                  ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác."
                  : "Bắt đầu hành trình học tập của bạn bằng cách đặt lịch học đầu tiên với gia sư phù hợp."}
              </p>
              {!(
                searchTerm ||
                filterStatus !== "all" ||
                filterType !== "all"
              ) && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/find-tutor"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    <UserIcon />
                    <span className="ml-2">Tìm gia sư</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking) => (
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
                      {(String(booking.status) === "PAYMENT_PENDING" ||
                        String(booking.status) === "TUTOR_ACCEPTED") &&
                        booking.paymentDeadline &&
                        renderCountdown(booking)}
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      >
                        {getBookingTypeText(booking.bookingType)}
                      </span>
                    </div>
                    {/* Nút Chi tiết buổi học */}
                    <button
                      onClick={() => toggleBookingExpansion(booking.id)}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <span>Chi tiết buổi học</span>
                      {expandedBookings.has(booking.id) ? (
                        <ChevronUpIcon />
                      ) : (
                        <ChevronDownIcon />
                      )}
                    </button>
                  </div>

                  {/* Actions: giữ cùng bố cục cho cả SINGLE và PACKAGE */}

                  {/* Thông tin booking cơ bản: avatar + tên giảng viên + note (trái) và actions (phải) */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div
                        className="w-12 h-12 rounded-full flex-shrink-0 cursor-pointer overflow-hidden"
                        onClick={() => {
                          const tutorId = booking.tutor?.id || booking.tutorId;
                          if (tutorId) {
                            navigate(`/tutor/${tutorId}`);
                          } else {
                            alert("Không tìm thấy thông tin giảng viên");
                          }
                        }}
                      >
                        {booking.tutor?.user?.imageAvatar ||
                        (booking.tutor as any)?.imageAvatar ? (
                          <img
                            src={
                              booking.tutor?.user?.imageAvatar ||
                              (booking.tutor as any)?.imageAvatar
                            }
                            alt="Tutor Avatar"
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "rgb(148, 204, 230)" }}
                          >
                            <span className="text-white font-semibold text-lg">
                              {(
                                booking.tutor?.user?.firstName ??
                                booking.tutor?.firstName ??
                                "G"
                              ).charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
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
                        {booking.note && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            <span className="font-medium">Ghi chú:</span>{" "}
                            {booking.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {renderBookingActions(booking)}
                    </div>
                  </div>
                </div>

                {/* Expanded Sessions - Accordion */}
                {expandedBookings.has(booking.id) && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6">
                      {/* Thông tin booking tổng quan */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Tổng số buổi:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {booking.totalSessions ||
                                booking.sessions?.length ||
                                0}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Tổng học phí:
                            </span>
                            <span className="ml-2 text-gray-900 font-semibold">
                              {booking.totalAmount
                                ? `${booking.totalAmount.toLocaleString(
                                    "vi-VN"
                                  )} VNĐ`
                                : "Chưa xác định"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {booking.sessions && booking.sessions.length > 0 ? (
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-gray-700 font-medium border-b">
                                  Buổi
                                </th>
                                <th className="px-3 py-2 text-left text-gray-700 font-medium border-b">
                                  Trạng thái
                                </th>
                                <th className="px-3 py-2 text-left text-gray-700 font-medium border-b">
                                  Học phí
                                </th>
                                <th className="px-3 py-2 text-left text-gray-700 font-medium border-b">
                                  Ngày
                                </th>
                                <th className="px-3 py-2 text-left text-gray-700 font-medium border-b">
                                  Giờ
                                </th>
                                <th className="px-3 py-2 text-left text-gray-700 font-medium border-b">
                                  Tác vụ
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {booking.sessions
                                .sort((a: Session, b: Session) => {
                                  const dateA = new Date(
                                    a.sessionDate || a.date || "1970-01-01"
                                  );
                                  const dateB = new Date(
                                    b.sessionDate || b.date || "1970-01-01"
                                  );
                                  const timeA = (
                                    a.startTime || "00:00"
                                  ).substring(0, 5);
                                  const timeB = (
                                    b.startTime || "00:00"
                                  ).substring(0, 5);

                                  // Sắp xếp theo ngày trước, sau đó theo giờ
                                  if (dateA.getTime() !== dateB.getTime()) {
                                    return dateA.getTime() - dateB.getTime();
                                  }
                                  return timeA.localeCompare(timeB);
                                })
                                .map((session: Session, index: number) => {
                                  const dateStr =
                                    session.sessionDate || session.date
                                      ? new Date(
                                          session.sessionDate ||
                                            session.date ||
                                            ""
                                        ).toLocaleDateString("vi-VN")
                                      : "Chưa xác định";
                                  const timeStr =
                                    session.startTime && session.endTime
                                      ? `${String(session.startTime).substring(
                                          0,
                                          5
                                        )} - ${String(
                                          session.endTime
                                        ).substring(0, 5)}`
                                      : "";
                                  const feeStr =
                                    session.fee && Number(session.fee) > 0
                                      ? `${Number(session.fee).toLocaleString(
                                          "vi-VN"
                                        )} VNĐ`
                                      : session.subject?.fees &&
                                        Number(session.subject.fees) > 0
                                      ? `${Number(
                                          session.subject.fees
                                        ).toLocaleString("vi-VN")} VNĐ`
                                      : "Chưa có";
                                  return (
                                    <tr key={session.id} className="bg-white">
                                      <td className="px-3 py-2 text-gray-900">
                                        Buổi {index + 1}
                                      </td>
                                      <td className="px-3 py-2">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(
                                            session.status
                                          )}`}
                                        >
                                          {getSessionStatusDisplayName(
                                            session.status
                                          )}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">
                                        {feeStr}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">
                                        {dateStr}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">
                                        {timeStr}
                                      </td>
                                      <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                          {/* Logic mới:
                                              - Nút Huỷ: hiện khi session chưa diễn ra hoặc hoàn thành (UPCOMING, PAYMENT_COMPLETED, SCHEDULED)
                                              - Nút Đổi lịch: chỉ hiện khi còn >= 48h và session chưa diễn ra hoặc hoàn thành
                                              - Nút Lịch sử: chỉ hiện khi session đã đổi lịch (có reschedule_count > 0) */}
                                          {/* Nút Huỷ - hiện khi session chưa diễn ra hoặc hoàn thành */}
                                          {(session.status === "UPCOMING" ||
                                            session.status ===
                                              "PAYMENT_COMPLETED" ||
                                            session.status === "SCHEDULED") && (
                                            <button
                                              onClick={() =>
                                                openCancelSession(session.id)
                                              }
                                              className="px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                                            >
                                              Huỷ
                                            </button>
                                          )}

                                          {/* Nút Đổi lịch - chỉ hiện khi còn >= 48h và session chưa diễn ra hoặc hoàn thành */}
                                          {(session.status === "UPCOMING" ||
                                            session.status ===
                                              "PAYMENT_COMPLETED" ||
                                            session.status === "SCHEDULED") &&
                                            (() => {
                                              // Tính giờ còn lại
                                              const sessionDate = new Date(
                                                session.sessionDate ||
                                                  session.date ||
                                                  ""
                                              );
                                              const sessionTime = (
                                                session.startTime || "00:00"
                                              ).substring(0, 5);
                                              const [hh, mm] =
                                                sessionTime.split(":");
                                              sessionDate.setHours(
                                                Number(hh) || 0,
                                                Number(mm) || 0,
                                                0,
                                                0
                                              );
                                              const diffMs =
                                                sessionDate.getTime() -
                                                new Date().getTime();
                                              const hoursLeft = Math.floor(
                                                diffMs / (1000 * 60 * 60)
                                              );

                                              return hoursLeft >= 48 ? (
                                                <button
                                                  onClick={() => {
                                                    // Mở modal đổi lịch trực tiếp
                                                    setCancelTarget({
                                                      type: "session",
                                                      id: session.id,
                                                    });
                                                    setCancelBookingType(
                                                      booking.bookingType || ""
                                                    );
                                                    setCancelHoursLeft(
                                                      hoursLeft
                                                    );
                                                    setIsRescheduleMode(true);
                                                    setRescheduleDate(
                                                      session.sessionDate ||
                                                        session.date ||
                                                        ""
                                                    );
                                                    setRescheduleTime(
                                                      session.startTime || ""
                                                    );
                                                    setShowCancelModal(true);
                                                  }}
                                                  className="px-3 py-1.5 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50"
                                                >
                                                  Đổi lịch
                                                </button>
                                              ) : null;
                                            })()}

                                          {/* Nút Lịch sử - chỉ hiện khi session đã đổi lịch (reschedule_count > 0) */}
                                          {session.rescheduleCount &&
                                            session.rescheduleCount > 0 && (
                                              <button
                                                onClick={() =>
                                                  fetchSessionHistory(
                                                    session.id
                                                  )
                                                }
                                                className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                              >
                                                Lịch sử
                                              </button>
                                            )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Chưa có buổi học nào được tạo
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Session History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lịch sử thay đổi buổi học #{selectedSessionId}
                </h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {selectedSessionHistory.length > 0 ? (
                <div className="space-y-4">
                  {selectedSessionHistory.map((history: SessionHistory) => (
                    <div
                      key={history.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Thay đổi thời gian
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="line-through">
                              {new Date(history.oldDate).toLocaleDateString(
                                "vi-VN"
                              )}{" "}
                              {history.oldStartTime?.substring(0, 5)}
                            </span>
                            {" → "}
                            <span className="font-medium">
                              {new Date(history.newDate).toLocaleDateString(
                                "vi-VN"
                              )}{" "}
                              {history.newStartTime?.substring(0, 5)}
                            </span>
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(history.changedAt).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Chưa có lịch sử thay đổi
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Xác nhận huỷ
              </h3>
              {cancelHoursLeft !== null && (
                <div className="text-xs text-gray-600 mb-3">
                  Còn {cancelHoursLeft}h tới buổi học gần nhất
                </div>
              )}
              <div className="text-sm text-gray-700 mb-3">
                {cancelTarget?.type === "booking" ? (
                  <>
                    <p>Luật hoàn tiền/phạt (đối với học sinh):</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>
                        Huỷ ≥ 48h trước buổi học gần nhất: hoàn 100% tín dụng hệ
                        thống.
                      </li>
                      <li>
                        Huỷ ≥ 24h và &lt; 48h: hoàn 50% tín dụng hệ thống.
                      </li>
                      <li>Huỷ &lt; 24h: không hoàn.</li>
                    </ul>
                    <p className="mt-2 text-gray-600">
                      Lưu ý: Nếu giảng viên là người huỷ, giảng viên sẽ bị phạt
                      5%/10%/15% theo mốc thời gian và bạn được hoàn 100%.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Huỷ buổi học sẽ áp dụng luật như trên theo thời gian còn
                      lại tới buổi học.
                    </p>
                  </>
                )}
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do huỷ (tuỳ chọn)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Nhập lý do huỷ..."
              />
              <div className="mt-4 flex justify-between gap-2 items-center">
                {/* Logic hiển thị nút Đổi lịch:
                    - Booking đơn: hiện khi >= 48h
                    - Session bất kỳ: hiện khi >= 48h  
                    - Booking gói: KHÔNG hiện nút đổi lịch */}
                {cancelHoursLeft !== null &&
                  cancelHoursLeft >= 48 &&
                  !(
                    cancelTarget?.type === "booking" &&
                    cancelBookingType === "PACKAGE"
                  ) && (
                    <button
                      onClick={() => setIsRescheduleMode((v) => !v)}
                      className="px-3 py-2 rounded-md border border-sky-300 text-sky-700 hover:bg-sky-50"
                    >
                      {isRescheduleMode ? "Huỷ đổi lịch" : "Đổi lịch"}
                    </button>
                  )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={submitCancel}
                    className="px-4 py-2 rounded-md text-white shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: "#94cce6" }}
                  >
                    {cancelHoursLeft !== null && cancelHoursLeft >= 48
                      ? "Huỷ & hoàn 100%"
                      : cancelHoursLeft !== null && cancelHoursLeft >= 24
                      ? "Huỷ & hoàn 50%"
                      : "Huỷ"}
                  </button>
                </div>
              </div>

              {isRescheduleMode && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Chọn lịch mới
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày mới
                      </label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ mới
                      </label>
                      <input
                        type="time"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Lưu ý: Đây là chọn lịch đề xuất. Sau khi xác nhận, hệ thống
                    sẽ gửi yêu cầu đổi lịch tới giảng viên.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Chọn phương thức hoàn tiền
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="refundMethod"
                    checked={refundMethod === "CREDIT"}
                    onChange={() => setRefundMethod("CREDIT")}
                  />
                  <span>Nhận 100% tín dụng hệ thống</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="refundMethod"
                    checked={refundMethod === "BANK"}
                    onChange={() => setRefundMethod("BANK")}
                  />
                  <span>Hoàn về tài khoản ngân hàng (nếu đã cập nhật)</span>
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={submitRefund}
                  className="px-4 py-2 rounded-md text-white shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: "#94cce6" }}
                >
                  Xác nhận hoàn tiền
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySessions;
