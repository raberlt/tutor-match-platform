import React, { useState, useEffect } from "react";

interface SessionItem {
  sessionId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  fee: number;
}

interface Booking {
  id: string; // Mã lịch học
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  subject: string;
  type: "single" | "package";
  date: string;
  startTime: string;
  endTime: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "completed"
    | "cancelled"
    | "payment_pending"
    | "payment_completed";
  price: number; // Đơn giá buổi (single) hoặc đơn giá 1 buổi trong gói
  totalSessions?: number; // Với gói học
  completedSessions?: number;
  notes?: string;
  createdAt: string;
  packageId?: string;
  packageName?: string;
  voucherDiscount?: number; // Số tiền giảm giá theo voucher trên tổng gói
  sessions?: SessionItem[]; // Danh sách session cho gói
  pendingDeadline?: string; // Thời gian hết hạn chờ duyệt (chỉ cho gói học pending)
  targetAudience?: string; // Đối tượng học (tự học, trung học cơ sở, cao đẳng đại học...)
  location?: string; // Tỉnh/thành phố
  gender?: string; // Giới tính
}

type CalendarEvent = {
  dateKey: string; // yyyy-mm-dd
  title: string;
  status: SessionItem["status"] | "single";
};

const statusColor = (status: CalendarEvent["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-400";
    case "approved":
      return "bg-blue-500";
    case "completed":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    case "single":
      return "bg-purple-500";
    default:
      return "bg-gray-400";
  }
};

