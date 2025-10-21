import React, { useState, useEffect } from "react";

interface AdminRevenueData {
  id: string;
  tutorName: string;
  studentName: string;
  subject: string;
  sessionDate: string;
  sessionTime: string;
  type: "single" | "package";
  sessionFee: number;
  platformFee: number; // Phí nền tảng (30%)
  tutorRevenue: number; // Thu nhập của gia sư (70%)
  status: "completed" | "pending" | "cancelled";
  paymentDate?: string;
  bookingId: string;
  tutorId: string;
}

interface AdminRevenueStats {
  totalPlatformRevenue: number; // Tổng thu nhập nền tảng
  totalTutorRevenue: number; // Tổng thu nhập gia sư
  totalGrossRevenue: number; // Tổng doanh thu gộp
  completedSessions: number;
  pendingSessions: number;
  cancelledSessions: number;
  averagePlatformFee: number;
  monthlyPlatformRevenue: number;
  weeklyPlatformRevenue: number;
  topTutorRevenue: number;
  totalTutors: number;
}

const AdminRevenue: React.FC = () => {
  const [revenueData, setRevenueData] = useState<AdminRevenueData[]>([]);
  const [stats, setStats] = useState<AdminRevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTutor, setFilterTutor] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const mockRevenueData: AdminRevenueData[] = [
    {
      id: "1",
      tutorName: "Nguyễn Văn A",
      studentName: "Nguyễn Minh An",
      subject: "Tiếng Anh",
      sessionDate: "2025-01-15",
      sessionTime: "19:00-20:00",
      type: "single",
      sessionFee: 200000,
      platformFee: 60000,
      tutorRevenue: 140000,
      status: "completed",
      paymentDate: "2025-01-15",
      bookingId: "BK001",
      tutorId: "T001",
    },
    {
      id: "2",
      tutorName: "Trần Thị B",
      studentName: "Trần Thị Hoa",
      subject: "IELTS",
      sessionDate: "2025-01-16",
      sessionTime: "16:00-17:00",
      type: "package",
      sessionFee: 250000,
      platformFee: 75000,
      tutorRevenue: 175000,
      status: "completed",
      paymentDate: "2025-01-16",
      bookingId: "BK002",
      tutorId: "T002",
    },
    {
      id: "3",
      tutorName: "Lê Văn C",
      studentName: "Lê Văn Nam",
      subject: "Toán",
      sessionDate: "2025-01-17",
      sessionTime: "18:30-19:30",
      type: "single",
      sessionFee: 180000,
      platformFee: 54000,
      tutorRevenue: 126000,
      status: "pending",
      bookingId: "BK003",
      tutorId: "T003",
    },
    {
      id: "4",
      tutorName: "Phạm Thị D",
      studentName: "Phạm Thị Lan",
      subject: "Vật Lý",
      sessionDate: "2025-01-18",
      sessionTime: "20:00-21:00",
      type: "package",
      sessionFee: 220000,
      platformFee: 66000,
      tutorRevenue: 154000,
      status: "completed",
      paymentDate: "2025-01-18",
      bookingId: "BK004",
      tutorId: "T004",
    },
    {
      id: "5",
      tutorName: "Hoàng Văn E",
      studentName: "Hoàng Văn Đức",
      subject: "Hóa học",
      sessionDate: "2025-01-19",
      sessionTime: "17:00-18:00",
      type: "single",
      sessionFee: 190000,
      platformFee: 57000,
      tutorRevenue: 133000,
      status: "cancelled",
      bookingId: "BK005",
      tutorId: "T005",
    },
    {
      id: "6",
      tutorName: "Nguyễn Văn A",
      studentName: "Võ Thị F",
      subject: "Tiếng Anh",
      sessionDate: "2025-01-20",
      sessionTime: "19:00-20:00",
      type: "package",
      sessionFee: 200000,
      platformFee: 60000,
      tutorRevenue: 140000,
      status: "completed",
      paymentDate: "2025-01-20",
      bookingId: "BK006",
      tutorId: "T001",
    },
  ];

  const mockStats: AdminRevenueStats = {
    totalPlatformRevenue: 372000,
    totalTutorRevenue: 868000,
    totalGrossRevenue: 1240000,
    completedSessions: 4,
    pendingSessions: 1,
    cancelledSessions: 1,
    averagePlatformFee: 62000,
    monthlyPlatformRevenue: 372000,
    weeklyPlatformRevenue: 93000,
    topTutorRevenue: 140000,
    totalTutors: 5,
  };

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRevenueData(mockRevenueData);
      setStats(mockStats);
    } catch (error) {
      console.error("Error loading revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ thanh toán";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const filteredData = revenueData.filter((item) => {
    const matchesSearch =
      item.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bookingId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesTutor = filterTutor === "all" || item.tutorId === filterTutor;

    return matchesSearch && matchesStatus && matchesType && matchesTutor;
  });

  // Get unique tutors for filter
  const uniqueTutors = Array.from(
    new Set(
      revenueData.map((item) => ({ id: item.tutorId, name: item.tutorName }))
    )
  ).map((tutor) => ({ id: tutor.id, name: tutor.name }));

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
              Doanh thu nền tảng
            </h1>
            <p className="text-sm text-gray-600">
              Theo dõi doanh thu và phí nền tảng từ tất cả các buổi học
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600"
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
                Doanh thu nền tảng
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats && formatCurrency(stats.totalPlatformRevenue)}
              </p>
            </div>
          </div>
        </div>

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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng doanh thu gộp
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats && formatCurrency(stats.totalGrossRevenue)}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Buổi học hoàn thành
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.completedSessions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng số gia sư
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalTutors || 0}
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
                placeholder="Tìm kiếm gia sư, học viên, môn học..."
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
              <option value="completed">Hoàn thành</option>
              <option value="pending">Chờ thanh toán</option>
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

            <select
              value={filterTutor}
              onChange={(e) => setFilterTutor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả gia sư</option>
              {uniqueTutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Chi tiết doanh thu ({filteredData.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã lịch
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gia sư
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học viên
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày học
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học phí
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phí nền tảng
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thu nhập gia sư
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.bookingId}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.tutorName}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.studentName}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.subject}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>
                        {new Date(item.sessionDate).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.sessionTime}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === "package"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.type === "package" ? "Gói học" : "Đơn lẻ"}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.sessionFee)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                    {formatCurrency(item.platformFee)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-green-600">
                    {formatCurrency(item.tutorRevenue)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Tóm tắt doanh thu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                filteredData
                  .filter((item) => item.status === "completed")
                  .reduce((sum, item) => sum + item.platformFee, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Phí nền tảng đã thu</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(
                filteredData
                  .filter((item) => item.status === "pending")
                  .reduce((sum, item) => sum + item.platformFee, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Phí nền tảng chờ thu</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                filteredData
                  .filter((item) => item.status === "completed")
                  .reduce((sum, item) => sum + item.tutorRevenue, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Thu nhập gia sư</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(
                filteredData.reduce((sum, item) => sum + item.sessionFee, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Tổng doanh thu gộp</div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Gia sư có doanh thu cao nhất
        </h3>
        <div className="space-y-3">
          {uniqueTutors.slice(0, 5).map((tutor, index) => {
            const tutorRevenue = filteredData
              .filter(
                (item) =>
                  item.tutorId === tutor.id && item.status === "completed"
              )
              .reduce((sum, item) => sum + item.tutorRevenue, 0);

            const tutorPlatformFee = filteredData
              .filter(
                (item) =>
                  item.tutorId === tutor.id && item.status === "completed"
              )
              .reduce((sum, item) => sum + item.platformFee, 0);

            return (
              <div
                key={tutor.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {tutor.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {
                        filteredData.filter(
                          (item) =>
                            item.tutorId === tutor.id &&
                            item.status === "completed"
                        ).length
                      }{" "}
                      buổi hoàn thành
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(tutorRevenue)}
                  </div>
                  <div className="text-sm text-red-600">
                    +{formatCurrency(tutorPlatformFee)} phí nền tảng
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;


