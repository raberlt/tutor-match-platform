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
  const [selectedSubject, setSelectedSubject] = useState<{
    [tutorId: number]: number;
  }>({});

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
      // Sử dụng API public cho tất cả user (cả đã đăng nhập và chưa đăng nhập)
      // Nếu sortBy là "id" (mặc định), sử dụng random sort bằng cách thêm timestamp
      const actualSortBy = sortBy === "id" ? "id" : sortBy;
      const actualSortDirection = sortBy === "id" ? "desc" : sortDirection;
      const response = await TutorService.searchTutorPreviews(
        filters,
        currentPage + 1,
        pageSize,
        actualSortBy,
        actualSortDirection
      );

      let tutorsData = response.content as (
        | TutorPreviewProfile
        | TutorProfile
      )[];

      // Nếu sortBy là "id" (mặc định), shuffle dữ liệu để tạo random
      if (sortBy === "id") {
        tutorsData = tutorsData.sort(() => Math.random() - 0.5);
      }

      setTutors(tutorsData);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);

      // Auto-select first subject for each tutor
      const newSelectedSubjects: { [tutorId: number]: number } = {};
      tutorsData.forEach((tutor) => {
        if (
          "profileSubjects" in tutor &&
          tutor.profileSubjects &&
          tutor.profileSubjects.length > 0
        ) {
          newSelectedSubjects[tutor.id] = tutor.profileSubjects[0].subject.id;
        }
      });
      setSelectedSubject(newSelectedSubjects);
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
    // Tự động tìm kiếm khi filter thay đổi
    setTimeout(() => {
      searchTutors();
    }, 300); // Debounce 300ms để tránh gọi API quá nhiều
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

  const handleSubjectClick = (tutorId: number, subjectId: number) => {
    setSelectedSubject((prev) => ({
      ...prev,
      [tutorId]: subjectId,
    }));
  };

  const getSelectedSubjectPrice = (
    tutor: TutorPreviewProfile | TutorProfile
  ) => {
    const selectedId = selectedSubject[tutor.id];

    if ("profileSubjects" in tutor && tutor.profileSubjects) {
      // If a subject is selected, return its price
      if (selectedId) {
        const subject = tutor.profileSubjects.find(
          (ps) => ps.subject.id === selectedId
        );
        return subject ? subject.fees : null;
      }
      // If no subject selected, return price of first subject (default)
      return tutor.profileSubjects.length > 0
        ? tutor.profileSubjects[0].fees
        : null;
    }
    return null;
  };

  const renderStars = (rating?: number) => {
    if (!rating || rating === 0) return null;

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg
            key={i}
            className="w-4 h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg
            key={i}
            className="w-4 h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <defs>
              <linearGradient id="half-star">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half-star)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        );
      } else {
        stars.push(
          <svg
            key={i}
            className="w-4 h-4 text-gray-300 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }

    return <div className="flex items-center space-x-0.5">{stars}</div>;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex">
        {/* Left Sidebar - Filters */}
        <aside className="w-80 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Bộ lọc tìm kiếm
            </h2>

            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tên gia sư, kỹ năng..."
                  value={filters.keyword || ""}
                  onChange={(e) =>
                    handleFilterChange("keyword", e.target.value)
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Môn học
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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Tất cả môn học</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
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
                Sắp xếp
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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="id,asc">Mặc định</option>
                  <option value="fees,asc">Học phí: Thấp → Cao</option>
                  <option value="fees,desc">Học phí: Cao → Thấp</option>
                  <option value="ratePointAverage,desc">
                    Đánh giá cao nhất
                  </option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-300"
              >
                Xóa bộ lọc
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
              <div className="grid gap-6">
                {tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-6">
                        {/* Left Column: Avatar + Action Buttons */}
                        <div className="flex-shrink-0 flex flex-col items-center space-y-4">
                          {/* Avatar */}
                          <div>
                            {tutor.imageAvatar ? (
                              <img
                                src={tutor.imageAvatar}
                                alt={`${tutor.firstName} ${tutor.lastName}`}
                                className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
                              />
                            ) : (
                              <div
                                className="w-32 h-32 rounded-2xl flex items-center justify-center border-2 border-gray-100 shadow-sm"
                                style={{ backgroundColor: "#f0f8ff" }}
                              >
                                <span
                                  className="text-3xl font-bold"
                                  style={{ color: "#94cce6" }}
                                >
                                  {tutor.firstName?.charAt(0) || "T"}
                                  {tutor.lastName?.charAt(0) || "U"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons - Below Avatar */}
                          <div className="flex flex-col space-y-2 w-full">
                            <button
                              onClick={() => {
                                if (isAuthenticated) {
                                  // Sử dụng username nếu có, nếu không thì dùng ID
                                  const identifier =
                                    tutor.user?.username || tutor.id;
                                  navigate(`/tutor/${identifier}`);
                                } else {
                                  navigate("/login");
                                }
                              }}
                              className="w-full text-blue-600 px-4 py-2.5 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-semibold"
                            >
                              Xem chi tiết
                            </button>
                            <button
                              onClick={() => {
                                if (isAuthenticated) {
                                  handleBooking(tutor);
                                } else {
                                  navigate("/login");
                                }
                              }}
                              className="w-full text-white px-4 py-2.5 rounded-lg hover:opacity-90 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
                              style={{ backgroundColor: "#94cce6" }}
                            >
                              Đặt lịch học
                            </button>
                          </div>
                        </div>

                        {/* Right Column: Tutor Info */}
                        <div className="flex-1 min-w-0">
                          {/* Name with verification badge */}
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {tutor.firstName} {tutor.lastName}
                            </h3>
                            <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                              <svg
                                className="w-4 h-4 text-green-600 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-xs font-medium text-green-700">
                                Đã xác thực
                              </span>
                            </div>
                          </div>

                          {/* Subject Tags */}
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {"subjectNames" in tutor
                                ? tutor.subjectNames.map((subject, index) => (
                                    <button
                                      key={index}
                                      onClick={() =>
                                        handleSubjectClick(tutor.id, index)
                                      }
                                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                        selectedSubject[tutor.id] === index
                                          ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                                      }`}
                                    >
                                      {subject}
                                    </button>
                                  ))
                                : "profileSubjects" in tutor &&
                                  tutor.profileSubjects
                                ? tutor.profileSubjects.map(
                                    (profileSubject) => (
                                      <button
                                        key={profileSubject.id}
                                        onClick={() =>
                                          handleSubjectClick(
                                            tutor.id,
                                            profileSubject.subject.id
                                          )
                                        }
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                          selectedSubject[tutor.id] ===
                                          profileSubject.subject.id
                                            ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                                        }`}
                                      >
                                        {profileSubject.subject.name}
                                      </button>
                                    )
                                  )
                                : "subjects" in tutor &&
                                  tutor.subjects?.map((subject) => (
                                    <button
                                      key={subject.id}
                                      onClick={() =>
                                        handleSubjectClick(tutor.id, subject.id)
                                      }
                                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                        selectedSubject[tutor.id] === subject.id
                                          ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                                      }`}
                                    >
                                      {subject.name}
                                    </button>
                                  ))}
                            </div>
                          </div>

                          {/* Price Display */}
                          {getSelectedSubjectPrice(tutor) && (
                            <div className="mb-4">
                              <div className="inline-flex items-center space-x-2">
                                <span className="text-lg font-bold text-blue-600">
                                  {formatPrice(getSelectedSubjectPrice(tutor))}
                                </span>
                                <span className="text-sm text-gray-500">
                                  /buổi học
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Rating - chỉ hiện khi có đánh giá */}
                          {tutor.ratePointAverage &&
                            tutor.ratePointAverage > 0 && (
                              <div className="flex items-center space-x-2 mb-4">
                                {renderStars(tutor.ratePointAverage)}
                                <span className="text-sm font-medium text-gray-600">
                                  {tutor.ratePointAverage.toFixed(1)}/5.0
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({tutor.totalPoint || 0} đánh giá)
                                </span>
                              </div>
                            )}

                          {/* Headline - max 2 dòng */}
                          {"headline" in tutor && tutor.headline && (
                            <div className="mb-3">
                              <p className="text-gray-800 font-medium text-sm leading-relaxed line-clamp-2">
                                {tutor.headline}
                              </p>
                            </div>
                          )}

                          {/* Bio - max 2 dòng */}
                          {"bio" in tutor && tutor.bio && (
                            <div className="mb-4">
                              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                {tutor.bio}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-1 mt-12">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
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
                        className="px-4 py-2 rounded-lg border transition-all duration-200 font-medium"
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
                            e.currentTarget.style.borderColor = "#94cce6";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== pageNum) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.borderColor = "#d1d5db";
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
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
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
