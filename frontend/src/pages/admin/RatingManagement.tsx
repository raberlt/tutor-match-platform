import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

interface Rating {
  id: number;
  bookingId: number;
  note: string;
  ratePoint: number;
  visible: boolean;
  createdAt: string;
  booking: {
    student: {
      firstName: string;
      lastName: string;
    };
    tutor: {
      firstName: string;
      lastName: string;
    };
    subject: {
      name: string;
    };
    date: string;
    fromTime: string;
    toTime: string;
  };
}

export const RatingManagement: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    ratePoint: "",
    visible: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchRatings();
  }, [filter]);

  const fetchRatings = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.ratePoint) params.append("ratePoint", filter.ratePoint);
      if (filter.visible) params.append("visible", filter.visible);
      if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
      if (filter.dateTo) params.append("dateTo", filter.dateTo);

      const response = await api.get(`/admin/ratings?${params.toString()}`);
      setRatings(response.data);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (id: number, currentVisible: boolean) => {
    try {
      await api.put(`/admin/ratings/${id}/visibility`, { visible: !currentVisible });
      fetchRatings();
    } catch (error) {
      console.error("Error updating rating visibility:", error);
    }
  };

  const handleDeleteRating = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        await api.delete(`/admin/ratings/${id}`);
        fetchRatings();
      } catch (error) {
        console.error("Error deleting rating:", error);
      }
    }
  };

  const getRatingColor = (point: number) => {
    if (point >= 4) return "text-green-600";
    if (point >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const renderStars = (point: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < point ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Điểm đánh giá
            </label>
            <select
              value={filter.ratePoint}
              onChange={(e) => setFilter({ ...filter, ratePoint: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái hiển thị
            </label>
            <select
              value={filter.visible}
              onChange={(e) => setFilter({ ...filter, visible: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Hiển thị</option>
              <option value="false">Ẩn</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={filter.dateFrom}
              onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={filter.dateTo}
              onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {ratings.length}
          </div>
          <div className="text-sm text-gray-600">Tổng đánh giá</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {ratings.filter(r => r.ratePoint >= 4).length}
          </div>
          <div className="text-sm text-gray-600">Đánh giá tích cực (4-5 sao)</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {ratings.filter(r => r.ratePoint === 3).length}
          </div>
          <div className="text-sm text-gray-600">Đánh giá trung bình (3 sao)</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {ratings.filter(r => r.ratePoint <= 2).length}
          </div>
          <div className="text-sm text-gray-600">Đánh giá tiêu cực (1-2 sao)</div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học sinh - Gia sư
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ratings.map((rating) => (
                <tr key={rating.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{rating.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rating.booking.student.firstName} {rating.booking.student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      đánh giá {rating.booking.tutor.firstName} {rating.booking.tutor.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {rating.booking.subject.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(rating.booking.date).toLocaleDateString()} - {rating.booking.fromTime} đến {rating.booking.toTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {renderStars(rating.ratePoint)}
                    </div>
                    <div className={`text-sm font-medium ${getRatingColor(rating.ratePoint)}`}>
                      {rating.ratePoint}/5
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {rating.note || "Không có nhận xét"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rating.visible 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {rating.visible ? "Hiển thị" : "Ẩn"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleToggleVisibility(rating.id, rating.visible)}
                      className={`${
                        rating.visible 
                          ? "text-red-600 hover:text-red-900" 
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {rating.visible ? "Ẩn" : "Hiện"}
                    </button>
                    <button
                      onClick={() => handleDeleteRating(rating.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {ratings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có đánh giá nào</p>
        </div>
      )}
    </div>
  );
};
