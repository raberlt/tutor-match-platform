import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { tutorService } from "../../services/tutorService";
import type { TutorProfile } from "../../types";

const TutorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTutorDetail(parseInt(id));
    }
  }, [id]);

  const loadTutorDetail = async (tutorId: number) => {
    try {
      setLoading(true);
      const tutorData = await tutorService.getTutorDetail(tutorId);
      setTutor(tutorData);
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (subjectId?: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!tutor) return;

    const selectedSubject = subjectId
      ? tutor.subjects.find((s) => s.id === subjectId)
      : tutor.subjects[0];

    navigate("/create-booking", {
      state: {
        selectedTutor: tutor,
        selectedSubject: selectedSubject,
      },
    });
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

  const formatPrice = (price?: number) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getDayOfWeekText = (day: string) => {
    const days: Record<string, string> = {
      MONDAY: "Thứ 2",
      TUESDAY: "Thứ 3",
      WEDNESDAY: "Thứ 4",
      THURSDAY: "Thứ 5",
      FRIDAY: "Thứ 6",
      SATURDAY: "Thứ 7",
      SUNDAY: "Chủ nhật",
    };
    return days[day] || day;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin gia sư...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Lỗi</h3>
              <p className="mt-1 text-sm text-gray-500">
                {error || "Không tìm thấy thông tin gia sư"}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/find-tutor")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Quay lại tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/find-tutor")}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            ← Quay lại tìm kiếm
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              {/* Header */}
              <div className="flex items-start space-x-6 mb-6">
                {tutor.imageAvatar ? (
                  <img
                    src={tutor.imageAvatar}
                    alt={`${tutor.firstName} ${tutor.lastName}`}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl text-blue-600 font-medium">
                      {tutor.firstName.charAt(0)}
                      {tutor.lastName.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {tutor.firstName} {tutor.lastName}
                  </h1>

                  {tutor.headline && (
                    <p className="text-xl text-blue-600 mb-3">
                      {tutor.headline}
                    </p>
                  )}

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(tutor.ratePointAverage)}
                      <span className="text-sm text-gray-600 ml-1">
                        {tutor.ratePointAverage?.toFixed(1) || "0.0"} / 5.0
                      </span>
                    </div>
                    {tutor.city && (
                      <span className="text-sm text-gray-500">
                        📍 {tutor.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {tutor.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Giới thiệu
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
                </div>
              )}

              {/* Experience */}
              {tutor.experience && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Kinh nghiệm
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {tutor.experience}
                  </p>
                </div>
              )}

              {/* Teaching Level */}
              {tutor.teachingLevel && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Trình độ giảng dạy
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {tutor.teachingLevel}
                  </p>
                </div>
              )}

              {/* Subjects */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Môn học giảng dạy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutor.subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {subject.name}
                        </h4>
                        <button
                          onClick={() => handleBooking(subject.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Đặt lịch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              {tutor.schedules && tutor.schedules.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Lịch rảnh
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tutor.schedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {getDayOfWeekText(schedule.dayOfWeek)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {schedule.fromTime} - {schedule.toTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(tutor.fees)}
                </div>
                <p className="text-gray-600">per buổi học</p>
              </div>

              <div className="space-y-4 mb-6">
                <button
                  onClick={() => handleBooking()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {isAuthenticated ? "Đặt lịch học" : "Đăng nhập để đặt lịch"}
                </button>

                <button
                  onClick={() => navigate("/messages")}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Nhắn tin
                </button>
              </div>

              {/* Quick Stats */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Thông tin nhanh
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đánh giá:</span>
                    <span className="font-medium">
                      {tutor.ratePointAverage?.toFixed(1) || "0.0"}/5.0
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng điểm:</span>
                    <span className="font-medium">{tutor.totalPoint || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Môn học:</span>
                    <span className="font-medium">{tutor.subjects.length}</span>
                  </div>
                  {tutor.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thành phố:</span>
                      <span className="font-medium">{tutor.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDetail;
