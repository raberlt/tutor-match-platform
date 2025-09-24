import React, { useState, useEffect, useCallback } from "react";
import { adminService } from "../../services/adminService";

interface Review {
  id: number;
  studentName: string;
  tutorName: string;
  subject: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  response?: string;
  responseDate?: string;
}

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form state for responding to reviews
  const [responseText, setResponseText] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getReviews(
        currentPage,
        10,
        "createdAt",
        "desc",
        ratingFilter,
        statusFilter,
        searchTerm
      );

      if (response.reviews) {
        setReviews(response.reviews || []);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setReviews(response);
        setTotalPages(1);
      } else {
        setReviews([]);
        setTotalPages(0);
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Lỗi khi tải dữ liệu đánh giá"
      );
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, ratingFilter, statusFilter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleToggleVerification = async (reviewId: number) => {
    try {
      await adminService.toggleReviewVerification(reviewId);
      loadReviews();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Lỗi khi thay đổi trạng thái xác minh"
      );
    }
  };

  const handleTogglePublic = async (reviewId: number) => {
    try {
      await adminService.toggleReviewVisibility(reviewId);
      loadReviews();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Lỗi khi thay đổi trạng thái công khai"
      );
    }
  };

  const handleAddResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    try {
      await adminService.addReviewResponse(selectedReview.id, {
        response: responseText,
      });
      setShowResponseModal(false);
      setSelectedReview(null);
      setResponseText("");
      loadReviews();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Lỗi khi thêm phản hồi"
      );
    }
  };

  const openResponseModal = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response || "");
    setShowResponseModal(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 5:
        return "Rất tốt";
      case 4:
        return "Tốt";
      case 3:
        return "Trung bình";
      case 2:
        return "Kém";
      case 1:
        return "Rất kém";
      default:
        return "Không đánh giá";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
        <p className="text-gray-600">
          Quản lý các đánh giá của học sinh về gia sư
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Tìm kiếm đánh giá..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="verified">Đã xác minh</option>
            <option value="unverified">Chưa xác minh</option>
            <option value="public">Công khai</option>
            <option value="private">Riêng tư</option>
          </select>
        </div>
      </div>

      {/* Reviews table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bình luận
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phản hồi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {review.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.tutorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span
                          className={`ml-2 text-sm font-medium ${getRatingColor(
                            review.rating
                          )}`}
                        >
                          {review.rating}/5
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getRatingText(review.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={review.comment}>
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {review.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.isPublic
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {review.isPublic ? "Công khai" : "Riêng tư"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      {review.response ? (
                        <div>
                          <div className="truncate" title={review.response}>
                            {review.response}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {review.responseDate}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Chưa có phản hồi</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => openResponseModal(review)}
                          className="text-blue-600 hover:text-blue-900 text-xs"
                        >
                          {review.response ? "Sửa phản hồi" : "Thêm phản hồi"}
                        </button>
                        <button
                          onClick={() => handleToggleVerification(review.id)}
                          className={`text-xs ${
                            review.isVerified
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {review.isVerified ? "Bỏ xác minh" : "Xác minh"}
                        </button>
                        <button
                          onClick={() => handleTogglePublic(review.id)}
                          className={`text-xs ${
                            review.isPublic
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-blue-600 hover:text-blue-900"
                          }`}
                        >
                          {review.isPublic ? "Ẩn" : "Hiện"}
                        </button>
                        <button className="text-red-600 hover:text-red-900 text-xs">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Không có đánh giá nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đầu
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
            <button
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cuối
            </button>
          </nav>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Phản hồi đánh giá từ {selectedReview.studentName}
              </h3>

              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {renderStars(selectedReview.rating)}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${getRatingColor(
                      selectedReview.rating
                    )}`}
                  >
                    {selectedReview.rating}/5 -{" "}
                    {getRatingText(selectedReview.rating)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {selectedReview.comment}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phản hồi của gia sư
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                  placeholder="Nhập phản hồi cho đánh giá này..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedReview(null);
                    setResponseText("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddResponse}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {selectedReview.response
                    ? "Cập nhật phản hồi"
                    : "Thêm phản hồi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
