import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Types based on backend entities
interface Rate {
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
  note: string;
  ratePoint: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RatingStats {
  totalRatings: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  visibleRatings: number;
  hiddenRatings: number;
}

const RatingManagement: React.FC = () => {
  const [ratings, setRatings] = useState<Rate[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [selectedVisibility, setSelectedVisibility] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockRatings: Rate[] = [
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
        note: "Thầy giáo dạy rất tốt, có tâm và trình độ rất xứng đáng để bỏ tiền học. Mong thầy sẽ tiếp tục phát huy.",
        ratePoint: 5,
        visible: true,
        createdAt: "2024-01-15T12:00:00Z",
        updatedAt: "2024-01-15T12:00:00Z",
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
        note: "Cô giáo dạy hay nhưng hơi nhanh, em chưa theo kịp. Cần điều chỉnh tốc độ giảng dạy.",
        ratePoint: 4,
        visible: true,
        createdAt: "2024-01-16T17:00:00Z",
        updatedAt: "2024-01-16T17:00:00Z",
      },
      {
        id: 3,
        booking: {
          id: 3,
          student: {
            firstName: "Hoàng",
            lastName: "Thị E",
            email: "hoangthie@email.com",
          },
          tutor: {
            firstName: "Vũ",
            lastName: "Văn F",
            email: "vuvanf@email.com",
          },
          subject: {
            name: "Vật lý",
          },
          date: "2024-01-17",
          fromTime: "19:00",
          toTime: "21:00",
        },
        note: "Thầy dạy không hay, không giải thích rõ ràng. Em không hiểu gì cả.",
        ratePoint: 2,
        visible: false,
        createdAt: "2024-01-17T22:00:00Z",
        updatedAt: "2024-01-17T22:00:00Z",
      },
    ];

    const mockStats: RatingStats = {
      totalRatings: 150,
      averageRating: 4.2,
      fiveStarCount: 80,
      fourStarCount: 45,
      threeStarCount: 15,
      twoStarCount: 7,
      oneStarCount: 3,
      visibleRatings: 140,
      hiddenRatings: 10,
    };

    setRatings(mockRatings);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const getStarColor = (rating: number) => {
    if (rating >= 4) return "text-green-500";
    if (rating >= 3) return "text-yellow-500";
    return "text-red-500";
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className={`ml-2 text-sm font-medium ${getStarColor(rating)}`}>
          {rating}/5
        </span>
      </div>
    );
  };

  const getVisibilityColor = (visible: boolean) => {
    return visible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getVisibilityText = (visible: boolean) => {
    return visible ? "Hiển thị" : "Ẩn";
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
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý Đánh giá
              </h1>
              <p className="text-sm text-gray-600">
                Quản lý và theo dõi tất cả các đánh giá của học viên
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
                    Tổng đánh giá
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalRatings}
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
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
                    Đánh giá trung bình
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <div className="mt-3">
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-1.5a2 2 0 01-2-2z"
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
                    Hiển thị
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.visibleRatings}
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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
                    Đã ẩn
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.hiddenRatings}
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Distribution Chart */}
        {stats && (
          <div
            className="p-4 rounded-xl shadow-md mb-4"
            style={{
              backgroundColor: "white",
              borderColor: "rgba(148, 204, 230, 0.2)",
              border: "1px solid",
            }}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Phân bố đánh giá
            </h3>
            <div className="space-y-3">
              {[
                { stars: 5, count: stats.fiveStarCount, color: "bg-green-500" },
                { stars: 4, count: stats.fourStarCount, color: "bg-blue-500" },
                {
                  stars: 3,
                  count: stats.threeStarCount,
                  color: "bg-yellow-500",
                },
                { stars: 2, count: stats.twoStarCount, color: "bg-orange-500" },
                { stars: 1, count: stats.oneStarCount, color: "bg-red-500" },
              ].map(({ stars, count, color }) => (
                <div key={stars} className="flex items-center">
                  <span className="text-sm text-gray-600 w-8">
                    {stars} sao:
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 mx-3">
                    <div
                      className={`h-1.5 rounded-full ${color}`}
                      style={{
                        width: `${(count / stats.totalRatings) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">({count})</span>
                </div>
              ))}
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
                  placeholder="Tìm kiếm theo tên, email, nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700 font-medium transition-colors duration-200 w-full sm:w-64"
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
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700 font-medium transition-colors duration-200"
                style={{
                  borderColor: "rgba(148, 204, 230, 0.3)",
                  focusRingColor: "rgb(148, 204, 230)",
                }}
              >
                <option value="">Tất cả đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>

              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700 font-medium transition-colors duration-200"
                style={{
                  borderColor: "rgba(148, 204, 230, 0.3)",
                  focusRingColor: "rgb(148, 204, 230)",
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Hiển thị</option>
                <option value="false">Ẩn</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                className="px-3 py-2 rounded-xl transition-colors duration-200 font-medium"
                style={{
                  backgroundColor: "rgba(148, 204, 230, 0.1)",
                  color: "rgb(148, 204, 230)",
                }}
              >
                Xuất Excel
              </button>
              <button
                className="px-3 py-2 text-white rounded-xl transition-colors duration-200 font-medium"
                style={{ backgroundColor: "rgb(148, 204, 230)" }}
              >
                Thống kê
              </button>
            </div>
          </div>
        </div>

        {/* Ratings Table */}
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
                    ID
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Học viên
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Gia sư
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Đánh giá
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ratings.map((rating) => (
                  <tr key={rating.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{rating.id}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {rating.booking.student.firstName}{" "}
                          {rating.booking.student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {rating.booking.student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {rating.booking.tutor.firstName}{" "}
                          {rating.booking.tutor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {rating.booking.tutor.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rating.booking.subject.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rating.booking.date} {rating.booking.fromTime}-
                        {rating.booking.toTime}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {renderStars(rating.ratePoint)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {rating.note}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getVisibilityColor(
                          rating.visible
                        )}`}
                      >
                        {getVisibilityText(rating.visible)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          style={{ color: "rgb(148, 204, 230)" }}
                        >
                          Xem
                        </button>
                        <button
                          className={`${
                            rating.visible
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {rating.visible ? "Ẩn" : "Hiện"}
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
        <div className="mt-3 flex justify-center">
          <nav
            className="flex items-center space-x-1 rounded-xl shadow-md p-1"
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

export default RatingManagement;
