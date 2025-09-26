import React, { useState, useEffect } from "react";

// Types based on backend entities
interface Booking {
  id: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  tutor: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    headline: string;
    city: string;
  };
  subject: {
    id: number;
    name: string;
    description: string;
  };
  date: string;
  fromTime: string;
  toTime: string;
  time: string;
  status:
    | "PENDING"
    | "PAYMENT_PENDING"
    | "PAYMENT_COMPLETED"
    | "TUTOR_APPROVED"
    | "TUTOR_REJECTED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED";
  bookingType: "SINGLE" | "PACKAGE";
  note: string;
  amount: number;
  paymentStatus:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "REFUNDED"
    | "PROCESSING"
    | "CANCELLED";
  paymentMethod: string;
  paymentReference: string;
  paymentDate: string;
  contractDuration: number;
  sessionsPerWeek: number;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  // const [currentPage] = useState(0);
  const [totalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: 1,
        student: {
          id: 1,
          firstName: "Nguyễn",
          lastName: "Văn A",
          email: "nguyenvana@email.com",
          phoneNumber: "0123456789",
        },
        tutor: {
          id: 1,
          user: {
            firstName: "Trần",
            lastName: "Thị B",
            email: "tranthib@email.com",
          },
          headline: "Gia sư Toán học kinh nghiệm 5 năm",
          city: "Hà Nội",
        },
        subject: {
          id: 1,
          name: "Toán học",
          description: "Toán học cơ bản và nâng cao",
        },
        date: "2024-01-15",
        fromTime: "09:00",
        toTime: "11:00",
        time: "09:00 - 11:00",
        status: "CONFIRMED",
        bookingType: "SINGLE",
        note: "Học sinh cần hỗ trợ về đại số",
        amount: 500000,
        paymentStatus: "COMPLETED",
        paymentMethod: "VNPay",
        paymentReference: "TXN123456",
        paymentDate: "2024-01-12T10:00:00Z",
        contractDuration: 1,
        sessionsPerWeek: 2,
        adminNote: "Học sinh có tiến bộ tốt",
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-12T14:30:00Z",
      },
      {
        id: 2,
        student: {
          id: 3,
          firstName: "Lê",
          lastName: "Văn C",
          email: "levanc@email.com",
          phoneNumber: "0123456788",
        },
        tutor: {
          id: 2,
          user: {
            firstName: "Phạm",
            lastName: "Thị D",
            email: "phamthid@email.com",
          },
          headline: "Chuyên gia Tiếng Anh với chứng chỉ IELTS 8.5",
          city: "TP.HCM",
        },
        subject: {
          id: 2,
          name: "Tiếng Anh",
          description: "Tiếng Anh giao tiếp và luyện thi IELTS",
        },
        date: "2024-01-16",
        fromTime: "14:00",
        toTime: "16:00",
        time: "14:00 - 16:00",
        status: "PENDING",
        bookingType: "PACKAGE",
        note: "Học theo gói 10 buổi",
        amount: 2000000,
        paymentStatus: "PENDING",
        paymentMethod: "",
        paymentReference: "",
        paymentDate: "",
        contractDuration: 10,
        sessionsPerWeek: 2,
        adminNote: "",
        createdAt: "2024-01-11T09:00:00Z",
        updatedAt: "2024-01-11T09:00:00Z",
      },
      {
        id: 3,
        student: {
          id: 4,
          firstName: "Hoàng",
          lastName: "Thị E",
          email: "hoangthie@email.com",
          phoneNumber: "0123456787",
        },
        tutor: {
          id: 3,
          user: {
            firstName: "Vũ",
            lastName: "Văn F",
            email: "vuvanf@email.com",
          },
          headline: "Thạc sĩ Vật lý, giảng dạy 8 năm kinh nghiệm",
          city: "Đà Nẵng",
        },
        subject: {
          id: 3,
          name: "Vật lý",
          description: "Vật lý cơ bản và luyện thi đại học",
        },
        date: "2024-01-17",
        fromTime: "19:00",
        toTime: "21:00",
        time: "19:00 - 21:00",
        status: "IN_PROGRESS",
        bookingType: "PACKAGE",
        note: "Học theo gói 15 buổi",
        amount: 3000000,
        paymentStatus: "COMPLETED",
        paymentMethod: "Bank Transfer",
        paymentReference: "TXN789012",
        paymentDate: "2024-01-13T15:30:00Z",
        contractDuration: 15,
        sessionsPerWeek: 3,
        adminNote: "Học sinh chăm chỉ, có tiềm năng",
        createdAt: "2024-01-12T08:00:00Z",
        updatedAt: "2024-01-15T20:00:00Z",
      },
    ];

    const mockStats: BookingStats = {
      totalBookings: 150,
      pendingBookings: 25,
      confirmedBookings: 80,
      completedBookings: 40,
      cancelledBookings: 5,
      totalRevenue: 75000000,
    };

    // Sắp xếp theo ngày tạo mới nhất
    const sortedBookings = mockBookings.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setBookings(sortedBookings);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-640";
      case "PAYMENT_PENDING":
        return "bg-orange-100 text-orange-800";
      case "PAYMENT_COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "TUTOR_APPROVED":
        return "bg-green-100 text-green-800";
      case "TUTOR_REJECTED":
        return "bg-red-100 text-red-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "PAYMENT_PENDING":
        return "Chờ thanh toán";
      case "PAYMENT_COMPLETED":
        return "Đã thanh toán";
      case "TUTOR_APPROVED":
        return "Giảng viên đã chấp nhận";
      case "TUTOR_REJECTED":
        return "Giảng viên đã từ chối";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "IN_PROGRESS":
        return "Đang diễn ra";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "REFUNDED":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-640";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ thanh toán";
      case "COMPLETED":
        return "Đã thanh toán";
      case "FAILED":
        return "Thanh toán thất bại";
      case "REFUNDED":
        return "Đã hoàn tiền";
      case "PROCESSING":
        return "Đang xử lý";
      case "CANCELLED":
        return "Hủy";
      default:
        return status;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // const formatDateTime = (dateString: string) => {
  //   return new Date(dateString).toLocaleString('vi-VN');
  // };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = !selectedStatus || booking.status === selectedStatus;
    const matchesSearch =
      booking.student.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.student.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.tutor.user.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.tutor.user.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // const handleStatusChange = (bookingId: number, newStatus: string) => {
  //   setBookings((prev) =>
  //     prev.map((booking) =>
  //       booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
  //     )
  //   );
  // };

  // const handleAdminNoteChange = (bookingId: number, note: string) => {
  //   setBookings((prev) =>
  //     prev.map((booking) =>
  //       booking.id === bookingId ? { ...booking, adminNote: note } : booking
  //     )
  //   );
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: "rgb(148, 204, 230)" }}
          ></div>
          <p className="mt-3 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý đặt lịch
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và theo dõi tất cả các buổi học đã đặt
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng đặt lịch
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalBookings}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: "rgb(148, 204, 230)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-1.5M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingBookings}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: "rgb(148, 204, 230)" }}
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
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Đã xác nhận
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.confirmedBookings}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: "rgb(148, 204, 230)" }}
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

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng doanh thu
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: "rgb(148, 204, 230)" }}
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-3">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  placeholder="Tìm theo tên học sinh, gia sư hoặc môn học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-2 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Trạng thái
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-2 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="PAYMENT_PENDING">Chờ thanh toán</option>
                  <option value="PAYMENT_COMPLETED">Đã thanh toán</option>
                  <option value="TUTOR_APPROVED">
                    Giảng viên đã chấp nhận
                  </option>
                  <option value="TUTOR_REJECTED">Giảng viên đã từ chối</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="IN_PROGRESS">Đang diễn ra</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="REFUNDED">Đã hoàn tiền</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                className="px-6 py-2 border rounded-xl font-medium transition-colors duration-200"
                style={{
                  backgroundColor: "rgba(148, 204, 230, 0.1)",
                  borderColor: "rgba(148, 204, 230, 0.3)",
                  color: "rgb(148, 204, 230)",
                }}
              >
                Xuất Excel
              </button>
              <button
                className="px-6 py-2 rounded-xl font-medium text-white transition-colors duration-200"
                style={{ backgroundColor: "rgb(148, 204, 230)" }}
              >
                Thêm mới
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead
                className="text-left"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.05)" }}
              >
                <tr>
                  <th className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Học sinh
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Gia sư
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Ngày/Thời gian
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Thanh toán
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.id}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.student.firstName} {booking.student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.tutor.user.firstName}{" "}
                          {booking.tutor.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.tutor.headline}
                        </div>
                        <div className="text-xs text-gray-400">
                          {booking.tutor.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.subject.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.subject.description}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.time}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className="inline-flex px-3 py-2 text-sm font-semibold rounded-full"
                        style={{
                          backgroundColor: "rgba(148, 204, 230, 0.1)",
                          color: "rgb(148, 204, 230)",
                        }}
                      >
                        {getBookingTypeText(booking.bookingType)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <span
                          className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${getPaymentStatusColor(
                            booking.paymentStatus
                          )}`}
                        >
                          {getPaymentStatusText(booking.paymentStatus)}
                        </span>
                        {booking.paymentReference && (
                          <div className="text-sm text-gray-500 mt-1">
                            {booking.paymentReference}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(booking.amount)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            /* View details */
                          }}
                        >
                          Xem
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={() => {
                            /* Edit */
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            /* Delete */
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "rgb(148, 204, 230)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-1.5M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Không có đặt lịch nào
              </h3>
              <p className="text-gray-500 mb-4">
                Chưa có đặt lịch nào phù hợp với bộ lọc hiện tại.
              </p>
              <button
                className="px-3 py-2 rounded-xl font-medium text-white transition-colors duration-200"
                style={{ backgroundColor: "rgb(148, 204, 230)" }}
              >
                Tạo đặt lịch mới
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mt-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-700">
                Hiển thị <span className="font-medium">1</span> đến{" "}
                <span className="font-medium">10</span> của{" "}
                <span className="font-medium">97</span> kết quả
              </div>
              <div className="flex space-x-1">
                <button
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                  disabled
                >
                  Trước
                </button>
                <button
                  className="px-3 py-2 text-sm font-medium text-white rounded-xl"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  1
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
