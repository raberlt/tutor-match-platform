import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { BookingStatus } from "../../types";
import api from "../../services/api";

// Types
interface Session {
  id: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  rescheduleCount: number;
}

interface Booking {
  id: number;
  status: BookingStatus;
  bookingType: string;
  note?: string;
  totalSessions?: number;
  totalAmount?: number;
  subject?: { name: string };
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

const DotsVerticalIcon = () => (
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
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

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
      case "PAYMENT_COMPLETED":
        return "bg-green-100 text-green-800";
      case "TUTOR_APPROVED":
        return "bg-blue-100 text-blue-800";
      case "TUTOR_REJECTED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800";
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
      case "PAYMENT_COMPLETED":
        return "Đã thanh toán";
      case "TUTOR_APPROVED":
        return "Giảng viên đã chấp nhận";
      case "TUTOR_REJECTED":
        return "Giảng viên đã từ chối";
      case "CANCELLED":
        return "Đã hủy";
      case "REFUNDED":
        return "Đã hoàn tiền";
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
      case "PAYMENT_COMPLETED":
        return "bg-blue-100 text-blue-800";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Buổi học của tôi
              </h1>
              <p className="mt-2 text-gray-600">
                Quản lý và theo dõi các buổi học của bạn
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/find-tutor"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                <UserIcon />
                <span className="ml-2">Tìm gia sư</span>
              </Link>
              <button
                onClick={toggleView}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <CalendarIcon />
                <span className="ml-2">
                  {isCalendarView ? "Xem danh sách" : "Xem lịch"}
                </span>
              </button>
            </div>
          </div>
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

                  {/* Thông tin booking cơ bản: avatar + tên gia sư + note */}
                  <div className="flex items-center gap-4">
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
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:underline"
                        onClick={() => {
                          const tutorId = booking.tutor?.id || booking.tutorId;
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
                              Môn học:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {booking.subject?.name || "Chưa xác định"}
                            </span>
                          </div>
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

                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Chi tiết từng buổi học ({booking.sessions?.length || 0}{" "}
                        buổi)
                      </h4>

                      {booking.sessions && booking.sessions.length > 0 ? (
                        <div className="space-y-3">
                          {booking.sessions.map(
                            (session: Session, index: number) => (
                              <div
                                key={session.id}
                                className="bg-white rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      Buổi {index + 1}
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(
                                        session.status
                                      )}`}
                                    >
                                      {getSessionStatusDisplayName(
                                        session.status
                                      )}
                                    </span>
                                    {session.rescheduleCount > 0 && (
                                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                        Đã đổi lịch {session.rescheduleCount}{" "}
                                        lần
                                      </span>
                                    )}
                                  </div>

                                  {/* Session Actions */}
                                  <button
                                    onClick={() =>
                                      fetchSessionHistory(session.id)
                                    }
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Xem lịch sử thay đổi"
                                  >
                                    <DotsVerticalIcon />
                                  </button>
                                </div>

                                {/* Chi tiết thời gian và học phí */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <CalendarIcon />
                                    <span className="font-medium text-gray-700">
                                      Ngày:
                                    </span>
                                    <span className="text-gray-900">
                                      {new Date(
                                        session.sessionDate
                                      ).toLocaleDateString("vi-VN")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <ClockIcon />
                                    <span className="font-medium text-gray-700">
                                      Giờ:
                                    </span>
                                    <span className="text-gray-900">
                                      {session.startTime?.substring(0, 5)} -{" "}
                                      {session.endTime?.substring(0, 5)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
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
      </div>
    </div>
  );
};

export default MySessions;
