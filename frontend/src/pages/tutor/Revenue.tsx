import React, { useState, useEffect } from "react";

interface RevenueData {
  id: string;
  studentName: string;
  subject: string;
  sessionDate: string;
  sessionTime: string;
  type: "single" | "package";
  sessionFee: number;
  platformFee: number; // Phí nền tảng (30%)
  netRevenue: number; // Thu nhập thực tế
  status: "completed" | "pending" | "cancelled";
  paymentDate?: string;
  bookingId: string;
}

interface RevenueStats {
  totalRevenue: number;
  netRevenue: number;
  platformFees: number;
  completedSessions: number;
  pendingSessions: number;
  averageSessionFee: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
}

const Revenue: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const mockRevenueData: RevenueData[] = [
    {
      id: "1",
      studentName: "Nguyễn Minh An",
      subject: "Tiếng Anh",
      sessionDate: "2025-01-15",
      sessionTime: "19:00-20:00",
      type: "single",
      sessionFee: 200000,
      platformFee: 60000,
      netRevenue: 140000,
      status: "completed",
      paymentDate: "2025-01-15",
      bookingId: "BK001",
    },
    {
      id: "2",
      studentName: "Trần Thị Hoa",
      subject: "IELTS",
      sessionDate: "2025-01-16",
      sessionTime: "16:00-17:00",
      type: "package",
      sessionFee: 250000,
      platformFee: 75000,
      netRevenue: 175000,
      status: "completed",
      paymentDate: "2025-01-16",
      bookingId: "BK002",
    },
    {
      id: "3",
      studentName: "Lê Văn Nam",
      subject: "Toán",
      sessionDate: "2025-01-17",
      sessionTime: "18:30-19:30",
      type: "single",
      sessionFee: 180000,
      platformFee: 54000,
      netRevenue: 126000,
      status: "pending",
      bookingId: "BK003",
    },
    {
      id: "4",
      studentName: "Phạm Thị Lan",
      subject: "Vật Lý",
      sessionDate: "2025-01-18",
      sessionTime: "20:00-21:00",
      type: "package",
      sessionFee: 220000,
      platformFee: 66000,
      netRevenue: 154000,
      status: "completed",
      paymentDate: "2025-01-18",
      bookingId: "BK004",
    },
    {
      id: "5",
      studentName: "Hoàng Văn Đức",
      subject: "Hóa học",
      sessionDate: "2025-01-19",
      sessionTime: "17:00-18:00",
      type: "single",
      sessionFee: 190000,
      platformFee: 57000,
      netRevenue: 133000,
      status: "cancelled",
      bookingId: "BK005",
    },
  ];

  const mockStats: RevenueStats = {
    totalRevenue: 1040000,
    netRevenue: 728000,
    platformFees: 312000,
    completedSessions: 3,
    pendingSessions: 1,
    averageSessionFee: 208000,
    monthlyRevenue: 728000,
    weeklyRevenue: 182000,
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
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bookingId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    const matchesType = filterType === "all" || item.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doanh thu</h1>
            <p className="text-sm text-gray-600">
              Theo dõi thu nhập và doanh thu từ các buổi học
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Thu nhập thực tế
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats && formatCurrency(stats.netRevenue)}
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
                Tổng doanh thu
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats && formatCurrency(stats.totalRevenue)}
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Phí nền tảng</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats && formatCurrency(stats.platformFees)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm học viên, môn học..."
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
                  Thu nhập thực
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
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-red-600">
                    -{formatCurrency(item.platformFee)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    {formatCurrency(item.netRevenue)}
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Tóm tắt doanh thu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                filteredData
                  .filter((item) => item.status === "completed")
                  .reduce((sum, item) => sum + item.netRevenue, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Đã nhận</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(
                filteredData
                  .filter((item) => item.status === "pending")
                  .reduce((sum, item) => sum + item.netRevenue, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Chờ thanh toán</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(
                filteredData.reduce((sum, item) => sum + item.platformFee, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Phí nền tảng</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;




