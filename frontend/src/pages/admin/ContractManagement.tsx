import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Types based on backend entities
interface Contract {
  id: number;
  tutor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  completedSessions: number;
  hourlyRate: number;
  totalAmount: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  cancelledContracts: number;
  totalRevenue: number;
  averageContractValue: number;
}

const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockContracts: Contract[] = [
      {
        id: 1,
        tutor: {
          id: 1,
          firstName: "Trần",
          lastName: "Thị B",
          email: "tranthib@email.com",
        },
        student: {
          id: 2,
          firstName: "Nguyễn",
          lastName: "Văn A",
          email: "nguyenvana@email.com",
        },
        subject: "Toán học",
        startDate: "2024-01-01",
        endDate: "2024-06-30",
        totalSessions: 24,
        completedSessions: 18,
        hourlyRate: 200000,
        totalAmount: 4800000,
        status: "ACTIVE",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        tutor: {
          id: 3,
          firstName: "Phạm",
          lastName: "Văn C",
          email: "phamvanc@email.com",
        },
        student: {
          id: 4,
          firstName: "Lê",
          lastName: "Thị D",
          email: "lethid@email.com",
        },
        subject: "Vật lý",
        startDate: "2023-09-01",
        endDate: "2024-01-31",
        totalSessions: 20,
        completedSessions: 20,
        hourlyRate: 180000,
        totalAmount: 3600000,
        status: "COMPLETED",
        createdAt: "2023-08-25T00:00:00Z",
        updatedAt: "2024-01-31T23:59:59Z",
      },
      {
        id: 3,
        tutor: {
          id: 5,
          firstName: "Hoàng",
          lastName: "Thị E",
          email: "hoangthie@email.com",
        },
        student: {
          id: 6,
          firstName: "Vũ",
          lastName: "Văn F",
          email: "vuvanf@email.com",
        },
        subject: "Hóa học",
        startDate: "2024-02-01",
        endDate: "2024-05-31",
        totalSessions: 16,
        completedSessions: 5,
        hourlyRate: 220000,
        totalAmount: 3520000,
        status: "CANCELLED",
        createdAt: "2024-01-20T00:00:00Z",
        updatedAt: "2024-03-15T14:20:00Z",
      },
    ];

    const mockStats: ContractStats = {
      totalContracts: 156,
      activeContracts: 89,
      completedContracts: 45,
      cancelledContracts: 22,
      totalRevenue: 125000000,
      averageContractValue: 800000,
    };

    setContracts(mockContracts);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "SUSPENDED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Đang hoạt động";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "SUSPENDED":
        return "Tạm dừng";
      default:
        return status;
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: "rgb(148, 204, 230)" }}
          ></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "rgb(148, 204, 230)" }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Hợp đồng
              </h1>
              <p className="mt-1 text-gray-600">
                Quản lý và theo dõi tất cả các hợp đồng gia sư trong hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(148, 204, 230, 0.1)",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    Tổng hợp đồng
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalContracts}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(148, 204, 230, 0.1)",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    Đang hoạt động
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.activeContracts}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
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

            <div
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(148, 204, 230, 0.1)",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    Hoàn thành
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.completedContracts}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
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
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(148, 204, 230, 0.1)",
                borderColor: "rgba(148, 204, 230, 0.2)",
                border: "1px solid",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    Tổng doanh thu
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalRevenue.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
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
        <div
          className="p-6 rounded-2xl shadow-lg mb-6"
          style={{
            backgroundColor: "white",
            borderColor: "rgba(148, 204, 230, 0.2)",
            border: "1px solid",
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo gia sư, học viên, môn học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700 font-medium transition-colors duration-200 w-full sm:w-80"
                  style={{
                    borderColor: "rgba(148, 204, 230, 0.3)",
                    focusRingColor: "rgb(148, 204, 230)",
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700 font-medium transition-colors duration-200"
                style={{
                  borderColor: "rgba(148, 204, 230, 0.3)",
                  focusRingColor: "rgb(148, 204, 230)",
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="SUSPENDED">Tạm dừng</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                className="px-4 py-3 rounded-xl transition-colors duration-200 font-medium"
                style={{
                  backgroundColor: "rgba(148, 204, 230, 0.1)",
                  color: "rgb(148, 204, 230)",
                }}
              >
                Xuất Excel
              </button>
              <button
                className="px-4 py-3 text-white rounded-xl transition-colors duration-200 font-medium"
                style={{ backgroundColor: "rgb(148, 204, 230)" }}
              >
                Tạo hợp đồng mới
              </button>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <div
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{
            backgroundColor: "white",
            borderColor: "rgba(148, 204, 230, 0.2)",
            border: "1px solid",
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead
                className=""
                style={{ backgroundColor: "rgba(148, 204, 230, 0.05)" }}
              >
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gia sư
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học viên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiến độ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời hạn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{contract.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contract.tutor.firstName} {contract.tutor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contract.tutor.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contract.student.firstName}{" "}
                          {contract.student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contract.student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: "rgba(148, 204, 230, 0.1)",
                          color: "rgb(148, 204, 230)",
                        }}
                      >
                        {contract.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contract.completedSessions} / {contract.totalSessions}{" "}
                        buổi
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: "rgb(148, 204, 230)",
                            width: `${getProgressPercentage(
                              contract.completedSessions,
                              contract.totalSessions
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getProgressPercentage(
                          contract.completedSessions,
                          contract.totalSessions
                        )}
                        %
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(contract.startDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        đến{" "}
                        {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.totalAmount.toLocaleString("vi-VN")} VNĐ
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.hourlyRate.toLocaleString("vi-VN")} VNĐ/giờ
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          contract.status
                        )}`}
                      >
                        {getStatusText(contract.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          style={{ color: "rgb(148, 204, 230)" }}
                        >
                          Xem
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          style={{ color: "rgb(148, 204, 230)" }}
                        >
                          Sửa
                        </button>
                        <button
                          className={`${
                            contract.status === "ACTIVE"
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {contract.status === "ACTIVE"
                            ? "Tạm dừng"
                            : "Kích hoạt"}
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center">
          <nav
            className="flex items-center space-x-2 rounded-2xl shadow-lg p-2"
            style={{
              backgroundColor: "white",
              borderColor: "rgba(148, 204, 230, 0.2)",
              border: "1px solid",
            }}
          >
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              Trước
            </button>
            <button
              className="px-3 py-2 text-sm font-medium text-white rounded-xl transition-colors duration-200"
              style={{ backgroundColor: "rgb(148, 204, 230)" }}
            >
              1
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors duration-200">
              2
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors duration-200">
              3
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              Sau
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ContractManagement;
