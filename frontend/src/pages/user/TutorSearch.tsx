import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { TutorService } from "../../services/tutorService";
import type {
  TutorPreviewProfile,
  TutorProfile,
  TutorSearchFilters,
  Subject,
} from "../../types";

const TutorSearch: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [tutors, setTutors] = useState<(TutorPreviewProfile | TutorProfile)[]>(
    []
  );
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Filters
  const [filters, setFilters] = useState<TutorSearchFilters>({
    keyword: "",
    subjectId: undefined,
    minFee: 100000,
    maxFee: 500000,
    minRating: undefined,
    city: "",
  });

  // Sort
  const [sortBy, setSortBy] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  // UI State
  const [showPriceSlider, setShowPriceSlider] = useState(false);

  const loadSubjects = async () => {
    try {
      const subjectsData = await TutorService.getSubjects();
      setSubjects(subjectsData);
    } catch (error: unknown) {
      console.error("Error loading subjects:", error);
    }
  };

  const searchTutors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isAuthenticated) {
        response = await TutorService.searchTutors(
          filters,
          currentPage,
          pageSize,
          sortBy,
          sortDirection
        );
      } else {
        response = await TutorService.searchTutorPreviews(
          filters,
          currentPage,
          pageSize,
          sortBy,
          sortDirection
        );
      }

      setTutors(response.content as (TutorPreviewProfile | TutorProfile)[]);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize, sortBy, sortDirection, isAuthenticated]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    searchTutors();
  }, [searchTutors]);

  const handleFilterChange = (
    key: keyof TutorSearchFilters,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handleSearch = () => {
    setCurrentPage(0);
    searchTutors();
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      subjectId: undefined,
      minFee: 100000,
      maxFee: 500000,
      minRating: undefined,
      city: "",
    });
    setCurrentPage(0);
    searchTutors();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBooking = (tutor: TutorPreviewProfile | TutorProfile) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Redirect to create booking with tutor info
    const selectedSubject =
      "subjects" in tutor && tutor.subjects.length > 0
        ? tutor.subjects[0]
        : { id: 1, name: "Môn học" };

    navigate("/create-booking", {
      state: {
        selectedTutor: tutor,
        selectedSubject: selectedSubject,
      },
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-400">Chưa có đánh giá</span>;

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ☆
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ☆
          </span>
        );
      }
    }

    return <div className="flex items-center">{stars}</div>;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex">
        {/* Left Sidebar - Filters */}
        <aside className="w-80 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              🔍 Bộ lọc tìm kiếm
            </h2>

            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
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
                <input
                  type="text"
                  placeholder="Tên gia sư, kỹ năng..."
                  value={filters.keyword || ""}
                  onChange={(e) =>
                    handleFilterChange("keyword", e.target.value)
                  }
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📚 Môn học
              </label>
              <div className="relative">
                <select
                  value={filters.subjectId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "subjectId",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-3 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Tất cả môn học</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Học phí/buổi
              </label>

              {/* Price Range Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPriceSlider(!showPriceSlider)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                >
                  <span className="text-gray-700 font-medium">
                    {formatPrice(filters.minFee || 100000)} -{" "}
                    {formatPrice(filters.maxFee || 500000)}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      showPriceSlider ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Content */}
                {showPriceSlider && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <div className="space-y-4">
                      {/* Price Display */}
                      <div className="text-center">
                        <span className="text-lg font-semibold text-gray-700">
                          {formatPrice(filters.minFee || 100000)} -{" "}
                          {formatPrice(filters.maxFee || 500000)}
                        </span>
                      </div>

                      {/* Dual Range Slider */}
                      <div className="relative px-2">
                        {/* Track Background */}
                        <div className="dual-range-track">
                          {/* Progress Bar */}
                          <div
                            className="dual-range-progress"
                            style={{
                              left: `${
                                (((filters.minFee || 100000) - 100000) /
                                  (1000000 - 100000)) *
                                100
                              }%`,
                              width: `${
                                (((filters.maxFee || 500000) -
                                  (filters.minFee || 100000)) /
                                  (1000000 - 100000)) *
                                100
                              }%`,
                            }}
                          />
                        </div>

                        {/* Range Sliders */}
                        <div className="relative">
                          {/* Min Price Slider */}
                          <input
                            type="range"
                            min="100000"
                            max="1000000"
                            step="50000"
                            value={filters.minFee || 100000}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              const maxFee = filters.maxFee || 500000;
                              if (value < maxFee) {
                                handleFilterChange("minFee", value);
                              } else {
                                // If min would exceed max, adjust max too
                                handleFilterChange("minFee", value);
                                handleFilterChange("maxFee", value + 50000);
                              }
                            }}
                            className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider min-slider z-20"
                            style={{ background: "transparent" }}
                          />

                          {/* Max Price Slider */}
                          <input
                            type="range"
                            min="100000"
                            max="1000000"
                            step="50000"
                            value={filters.maxFee || 500000}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              const minFee = filters.minFee || 100000;
                              if (value > minFee) {
                                handleFilterChange("maxFee", value);
                              } else {
                                // If max would go below min, adjust min too
                                handleFilterChange("maxFee", value);
                                handleFilterChange(
                                  "minFee",
                                  Math.max(100000, value - 50000)
                                );
                              }
                            }}
                            className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider max-slider z-10"
                            style={{ background: "transparent" }}
                          />
                        </div>

                        {/* Range Labels */}
                        <div className="flex justify-between text-xs text-gray-500 mt-4">
                          <span>100K</span>
                          <span>300K</span>
                          <span>500K</span>
                          <span>750K</span>
                          <span>1M+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sort Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔄 Sắp xếp
              </label>
              <div className="relative">
                <select
                  value={`${sortBy},${sortDirection}`}
                  onChange={(e) => {
                    const [newSortBy, newSortDirection] =
                      e.target.value.split(",");
                    setSortBy(newSortBy);
                    setSortDirection(newSortDirection);
                  }}
                  className="w-full px-3 py-3 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="id,asc">Mặc định</option>
                  <option value="fees,asc">Học phí: Thấp → Cao</option>
                  <option value="fees,desc">Học phí: Cao → Thấp</option>
                  <option value="ratePointAverage,desc">
                    ⭐ Đánh giá cao nhất
                  </option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSearch}
                className="w-full text-white py-3 px-4 rounded-lg hover:opacity-80 transition-colors font-medium shadow-md"
                style={{ backgroundColor: "#94cce6" }}
              >
                🔍 Tìm kiếm gia sư
              </button>
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-300"
              >
                🗑️ Xóa bộ lọc
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {/* Search Results Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Danh sách gia sư
            </h1>
            <p className="text-gray-600">
              Tìm thấy {totalElements} gia sư phù hợp
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tìm kiếm...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Tutor List */}
          {!loading && !error && (
            <>
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {tutor.imageAvatar ? (
                          <img
                            src={tutor.imageAvatar}
                            alt={`${tutor.firstName} ${tutor.lastName}`}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#f0f8ff" }}
                          >
                            <span
                              className="text-xl font-medium"
                              style={{ color: "#94cce6" }}
                            >
                              {tutor.firstName.charAt(0)}
                              {tutor.lastName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tutor Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {tutor.firstName} {tutor.lastName}
                            </h3>

                            {tutor.headline && (
                              <p className="text-blue-600 text-sm font-medium mb-2">
                                {tutor.headline}
                              </p>
                            )}

                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center space-x-1">
                                {renderStars(tutor.ratePointAverage)}
                                <span className="text-sm text-gray-600 ml-1">
                                  ({tutor.ratePointAverage?.toFixed(1) || "0.0"}
                                  )
                                </span>
                              </div>
                              {tutor.city && (
                                <span className="text-sm text-gray-500">
                                  📍 {tutor.city}
                                </span>
                              )}
                            </div>

                            {/* Subjects */}
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {"subjectNames" in tutor
                                  ? tutor.subjectNames.map((subject, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                                        style={{ backgroundColor: "#94cce6" }}
                                      >
                                        {subject}
                                      </span>
                                    ))
                                  : "subjects" in tutor &&
                                    tutor.subjects.map((subject) => (
                                      <span
                                        key={subject.id}
                                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                                        style={{ backgroundColor: "#94cce6" }}
                                      >
                                        {subject.name}
                                      </span>
                                    ))}
                              </div>
                            </div>

                            {/* Bio/Experience (for authenticated users) */}
                            {"bio" in tutor && tutor.bio && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {tutor.bio}
                              </p>
                            )}
                          </div>

                          {/* Price and Action */}
                          <div className="flex flex-col items-end space-y-2">
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">
                                {formatPrice(tutor.fees)}/buổi
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/tutor/${tutor.id}`)}
                                className="text-sm font-medium px-3 py-2 border rounded-lg hover:opacity-80"
                                style={{
                                  color: "#94cce6",
                                  borderColor: "#94cce6",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#f0f8ff";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }}
                              >
                                Xem chi tiết
                              </button>
                              <button
                                onClick={() => handleBooking(tutor)}
                                className="text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors text-sm font-medium"
                                style={{ backgroundColor: "#94cce6" }}
                              >
                                {isAuthenticated ? "Đặt lịch" : "Đăng nhập"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ««
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage <= 2) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className="px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor:
                            currentPage === pageNum ? "#94cce6" : "transparent",
                          color: currentPage === pageNum ? "white" : "#374151",
                          borderColor:
                            currentPage === pageNum ? "#94cce6" : "#d1d5db",
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== pageNum) {
                            e.currentTarget.style.backgroundColor = "#f0f8ff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== pageNum) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }
                        }}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    »»
                  </button>
                </div>
              )}

              {/* No Results */}
              {tutors.length === 0 && !loading && (
                <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy gia sư phù hợp
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm khác
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-white px-6 py-2 rounded-lg hover:opacity-80"
                    style={{ backgroundColor: "#94cce6" }}
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default TutorSearch;
