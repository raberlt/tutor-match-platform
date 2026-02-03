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
  tutorName: string;
  tutorEmail: string;
  tutorPhone: string;
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

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for admin bookings
  const mockBookings: Booking[] = [
    {
      id: "BK001",
      studentName: "Nguyễn Minh An",
      studentEmail: "minhan@email.com",
      studentPhone: "0123456789",
      tutorName: "Trần Văn Bình",
      tutorEmail: "binh@email.com",
      tutorPhone: "0987654321",
      subject: "Toán học",
      type: "single",
      date: "2025-01-25",
      startTime: "09:00",
      endTime: "11:00",
      status: "payment_completed",
      price: 200000,
      notes: "Học sinh cần hỗ trợ về đại số",
      createdAt: "2025-01-20T10:00:00Z",
      targetAudience: "Trung học cơ sở",
      location: "Hà Nội",
      gender: "Nam",
    },
    {
      id: "BK002",
      studentName: "Lê Thị Hoa",
      studentEmail: "hoa@email.com",
      studentPhone: "0123456788",
      tutorName: "Phạm Văn Cường",
      tutorEmail: "cuong@email.com",
      tutorPhone: "0987654322",
      subject: "Vật lý",
      type: "package",
      date: "2025-01-26",
      startTime: "14:00",
      endTime: "16:00",
      status: "pending",
      price: 180000,
      totalSessions: 10,
      completedSessions: 0,
      notes: "Gói học vật lý cơ bản",
      createdAt: "2025-01-21T14:00:00Z",
      packageId: "PK001",
      packageName: "Vật lý cơ bản",
      pendingDeadline: "2025-01-22T14:00:00Z",
      targetAudience: "Trung học phổ thông",
      location: "TP.HCM",
      gender: "Nữ",
      sessions: [
        {
          sessionId: "S001",
          date: "2025-01-26",
          startTime: "14:00",
          endTime: "16:00",
          status: "pending",
          fee: 180000,
        },
        {
          sessionId: "S002",
          date: "2025-01-28",
          startTime: "14:00",
          endTime: "16:00",
          status: "pending",
          fee: 180000,
        },
      ],
    },
    {
      id: "BK003",
      studentName: "Hoàng Văn Đức",
      studentEmail: "duc@email.com",
      studentPhone: "0123456787",
      tutorName: "Trần Văn Bình",
      tutorEmail: "binh@email.com",
      tutorPhone: "0987654321",
      subject: "Hóa học",
      type: "package",
      date: "2025-01-27",
      startTime: "10:00",
      endTime: "12:00",
      status: "payment_pending",
      price: 220000,
      totalSessions: 8,
      completedSessions: 0,
      notes: "Gói học hóa học nâng cao",
      createdAt: "2025-01-22T09:00:00Z",
      packageId: "PK002",
      packageName: "Hóa học nâng cao",
      targetAudience: "Cao đẳng/Đại học",
      location: "Đà Nẵng",
      gender: "Nam",
      voucherDiscount: 50000,
      sessions: [
        {
          sessionId: "S003",
          date: "2025-01-27",
          startTime: "10:00",
          endTime: "12:00",
          status: "pending",
          fee: 220000,
        },
      ],
    },
  ];

  // Load bookings data
  const loadBookings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setBookings(mockBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Đã từ chối";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      case "payment_pending":
        return "Chờ thanh toán";
      case "payment_completed":
        return "Đã thanh toán";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "payment_pending":
        return "bg-orange-100 text-orange-800";
      case "payment_completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tutorEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || booking.status === filterStatus;
    const matchesType = filterType === "all" || booking.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý đặt lịch
            </h1>
            <p className="text-sm text-gray-600">
              Theo dõi và quản lý tất cả đặt lịch học
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đặt lịch</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-orange-500">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg
                className="w-6 h-6 text-orange-600"
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Chờ thanh toán
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "payment_pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm mã lịch, tên học sinh hoặc gia sư..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
              <option value="payment_pending">Chờ thanh toán</option>
              <option value="payment_completed">Đã thanh toán</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả loại</option>
              <option value="single">Đơn lẻ</option>
              <option value="package">Gói học</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Danh sách đặt lịch ({filteredBookings.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã lịch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học sinh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gia sư
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học phí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.studentName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.studentEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.tutorName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.tutorEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.type === "single"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {booking.type === "single" ? "Đơn lẻ" : "Gói học"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(booking.price)}
                    {booking.type === "package" && booking.totalSessions && (
                      <div className="text-xs text-gray-500">
                        ({booking.totalSessions} buổi)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết đặt lịch - {selectedBooking.id}
                </h3>
                <button
                  onClick={handleCloseModal}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Thông tin học sinh
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Họ tên:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedBooking.studentName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Email:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedBooking.studentEmail}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Số điện thoại:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedBooking.studentPhone}
                      </span>
                    </div>
                    {selectedBooking.targetAudience && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Đối tượng:
                        </span>
                        <span className="ml-2 text-sm text-gray-900">
                          {selectedBooking.targetAudience}
                        </span>
                      </div>
                    )}
                    {selectedBooking.location && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Tỉnh/Thành phố:
                        </span>
                        <span className="ml-2 text-sm text-gray-900">
                          {selectedBooking.location}
                        </span>
                      </div>
                    )}
                    {selectedBooking.gender && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Giới tính:
                        </span>
                        <span className="ml-2 text-sm text-gray-900">
                          {selectedBooking.gender}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tutor Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Thông tin gia sư
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Họ tên:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedBooking.tutorName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Email:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedBooking.tutorEmail}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Số điện thoại:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedBooking.tutorPhone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Thông tin đặt lịch
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Môn học:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedBooking.subject}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Loại:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedBooking.type === "single" ? "Đơn lẻ" : "Gói học"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Ngày học:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {formatDate(selectedBooking.date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Thời gian:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedBooking.startTime} - {selectedBooking.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Trạng thái:
                    </span>
                    <span
                      className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        selectedBooking.status
                      )}`}
                    >
                      {getStatusText(selectedBooking.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Học phí:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {formatCurrency(selectedBooking.price)}
                    </span>
                  </div>
                </div>

                {selectedBooking.type === "package" && (
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">
                      Thông tin gói học
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Tên gói:
                        </span>
                        <span className="ml-2 text-sm text-gray-900">
                          {selectedBooking.packageName}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Tổng số buổi:
                        </span>
                        <span className="ml-2 text-sm text-gray-900">
                          {selectedBooking.totalSessions}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Đã hoàn thành:
                        </span>
                        <span className="ml-2 text-sm text-gray-900">
                          {selectedBooking.completedSessions || 0}
                        </span>
                      </div>
                      {selectedBooking.voucherDiscount && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            Giảm giá:
                          </span>
                          <span className="ml-2 text-sm text-gray-900">
                            {formatCurrency(selectedBooking.voucherDiscount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedBooking.sessions &&
                      selectedBooking.sessions.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">
                            Danh sách buổi học
                          </h5>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Ngày
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Thời gian
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Trạng thái
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Học phí
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {selectedBooking.sessions.map((session) => (
                                  <tr key={session.sessionId}>
                                    <td className="px-3 py-2 text-gray-900">
                                      {formatDate(session.date)}
                                    </td>
                                    <td className="px-3 py-2 text-gray-900">
                                      {session.startTime} - {session.endTime}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                          session.status
                                        )}`}
                                      >
                                        {getStatusText(session.status)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-gray-900">
                                      {formatCurrency(session.fee)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {selectedBooking.notes && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-600">
                      Ghi chú:
                    </span>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;




