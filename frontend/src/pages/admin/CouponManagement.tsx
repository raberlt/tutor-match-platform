import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Types based on backend entities
interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalUsage: number;
  totalDiscountGiven: number;
  mostUsedCoupon: {
    code: string;
    usageCount: number;
  };
}

const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCoupons: Coupon[] = [
      {
        id: 1,
        code: "WELCOME10",
        name: "Chào mừng khách hàng mới",
        description: "Giảm 10% cho khách hàng lần đầu đăng ký",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 500000,
        maxDiscountAmount: 100000,
        usageLimit: 1000,
        usedCount: 245,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: 2,
        code: "SUMMER50K",
        name: "Khuyến mãi mùa hè",
        description: "Giảm 50,000 VNĐ cho đơn hàng từ 1,000,000 VNĐ",
        discountType: "FIXED_AMOUNT",
        discountValue: 50000,
        minOrderAmount: 1000000,
        maxDiscountAmount: 50000,
        usageLimit: 500,
        usedCount: 89,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        isActive: true,
        createdAt: "2024-05-15T00:00:00Z",
        updatedAt: "2024-05-15T00:00:00Z",
      },
      {
        id: 3,
        code: "STUDENT20",
        name: "Ưu đãi học sinh",
        description: "Giảm 20% cho học sinh, sinh viên",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 300000,
        maxDiscountAmount: 200000,
        usageLimit: 2000,
        usedCount: 1567,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: 4,
        code: "EXPIRED15",
        name: "Mã giảm giá đã hết hạn",
        description: "Giảm 15% - đã hết hạn",
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOrderAmount: 400000,
        maxDiscountAmount: 150000,
        usageLimit: 100,
        usedCount: 45,
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        isActive: false,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-12-31T23:59:59Z",
      },
    ];

    const mockStats: CouponStats = {
      totalCoupons: 25,
      activeCoupons: 18,
      expiredCoupons: 7,
      totalUsage: 2847,
      totalDiscountGiven: 125000000,
      mostUsedCoupon: {
        code: "STUDENT20",
        usageCount: 1567,
      },
    };

    // Sắp xếp theo ngày tạo mới nhất
    const sortedCoupons = mockCoupons.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setCoupons(sortedCoupons);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const getStatusColor = (isActive: boolean, endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);

    if (!isActive) return "bg-red-100 text-red-800";
    if (end < now) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (isActive: boolean, endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);

    if (!isActive) return "Tạm dừng";
    if (end < now) return "Hết hạn";
    return "Hoạt động";
  };

  const getTypeColor = (type: string) => {
    return type === "PERCENTAGE"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  const getTypeText = (type: string) => {
    return type === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định";
  };

  const formatDiscountValue = (coupon: Coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}%`;
    } else {
      return `${coupon.discountValue.toLocaleString("vi-VN")} VNĐ`;
    }
  };

  const getUsagePercentage = (usedCount: number, usageLimit: number) => {
    return Math.round((usedCount / usageLimit) * 100);
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
          <p className="mt-3 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div
              className="p-2 rounded-xl"
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý Mã giảm giá
              </h1>
              <p className="text-sm text-gray-600">
                Quản lý và theo dõi tất cả các mã giảm giá trong hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div
              className="p-4 rounded-xl shadow-md hover:shadow-md transition-all duration-300"
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
                    Tổng mã giảm giá
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalCoupons}
                  </p>
                </div>
                <div
                  className="p-1 rounded-full"
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl shadow-md hover:shadow-md transition-all duration-300"
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
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeCoupons}
                  </p>
                </div>
                <div
                  className="p-1 rounded-full"
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

            <div
              className="p-4 rounded-xl shadow-md hover:shadow-md transition-all duration-300"
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
                    Tổng sử dụng
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsage}
                  </p>
                </div>
                <div
                  className="p-1 rounded-full"
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl shadow-md hover:shadow-md transition-all duration-300"
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
                    Tổng giảm giá
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalDiscountGiven.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
                <div
                  className="p-1 rounded-full"
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Most Used Coupon */}
        {stats && (
          <div
            className="p-4 rounded-xl shadow-md mb-4"
            style={{
              backgroundColor: "white",
              borderColor: "rgba(148, 204, 230, 0.2)",
              border: "1px solid",
            }}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Mã giảm giá được sử dụng nhiều nhất
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.mostUsedCoupon.code}
                </div>
                <div className="text-sm text-gray-600">
                  Đã sử dụng {stats.mostUsedCoupon.usageCount} lần
                </div>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: "rgba(148, 204, 230, 0.1)",
                  borderColor: "rgba(148, 204, 230, 0.2)",
                  border: "1px solid",
                }}
              >
                <div
                  className="text-lg font-bold"
                  style={{ color: "rgb(148, 204, 230)" }}
                >
                  {stats.mostUsedCoupon.usageCount}
                </div>
                <div className="text-sm text-gray-600">lần sử dụng</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div
          className="p-4 rounded-xl shadow-md mb-4"
          style={{
            backgroundColor: "white",
            borderColor: "rgba(148, 204, 230, 0.2)",
            border: "1px solid",
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã, tên, mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700 text-xs transition-colors duration-200 w-full sm:w-64"
                  style={{
                    borderColor: "rgba(148, 204, 230, 0.3)",
                    focusRingColor: "rgb(148, 204, 230)",
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
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
                className="px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700 text-xs transition-colors duration-200"
                style={{
                  borderColor: "rgba(148, 204, 230, 0.3)",
                  focusRingColor: "rgb(148, 204, 230)",
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="expired">Hết hạn</option>
                <option value="inactive">Tạm dừng</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700 text-xs transition-colors duration-200"
                style={{
                  borderColor: "rgba(148, 204, 230, 0.3)",
                  focusRingColor: "rgb(148, 204, 230)",
                }}
              >
                <option value="">Tất cả loại</option>
                <option value="PERCENTAGE">Phần trăm</option>
                <option value="FIXED_AMOUNT">Số tiền cố định</option>
              </select>
            </div>

            <div className="flex gap-1">
              <button
                className="px-3 py-2 rounded-xl transition-colors duration-200 text-sm font-medium"
                style={{
                  backgroundColor: "rgba(148, 204, 230, 0.1)",
                  color: "rgb(148, 204, 230)",
                }}
              >
                Xuất Excel
              </button>
              <button
                className="px-3 py-2 text-white rounded-xl transition-colors duration-200 text-sm font-medium"
                style={{ backgroundColor: "rgb(148, 204, 230)" }}
              >
                Tạo mới
              </button>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div
          className="rounded-xl shadow-md overflow-hidden"
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
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Mã
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Loại giảm giá
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Sử dụng
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Thời hạn
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-900">
                        {coupon.name}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {coupon.description}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${getTypeColor(
                          coupon.discountType
                        )}`}
                      >
                        {getTypeText(coupon.discountType)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDiscountValue(coupon)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Tối thiểu:{" "}
                        {coupon.minOrderAmount.toLocaleString("vi-VN")} VNĐ
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {coupon.usedCount} / {coupon.usageLimit}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            backgroundColor: "rgb(148, 204, 230)",
                            width: `${getUsagePercentage(
                              coupon.usedCount,
                              coupon.usageLimit
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {getUsagePercentage(
                          coupon.usedCount,
                          coupon.usageLimit
                        )}
                        %
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(coupon.startDate).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-sm text-gray-500">
                        đến{" "}
                        {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${getStatusColor(
                          coupon.isActive,
                          coupon.endDate
                        )}`}
                      >
                        {getStatusText(coupon.isActive, coupon.endDate)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button
                          className="text-blue-600 hover:text-blue-900 text-xs"
                          style={{ color: "rgb(148, 204, 230)" }}
                        >
                          Xem
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 text-xs"
                          style={{ color: "rgb(148, 204, 230)" }}
                        >
                          Sửa
                        </button>
                        <button
                          className={`text-xs ${
                            coupon.isActive
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {coupon.isActive ? "Tạm dừng" : "Kích hoạt"}
                        </button>
                        <button className="text-red-600 hover:text-red-900 text-xs">
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
        <div className="mt-3 flex justify-center">
          <nav
            className="flex items-center space-x-1 rounded-xl shadow-md p-1"
            style={{
              backgroundColor: "white",
              borderColor: "rgba(148, 204, 230, 0.2)",
              border: "1px solid",
            }}
          >
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              Trước
            </button>
            <button
              className="px-3 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200"
              style={{ backgroundColor: "rgb(148, 204, 230)" }}
            >
              1
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200">
              2
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200">
              3
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              Sau
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CouponManagement;
