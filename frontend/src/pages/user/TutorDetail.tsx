import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

interface TutorDetail {
  id: number;
  firstName: string;
  lastName: string;
  imageAvatar?: string;
  bio?: string;
  headline?: string;
  experience?: string;
  teachingLevel?: string;
  videoIntro?: string;
  cvUrl?: string;
  ratePointAverage?: number;
  totalRates?: number;
  subjects: Array<{
    id: number;
    name: string;
    fees: number;
  }>;
  schedules: Array<{
    id: number;
    dayOfWeek: string;
    fromTime: string;
    toTime: string;
    enable: boolean;
  }>;
  educations: Array<{
    id: number;
    schoolName: string;
    major: string;
    degree: string;
    fromTime: string;
    toTime: string;
    degreeImage?: string;
  }>;
  certificates: Array<{
    id: number;
    name: string;
    issuedBy: string;
    description?: string;
    certImage?: string;
  }>;
}

const TutorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authContext = React.useContext(AuthContext);
  const { isAuthenticated } = authContext || { isAuthenticated: false };
  const [tutor, setTutor] = useState<TutorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTutorDetail();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTutorDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tutors/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải thông tin gia sư");
      }

      const data = await response.json();
      setTutor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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
            className="w-5 h-5 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg
            key={i}
            className="w-5 h-5 text-yellow-400 fill-current"
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
            className="w-5 h-5 text-gray-300 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }

    return <div className="flex items-center space-x-0.5">{stars}</div>;
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // TODO: Implement booking logic
    console.log("Booking tutor:", tutor?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy gia sư
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/tutors")}
            className="text-white px-6 py-2 rounded-lg hover:opacity-90"
            style={{ backgroundColor: "#94cce6" }}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {tutor.imageAvatar ? (
                <img
                  src={tutor.imageAvatar}
                  alt={`${tutor.firstName} ${tutor.lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-gray-100"
                  style={{ backgroundColor: "#f0f8ff" }}
                >
                  <span
                    className="text-4xl font-bold"
                    style={{ color: "#94cce6" }}
                  >
                    {tutor.firstName?.charAt(0) || "T"}
                    {tutor.lastName?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {tutor.firstName} {tutor.lastName}
                </h1>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {tutor.headline && (
                <p className="text-xl text-blue-600 font-medium mb-4">
                  {tutor.headline}
                </p>
              )}

              {/* Rating */}
              {tutor.ratePointAverage && tutor.ratePointAverage > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  {renderStars(tutor.ratePointAverage)}
                  <span className="text-lg text-gray-600">
                    {tutor.ratePointAverage.toFixed(1)} ({tutor.totalRates} đánh
                    giá)
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleBooking}
                  className="text-white px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-200 text-lg font-medium shadow-md hover:shadow-lg"
                  style={{ backgroundColor: "#94cce6" }}
                >
                  {isAuthenticated ? "Đặt lịch học" : "Đăng nhập để đặt lịch"}
                </button>
                <button
                  onClick={() => navigate("/tutors")}
                  className="text-gray-600 px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 text-lg font-medium"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {tutor.bio && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Giới thiệu
                </h2>
                <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
              </div>
            )}

            {/* Experience */}
            {tutor.experience && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Kinh nghiệm
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {tutor.experience}
                </p>
              </div>
            )}

            {/* Education */}
            {tutor.educations && tutor.educations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Học vấn
                </h2>
                <div className="space-y-4">
                  {tutor.educations.map((edu) => (
                    <div
                      key={edu.id}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {edu.degree}
                      </h3>
                      <p className="text-gray-600">{edu.schoolName}</p>
                      <p className="text-gray-500 text-sm">{edu.major}</p>
                      <p className="text-gray-500 text-sm">
                        {edu.fromTime} - {edu.toTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {tutor.certificates && tutor.certificates.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chứng chỉ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutor.certificates.map((cert) => (
                    <div key={cert.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">
                        {cert.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{cert.issuedBy}</p>
                      {cert.description && (
                        <p className="text-gray-500 text-sm mt-2">
                          {cert.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subjects & Pricing */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Môn học & Học phí
              </h2>
              <div className="space-y-3">
                {tutor.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <span className="font-medium text-gray-700">
                      {subject.name}
                    </span>
                    <span className="font-bold text-blue-600">
                      {formatPrice(subject.fees)}/buổi
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            {tutor.schedules && tutor.schedules.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Lịch dạy
                </h2>
                <div className="space-y-2">
                  {tutor.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        schedule.enable ? "bg-green-50" : "bg-gray-50"
                      }`}
                    >
                      <span className="font-medium text-gray-700">
                        {schedule.dayOfWeek}
                      </span>
                      <span className="text-sm text-gray-600">
                        {schedule.fromTime} - {schedule.toTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Introduction */}
            {tutor.videoIntro && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Video giới thiệu
                </h2>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <a
                    href={tutor.videoIntro}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8 5v10l8-5-8-5z" />
                    </svg>
                    <span>Xem video</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDetail;