const TutorBookings: React.FC = () => {
  const [bookings] = useState<Booking[]>([
    {
      id: "1",
      studentName: "Nguyễn Minh An",
      studentEmail: "an@example.com",
      studentPhone: "0901234567",
      subject: "IELTS",
      type: "package",
      date: "2025-01-20",
      startTime: "19:00",
      endTime: "20:30",
      status: "pending",
      price: 300000,
      totalSessions: 20,
      completedSessions: 5,
      notes: "Package IELTS 20 buổi",
      createdAt: "2025-01-15",
      packageId: "PKG001",
      packageName: "IELTS Complete Package",
      voucherDiscount: 500000,
      pendingDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h từ bây giờ
      sessions: Array.from({ length: 5 }).map((_, i) => ({
        sessionId: `S${i + 1}`,
        date: `2025-02-${(10 + i).toString().padStart(2, "0")}`,
        startTime: "19:00",
        endTime: "20:30",
        status: i < 2 ? "completed" : "approved",
        fee: 300000,
      })),
    },
    {
      id: "2",
      studentName: "Trần Thị Bình",
      studentEmail: "binh@example.com",
      studentPhone: "0987654321",
      subject: "Tiếng Anh",
      type: "single",
      date: "2025-01-18",
      startTime: "16:00",
      endTime: "17:30",
      status: "completed",
      price: 250000,
      notes: "Buổi học Speaking",
      createdAt: "2025-01-10",
    },
    {
      id: "3",
      studentName: "Lê Văn Cường",
      studentEmail: "cuong@example.com",
      studentPhone: "0909123456",
      subject: "IELTS",
      type: "package",
      date: "2025-01-25",
      startTime: "18:30",
      endTime: "20:00",
      status: "completed",
      price: 400000,
      totalSessions: 10,
      completedSessions: 10,
      notes: "Package IELTS 10 buổi - Hoàn thành",
      createdAt: "2024-12-01",
      packageId: "PKG002",
      packageName: "IELTS Basic Package",
      voucherDiscount: 0,
      sessions: Array.from({ length: 10 }).map((_, i) => ({
        sessionId: `B${i + 1}`,
        date: `2024-12-${(5 + i).toString().padStart(2, "0")}`,
        startTime: "18:30",
        endTime: "20:00",
        status: "completed",
        fee: 400000,
      })),
    },
    {
      id: "4",
      studentName: "Phạm Thị Dung",
      studentEmail: "dung@example.com",
      studentPhone: "0912345678",
      subject: "Tiếng Anh",
      type: "single",
      date: "2025-01-22",
      startTime: "14:00",
      endTime: "15:30",
      status: "rejected",
      price: 200000,
      notes: "Không phù hợp lịch trình",
      createdAt: "2025-01-12",
    },
    // Single - pending
    {
      id: "5",
      studentName: "Hoàng Gia",
      studentEmail: "gia@example.com",
      studentPhone: "0901112222",
      subject: "Toán",
      type: "single",
      date: "2025-02-03",
      startTime: "08:00",
      endTime: "09:30",
      status: "pending",
      price: 180000,
      createdAt: "2025-01-28",
      notes: "Ôn tập hình học",
    },
    // Single - completed
    {
      id: "6",
      studentName: "Mai Hương",
      studentEmail: "huong@example.com",
      studentPhone: "0903334444",
      subject: "Vật lý",
      type: "single",
      date: "2025-01-05",
      startTime: "10:00",
      endTime: "11:30",
      status: "completed",
      price: 220000,
      createdAt: "2024-12-30",
      notes: "Ôn dao động điều hòa",
    },
    // Single - cancelled
    {
      id: "7",
      studentName: "Quang Minh",
      studentEmail: "minh@example.com",
      studentPhone: "0905556666",
      subject: "Hóa học",
      type: "single",
      date: "2025-02-10",
      startTime: "13:00",
      endTime: "14:30",
      status: "cancelled",
      price: 200000,
      createdAt: "2025-02-01",
      notes: "Học sinh bận việc cá nhân",
    },
    // Package - approved -> chuyển thành payment_pending
    {
      id: "8",
      studentName: "Trúc Linh",
      studentEmail: "linh@example.com",
      studentPhone: "0907778888",
      subject: "IELTS",
      type: "package",
      date: "2025-02-15",
      startTime: "18:00",
      endTime: "19:30",
      status: "payment_pending",
      price: 350000,
      totalSessions: 8,
      completedSessions: 2,
      createdAt: "2025-02-05",
      packageId: "PKG003",
      packageName: "IELTS Starter",
      voucherDiscount: 200000,
      sessions: Array.from({ length: 4 }).map((_, i) => ({
        sessionId: `C${i + 1}`,
        date: `2025-02-${(12 + i).toString().padStart(2, "0")}`,
        startTime: "18:00",
        endTime: "19:30",
        status: i < 2 ? "completed" : "approved",
        fee: 350000,
      })),
      notes: "Đã duyệt, chờ học sinh thanh toán",
    },
    // Package - cancelled
    {
      id: "9",
      studentName: "Thanh Tùng",
      studentEmail: "tung@example.com",
      studentPhone: "0909990000",
      subject: "Tiếng Anh",
      type: "package",
      date: "2025-03-01",
      startTime: "19:00",
      endTime: "20:30",
      status: "cancelled",
      price: 280000,
      totalSessions: 6,
      completedSessions: 0,
      createdAt: "2025-02-20",
      packageId: "PKG004",
      packageName: "English Basic",
      voucherDiscount: 0,
      sessions: Array.from({ length: 3 }).map((_, i) => ({
        sessionId: `D${i + 1}`,
        date: `2025-03-${(2 + i).toString().padStart(2, "0")}`,
        startTime: "19:00",
        endTime: "20:30",
        status: "cancelled",
        fee: 280000,
      })),
      notes: "Khách hủy trước khi bắt đầu",
    },
    // Single - payment pending -> xóa vì không có trường hợp này
    // {
    //   id: "10",
    //   studentName: "Bảo Long",
    //   studentEmail: "long@example.com",
    //   studentPhone: "0901212123",
    //   subject: "Tiếng Anh",
    //   type: "single",
    //   date: "2025-02-12",
    //   startTime: "09:00",
    //   endTime: "10:30",
    //   status: "payment_pending",
    //   price: 230000,
    //   createdAt: "2025-02-10",
    //   notes: "Chờ học viên thanh toán",
    // },
    // Package - payment completed
    {
      id: "11",
      studentName: "Minh Anh",
      studentEmail: "minhanh@example.com",
      studentPhone: "0903434345",
      subject: "IELTS",
      type: "package",
      date: "2025-02-18",
      startTime: "19:00",
      endTime: "20:30",
      status: "payment_completed",
      price: 320000,
      totalSessions: 12,
      completedSessions: 1,
      createdAt: "2025-02-11",
      packageId: "PKG005",
      packageName: "IELTS Advanced",
      voucherDiscount: 300000,
      sessions: Array.from({ length: 3 }).map((_, i) => ({
        sessionId: `E${i + 1}`,
        date: `2025-02-${(18 + i).toString().padStart(2, "0")}`,
        startTime: "19:00",
        endTime: "20:30",
        status: i === 0 ? "completed" : "approved",
        fee: 320000,
      })),
      notes: "Đã thanh toán toàn bộ gói",
      targetAudience: "Cao đẳng/Đại học",
      location: "TP. Hồ Chí Minh",
      gender: "Nam",
    },
    // Single - payment completed
    {
      id: "12",
      studentName: "Nguyễn Thị Lan",
      studentEmail: "lan@example.com",
      studentPhone: "0901234567",
      subject: "Toán học",
      type: "single",
      date: "2025-02-20",
      startTime: "14:00",
      endTime: "15:30",
      status: "payment_completed",
      price: 200000,
      createdAt: "2025-02-18",
      notes: "Đã thanh toán, chờ học",
      targetAudience: "Trung học phổ thông",
      location: "Hà Nội",
      gender: "Nữ",
    },
  ]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const newTimeLeft: { [key: string]: string } = {};

      bookings.forEach((booking) => {
        if (
          booking.type === "package" &&
          booking.status === "pending" &&
          booking.pendingDeadline
        ) {
          const deadline = new Date(booking.pendingDeadline).getTime();
          const distance = deadline - now;

          if (distance > 0) {
            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor(
              (distance % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            newTimeLeft[booking.id] = `${hours
              .toString()
              .padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
          } else {
            newTimeLeft[booking.id] = "Hết hạn";
          }
        }
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [bookings]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || booking.status === filterStatus;
    const matchesType = filterType === "all" || booking.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "payment_pending":
        return "bg-orange-100 text-orange-800";
      case "payment_completed":
        return "bg-teal-100 text-teal-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "payment_pending":
        return "Chờ thanh toán";
      case "payment_completed":
        return "Đã thanh toán";
      case "rejected":
        return "Từ chối";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "single":
        return "bg-gray-100 text-gray-800";
      case "package":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "single":
        return "Đơn lẻ";
      case "package":
        return "Gói học";
      default:
        return type;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calcTotals = (booking: Booking) => {
    const totalFee = booking.totalSessions
      ? booking.price * booking.totalSessions
      : booking.price;
    const voucher = booking.voucherDiscount || 0;
    const finalFee = Math.max(totalFee - voucher, 0);
    const netReceive = Math.round(finalFee * 0.7);
    return { totalFee, voucher, finalFee, netReceive };
  };

  const calcProgressPct = (booking: Booking) => {
    if (!booking.totalSessions || booking.totalSessions <= 0) return 0;
    const completed = booking.completedSessions || 0;
    return Math.round((completed / booking.totalSessions) * 100);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      console.log("Approving booking:", bookingId);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập lại");
        return;
      }

      const response = await fetch(`/api/booking/${bookingId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Đã chấp nhận đặt lịch! Chuyển sang trạng thái chờ thanh toán.");
        // Reload data để cập nhật trạng thái
        window.location.reload();
      } else {
        const error = await response.text();
        alert(`Lỗi: ${error}`);
      }
    } catch (error) {
      console.error("Error approving booking:", error);
      alert("Có lỗi xảy ra khi chấp nhận đặt lịch");
    }
  };

  const handleRejectBooking = (bookingId: string) => {
    setRejectingBookingId(bookingId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const submitRejectBooking = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      console.log("Rejecting booking:", rejectingBookingId);
      
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập lại");
        return;
      }

      const response = await fetch(`/api/booking/${rejectingBookingId}/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (response.ok) {
        alert("Đã từ chối đặt lịch!");
        setShowRejectModal(false);
        setRejectReason("");
        setRejectingBookingId(null);
        // Reload data để cập nhật trạng thái
        window.location.reload();
      } else {
        const error = await response.text();
        alert(`Lỗi: ${error}`);
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert("Có lỗi xảy ra khi từ chối đặt lịch");
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    console.log("Cancelling booking:", bookingId);
    // Logic để chuyển sang cancelled
    alert("Đã hủy đặt lịch!");
  };

  const handleCancelSession = (sessionId: string) => {
    console.log("Cancelling session:", sessionId);
    alert("Đã hủy buổi học!");
  };

  const handleViewSessionHistory = (sessionId: string) => {
    console.log("Viewing session history:", sessionId);
    alert("Xem lịch sử đổi lịch của buổi học!");
  };

  const handleSendMessage = (studentEmail: string) => {
    console.log("Opening message with student:", studentEmail);
  };

  // Calendar helpers
  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const startDayOfWeek =
    startOfMonth.getDay() === 0 ? 7 : startOfMonth.getDay(); // 1..7 (Mon..Sun)

  const daysInPrevMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    0
  ).getDate();
  const daysInThisMonth = endOfMonth.getDate();

  const calendarDays: { date: Date; inCurrentMonth: boolean }[] = [];
  // Fill previous month spill
  for (let i = startDayOfWeek - 1; i > 0; i--) {
    calendarDays.push({
      date: new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        daysInPrevMonth - i + 1
      ),
      inCurrentMonth: false,
    });
  }
  // Current month
  for (let d = 1; d <= daysInThisMonth; d++) {
    calendarDays.push({
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d),
      inCurrentMonth: true,
    });
  }
  // Next month spill to complete rows (42 cells)
  while (calendarDays.length % 7 !== 0) {
    const last = calendarDays[calendarDays.length - 1].date;
    calendarDays.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      inCurrentMonth: false,
    });
  }

  const toKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const events: Record<string, CalendarEvent[]> = {};
  bookings.forEach((b) => {
    if (b.type === "package" && b.sessions?.length) {
      b.sessions.forEach((s) => {
        const key = s.date;
        events[key] = events[key] || [];
        events[key].push({
          dateKey: key,
          title: `${b.subject} (${b.studentName})`,
          status: s.status,
        });
      });
    } else {
      const key = b.date;
      events[key] = events[key] || [];
      events[key].push({
        dateKey: key,
        title: `${b.subject} (${b.studentName})`,
        status: "single",
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt lịch</h1>
      </div>

      {/* Filters (one row) */}
      <div
        className="bg-white p-6 rounded-2xl shadow-lg"
        style={{ borderColor: "rgba(148, 204, 230, 0.2)", borderWidth: "1px" }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo mã booking, tên hoặc email..."
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
                <option value="pending">Chờ duyệt</option>
                <option value="payment_pending">Chờ thanh toán</option>
                <option value="payment_completed">Đã thanh toán</option>
                <option value="rejected">Từ chối</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
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

          <div className="flex-shrink-0">
            <button
              onClick={() => setShowCalendar((v) => !v)}
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
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1
                    )
                  )
                }
                className="px-3 py-1 border rounded-2xl text-sm"
                style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
              >
                Tháng trước
              </button>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  Tháng {currentMonth.getMonth() + 1}/
                  {currentMonth.getFullYear()}
                </div>
                <div className="mt-2 flex items-center gap-3 justify-center text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    Đơn lẻ
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                    Chờ duyệt
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>Đã
                    duyệt
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Hoàn thành
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>Đã
                    hủy
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  )
                }
                className="px-3 py-1 border rounded-2xl text-sm"
                style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
              >
                Tháng sau
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                <div
                  key={d}
                  className="text-xs font-medium text-gray-500 text-center py-1"
                >
                  {d}
                </div>
              ))}
              {calendarDays.map(({ date, inCurrentMonth }) => {
                const key = toKey(date);
                const dayEvents = events[key] || [];
                return (
                  <div
                    key={key}
                    className={`min-h-[90px] border rounded-2xl p-2 ${
                      inCurrentMonth ? "bg-white" : "bg-gray-50"
                    }`}
                    style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
                  >
                    <div className="text-xs text-gray-500">
                      {date.getDate()}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((ev, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${statusColor(
                              ev.status
                            )}`}
                          ></span>
                          <span
                            className="text-xs text-gray-700 truncate"
                            title={ev.title}
                          >
                            {ev.title}
                          </span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-gray-500">
                          +{dayEvents.length - 3} thêm
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bookings Grid - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => {
          const { totalFee, netReceive } = calcTotals(booking);
          const progressPct = calcProgressPct(booking);
          return (
            <div
              key={booking.id}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              style={{
                borderColor: "rgba(148, 204, 230, 0.2)",
                borderWidth: "1px",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg"
                    style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  >
                    {booking.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {booking.studentName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {booking.studentEmail}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                      booking.type
                    )}`}
                  >
                    {getTypeText(booking.type)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {booking.type === "package" ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mã lịch học:</span>
                      <span className="font-medium">{booking.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng buổi:</span>
                      <span className="font-medium">
                        {booking.totalSessions}
                      </span>
                    </div>
                    {booking.status !== "pending" && (
                      <div>
                        <div className="flex justify-between text-xs mb-1 text-gray-600">
                          <span>Tiến độ</span>
                          <span>
                            {booking.completedSessions || 0}/
                            {booking.totalSessions}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${progressPct}%`,
                              backgroundColor: "rgb(148, 204, 230)",
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Countdown timer cho gói học chờ duyệt */}
                    {booking.status === "pending" && timeLeft[booking.id] && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-yellow-700 font-medium">
                            Thời gian còn lại:
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              timeLeft[booking.id] === "Hết hạn"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {timeLeft[booking.id]}
                          </span>
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">
                          Sau 24h sẽ tự động chấp nhận
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mã lịch học:</span>
                      <span className="font-medium">{booking.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ngày học:</span>
                      <span className="font-medium">
                        {new Date(booking.date).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-medium">
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Học phí:</span>
                  <span
                    className="font-medium"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    {formatPrice(
                      booking.type === "package" ? totalFee : booking.price
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thực nhận (70%):</span>
                  <span className="font-medium text-green-600">
                    {formatPrice(
                      booking.type === "package"
                        ? netReceive
                        : Math.round(booking.price * 0.7)
                    )}
                  </span>
                </div>

                {booking.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-2xl">
                    <span className="font-medium">Ghi chú:</span>{" "}
                    {booking.notes}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(booking)}
                    className="flex-1 py-2 text-sm border rounded-2xl transition-colors duration-200"
                    style={{
                      borderColor: "rgba(148, 204, 230, 0.3)",
                      color: "rgb(148, 204, 230)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(148, 204, 230, 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => handleSendMessage(booking.studentEmail)}
                    className="flex-1 py-2 text-sm text-white rounded-2xl transition-colors duration-200"
                    style={{ backgroundColor: "rgb(148, 204, 230)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(148, 204, 230, 0.8)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgb(148, 204, 230)")
                    }
                  >
                    Nhắn tin
                  </button>
                </div>

                {booking.status === "pending" && booking.type === "package" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveBooking(booking.id)}
                      className="flex-1 py-2 text-sm text-white rounded-2xl transition-colors duration-200"
                      style={{ backgroundColor: "rgb(34, 197, 94)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgb(22, 163, 74)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgb(34, 197, 94)")
                      }
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleRejectBooking(booking.id)}
                      className="flex-1 py-2 text-sm text-white rounded-2xl transition-colors duration-200"
                      style={{ backgroundColor: "rgb(239, 68, 68)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgb(220, 38, 38)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgb(239, 68, 68)")
                      }
                    >
                      Từ chối
                    </button>
                  </div>
                )}

                {booking.status === "payment_completed" &&
                  booking.type === "package" && (
                    <div className="flex space-x-2">
                      {/* Chỉ hiển thị nút hủy nếu chưa học buổi nào */}
                      {(!booking.completedSessions ||
                        booking.completedSessions === 0) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex-1 py-2 text-sm text-white rounded-2xl transition-colors duration-200"
                          style={{ backgroundColor: "rgb(107, 114, 128)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "rgb(75, 85, 99)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "rgb(107, 114, 128)")
                          }
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div
          className="bg-white p-12 rounded-2xl shadow-lg text-center"
          style={{
            borderColor: "rgba(148, 204, 230, 0.2)",
            borderWidth: "1px",
          }}
        >
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không có đặt lịch nào
          </h3>
          <p className="text-gray-600 mb-4">
            Hãy thử điều chỉnh bộ lọc để xem các đặt lịch khác
          </p>
        </div>
      )}

      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div
            className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-2xl bg-white"
            style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
          >
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết đặt lịch - {selectedBooking.studentName}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Học viên
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.studentName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.studentEmail}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.studentPhone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Giới tính
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.gender || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Đối tượng học
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.targetAudience || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tỉnh/Thành phố
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.location || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày đặt lịch
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedBooking.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>

                  {/* Thêm thời gian cho đơn lẻ */}
                  {selectedBooking.type === "single" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày học
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedBooking.date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Thời gian học
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedBooking.startTime} -{" "}
                          {selectedBooking.endTime}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Booking Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Thông tin đặt lịch
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mã lịch học - hiển thị cho cả đơn lẻ và gói */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Mã lịch học
                      </label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">
                        {selectedBooking.id}
                      </p>
                    </div>

                    {/* Ẩn môn học ở phần chung nếu là gói (đưa vào bảng bên dưới) */}
                    {selectedBooking.type !== "package" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Môn học
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedBooking.subject}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Loại đặt lịch
                      </label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          selectedBooking.type
                        )}`}
                      >
                        {getTypeText(selectedBooking.type)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Trạng thái
                      </label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedBooking.status
                        )}`}
                      >
                        {getStatusText(selectedBooking.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Package Sessions Table */}
                {selectedBooking.type === "package" && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Danh sách buổi học
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mã buổi
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thời gian
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Môn học
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Học phí
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(selectedBooking.sessions || []).map((s) => (
                            <tr key={s.sessionId}>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {s.sessionId}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {new Date(s.date).toLocaleDateString("vi-VN")}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {s.startTime} - {s.endTime}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {selectedBooking.subject}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    s.status
                                  )}`}
                                >
                                  {getStatusText(s.status)}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatPrice(s.fee)}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <div className="flex space-x-1">
                                  {/* Nút hủy buổi học - chỉ hiển thị cho các buổi chưa hoàn thành */}
                                  {s.status !== "completed" &&
                                    s.status !== "cancelled" && (
                                      <button
                                        onClick={() =>
                                          handleCancelSession(s.sessionId)
                                        }
                                        className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                                      >
                                        Hủy
                                      </button>
                                    )}
                                  {/* Nút lịch sử - hiển thị cho tất cả buổi học */}
                                  <button
                                    onClick={() =>
                                      handleViewSessionHistory(s.sessionId)
                                    }
                                    className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                                  >
                                    Lịch sử
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Thanh tiến độ trong modal (ẩn khi pending) */}
                    {selectedBooking.status !== "pending" && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1 text-gray-600">
                          <span>Tiến độ</span>
                          <span>
                            {selectedBooking.completedSessions || 0}/
                            {selectedBooking.totalSessions}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${calcProgressPct(selectedBooking)}%`,
                              backgroundColor: "rgb(148, 204, 230)",
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Countdown timer cho gói học chờ duyệt trong modal */}
                    {selectedBooking.status === "pending" &&
                      timeLeft[selectedBooking.id] && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Thời gian chờ duyệt
                          </h4>
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-yellow-700 font-medium">
                                Thời gian còn lại:
                              </span>
                              <span
                                className={`text-xl font-bold ${
                                  timeLeft[selectedBooking.id] === "Hết hạn"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {timeLeft[selectedBooking.id]}
                              </span>
                            </div>
                            <div className="text-sm text-yellow-600 mt-2">
                              Sau 24h sẽ tự động chấp nhận đặt lịch
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Fees Summary */}
                {(() => {
                  const { totalFee, voucher, finalFee, netReceive } =
                    calcTotals(selectedBooking);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Học phí tổng
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatPrice(totalFee)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Giảm bởi voucher
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatPrice(voucher)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Học phí cuối (sau voucher)
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatPrice(finalFee)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phí thực nhận (70%)
                        </label>
                        <p className="mt-1 text-sm font-medium text-green-600">
                          {formatPrice(netReceive)}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Notes */}
                {selectedBooking.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ghi chú
                    </label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-2xl">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-2xl hover:bg-gray-300 transition-colors duration-200"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleSendMessage(selectedBooking.studentEmail);
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white rounded-2xl transition-colors duration-200"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(148, 204, 230, 0.8)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgb(148, 204, 230)")
                  }
                >
                  Nhắn tin
                </button>
                {selectedBooking.status === "pending" &&
                  selectedBooking.type === "package" && (
                    <>
                      <button
                        onClick={() => {
                          handleApproveBooking(selectedBooking.id);
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-2xl hover:bg-green-700 transition-colors duration-200"
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={() => {
                          handleRejectBooking(selectedBooking.id);
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-2xl hover:bg-red-700 transition-colors duration-200"
                      >
                        Từ chối
                      </button>
                    </>
                  )}

                {selectedBooking.status === "payment_completed" &&
                  selectedBooking.type === "package" && (
                    <button
                      onClick={() => {
                        handleCancelBooking(selectedBooking.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-2xl hover:bg-gray-700 transition-colors duration-200"
                      disabled={
                        selectedBooking.completedSessions
                          ? selectedBooking.completedSessions > 0
                          : false
                      }
                    >
                      Hủy
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối booking */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Từ chối đặt lịch
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="Nhập lý do từ chối đặt lịch..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setRejectingBookingId(null);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={submitRejectBooking}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorBookings;
