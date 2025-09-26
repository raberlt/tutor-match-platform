import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Types based on backend entities
interface Payment {
  id: number;
  booking: {
    id: number;
    student: {
      firstName: string;
      lastName: string;
      email: string;
    };
    tutor: {
      firstName: string;
      lastName: string;
      email: string;
    };
    subject: {
      name: string;
    };
    date: string;
    fromTime: string;
    toTime: string;
  };
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  tutor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  originalAmount: number;
  discountAmount: number;
  coupon: {
    id: number;
    code: string;
    name: string;
  } | null;
  paymentMethod: "VNPAY" | "MOMO" | "BANKING" | "CASH";
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  transactionId: string;
  paymentGateway: string;
  description: string;
  gatewayResponse: string;
  adminNote: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  totalPayments: number;
  totalRevenue: number;
  pendingPayments: number;
  paidPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalDiscount: number;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: 1,
        booking: {
          id: 1,
          student: {
            firstName: "Nguyễn",
            lastName: "Văn A",
            email: "nguyenvana@email.com",
          },
          tutor: {
            firstName: "Trần",
            lastName: "Thị B",
            email: "tranthib@email.com",
          },
          subject: {
            name: "Toán học",
          },
          date: "2024-01-15",
          fromTime: "09:00",
          toTime: "11:00",
        },
        student: {
          id: 1,
          firstName: "Nguyễn",
          lastName: "Văn A",
          email: "nguyenvana@email.com",
        },
        tutor: {
          id: 2,
          firstName: "Trần",
          lastName: "Thị B",
          email: "tranthib@email.com",
        },
        amount: 450000,
        originalAmount: 500000,
        discountAmount: 50000,
        coupon: {
          id: 1,
          code: "WELCOME10",
          name: "Giảm 10% cho khách hàng mới",
        },
        paymentMethod: "VNPAY",
        status: "PAID",
        transactionId: "VNPAY_20240115_001",
        paymentGateway: "VNPay",
        description: "Thanh toán buổi học Toán học",
        gatewayResponse: "Success",
        adminNote: "",
        paidAt: "2024-01-15T09:30:00Z",
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-15T09:30:00Z",
      },
      {
        id: 2,
        booking: {
          id: 2,
          student: {
            firstName: "Lê",
            lastName: "Văn C",
            email: "levanc@email.com",
          },
          tutor: {
            firstName: "Phạm",
            lastName: "Thị D",
            email: "phamthid@email.com",
          },
          subject: {
            name: "Tiếng Anh",
          },
          date: "2024-01-16",
          fromTime: "14:00",
          toTime: "16:00",
        },
        student: {
          id: 3,
          firstName: "Lê",
          lastName: "Văn C",
          email: "levanc@email.com",
        },
        tutor: {
          id: 4,
          firstName: "Phạm",
          lastName: "Thị D",
          email: "phamthid@email.com",
        },
        amount: 200000,
        originalAmount: 200000,
        discountAmount: 0,
        coupon: null,
        paymentMethod: "MOMO",
        status: "PENDING",
        transactionId: "",
        paymentGateway: "MoMo",
        description: "Thanh toán buổi học thử Tiếng Anh",
        gatewayResponse: "",
        adminNote: "",
        paidAt: "",
        createdAt: "2024-01-16T08:00:00Z",
        updatedAt: "2024-01-16T08:00:00Z",
      },
    ];

    const mockStats: PaymentStats = {
      totalPayments: 250,
      totalRevenue: 125000000,
      pendingPayments: 15,
      paidPayments: 200,
      failedPayments: 20,
      refundedPayments: 15,
      totalDiscount: 5000000,
    };

    setPayments(mockPayments);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ thanh toán";
      case "PAID":
        return "Đã thanh toán";
      case "FAILED":
        return "Thanh toán thất bại";
      case "REFUNDED":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case "VNPAY":
        return "VNPay";
      case "MOMO":
        return "MoMo";
      case "BANKING":
        return "Chuyển khoản";
      case "CASH":
        return "Tiền mặt";
      default:
        return method;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "VNPAY":
        return "bg-blue-100 text-blue-800";
      case "MOMO":
        return "bg-pink-100 text-pink-800";
      case "BANKING":
        return "bg-green-100 text-green-800";
      case "CASH":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Thanh toán
              </h1>
              <p className="mt-1 text-gray-600">
                Quản lý và theo dõi tất cả các giao dịch thanh toán
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
                    Tổng giao dịch
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalPayments}
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
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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
                    Đã thanh toán
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.paidPayments}
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
                    Tổng giảm giá
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalDiscount.toLocaleString("vi-VN")} VNĐ
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
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
                  placeholder="Tìm kiếm theo tên, email, mã giao dịch..."
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
                <option value="PENDING">Chờ thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="FAILED">Thất bại</option>
                <option value="REFUNDED">Đã hoàn tiền</option>
              </select>

              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700 font-medium transition-colors duration-200"
                style={{
                  borderColor: "rgba(148, 204, 230, 0.3)",
                  focusRingColor: "rgb(148, 204, 230)",
                }}
              >
                <option value="">Tất cả phương thức</option>
                <option value="VNPAY">VNPay</option>
                <option value="MOMO">MoMo</option>
                <option value="BANKING">Chuyển khoản</option>
                <option value="CASH">Tiền mặt</option>
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
                Thống kê
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
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
                    Học sinh
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gia sư
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phương thức
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.student.firstName} {payment.student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.tutor.firstName} {payment.tutor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.tutor.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.booking.subject.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.booking.date} {payment.booking.fromTime}-
                        {payment.booking.toTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.amount.toLocaleString("vi-VN")} VNĐ
                      </div>
                      {payment.discountAmount > 0 && (
                        <div className="text-sm text-green-600">
                          -{payment.discountAmount.toLocaleString("vi-VN")} VNĐ
                        </div>
                      )}
                      {payment.coupon && (
                        <div className="text-xs text-blue-600">
                          {payment.coupon.code}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(
                          payment.paymentMethod
                        )}`}
                      >
                        {getMethodText(payment.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleString("vi-VN")
                        : new Date(payment.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          style={{ color: "rgb(148, 204, 230)" }}
                        >
                          Xem
                        </button>
                        {payment.status === "PAID" && (
                          <button className="text-orange-600 hover:text-orange-900">
                            Hoàn tiền
                          </button>
                        )}
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

export default PaymentManagement;
