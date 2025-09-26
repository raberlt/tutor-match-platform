import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TutorService } from "../../services/tutorService";
import type { TutorProfile } from "../../types";

const TutorDetail: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mapping teaching audiences sang tiếng Việt
  const getTeachingAudienceText = (audienceName: string) => {
    const mapping: { [key: string]: string } = {
      INDEPENDENT_LEARNER: "Tự học",
      MIDDLE_SCHOOL: "THCS",
      HIGH_SCHOOL: "THPT",
      VOCATIONAL_SCHOOL: "Trung cấp",
      COLLEGE_UNIVERSITY: "Đại học",
      POSTGRADUATE: "Sau đại học",
      WORKING_PROFESSIONAL: "Người đi làm",
    };
    return mapping[audienceName] || audienceName;
  };

  useEffect(() => {
    const loadTutorDetail = async () => {
      if (!username) return;

      try {
        setLoading(true);
        // Kiểm tra xem username có phải là số không (ID) hay là string (username)
        const isNumeric = /^\d+$/.test(username);

        let tutorData;
        if (isNumeric) {
          // Nếu là số, sử dụng getTutorById
          tutorData = await TutorService.getTutorById(parseInt(username));
        } else {
          // Nếu là string, sử dụng getTutorByUsername
          tutorData = await TutorService.getTutorByUsername(username);
        }

        console.log("Tutor detail data:", tutorData);
        console.log("Tutor subjects:", tutorData.subjects);
        console.log("Tutor fees:", tutorData.fees);
        console.log("Tutor subjectNames:", tutorData.subjectNames);

        // Xử lý dữ liệu - chuyển đổi subjectNames thành subjects format
        if (tutorData.subjectNames && Array.isArray(tutorData.subjectNames)) {
          tutorData.subjects = tutorData.subjectNames.map(
            (subjectName, idx) => ({
              id: idx + 1,
              name: subjectName,
              hourlyRate:
                tutorData.fees && tutorData.fees[subjectName]
                  ? tutorData.fees[subjectName]
                  : 200000,
            })
          );
        } else {
          // Nếu không có subjectNames, tạo subjects từ fees
          if (tutorData.fees && typeof tutorData.fees === "object") {
            // fees là object
            tutorData.subjects = Object.entries(tutorData.fees).map(
              ([subjectName, price], idx) => ({
                id: idx + 1,
                name: subjectName,
                hourlyRate: price,
              })
            );
          } else if (tutorData.fees && typeof tutorData.fees === "number") {
            // fees là số - tạo subjects với giá chung
            tutorData.subjects = [
              { id: 1, name: "Toán học", hourlyRate: tutorData.fees },
              { id: 2, name: "Vật lý", hourlyRate: tutorData.fees },
            ];
          } else {
            // Không có dữ liệu, dùng mock data
            tutorData.subjects = [
              { id: 1, name: "Toán học", hourlyRate: 200000 },
              { id: 2, name: "Vật lý", hourlyRate: 180000 },
            ];
          }
        }

        // Nếu vẫn không có subjects, thêm mock data
        if (!tutorData.subjects || tutorData.subjects.length === 0) {
          tutorData.subjects = [
            { id: 1, name: "Toán học", hourlyRate: 200000 },
            { id: 2, name: "Vật lý", hourlyRate: 180000 },
          ];
        }

        console.log("After processing - Tutor subjects:", tutorData.subjects);
        setTutor(tutorData);
      } catch (err) {
        setError("Không thể tải thông tin gia sư");
        console.error("Error loading tutor detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTutorDetail();
  }, [username]);

  const handleBookSession = () => {
    if (tutor) {
      navigate(`/user/create-booking?tutorId=${tutor.id}`);
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
          <p className="mt-4 text-gray-600">Đang tải thông tin gia sư...</p>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy gia sư
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Gia sư không tồn tại"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
              style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
            >
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  {tutor.imageAvatar ? (
                    <img
                      src={tutor.imageAvatar}
                      alt={`${tutor.firstName} ${tutor.lastName}`}
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                      style={{ borderColor: "rgb(148, 204, 230)" }}
                    />
                  ) : (
                    <div
                      className="w-32 h-32 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg"
                      style={{ backgroundColor: "rgb(148, 204, 230)" }}
                    >
                      {tutor.firstName?.charAt(0)}
                      {tutor.lastName?.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name and Verification */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {tutor.firstName} {tutor.lastName}
                  </h1>
                  {tutor.user?.isVerified && (
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
                  )}
                </div>

                {/* Headline */}
                {tutor.headline && (
                  <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                    {tutor.headline}
                  </p>
                )}

                {/* Action Button */}
                <button
                  onClick={handleBookSession}
                  className="w-full text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  Đặt lịch học thử
                </button>
              </div>
            </div>

            {/* Video Introduction */}
            {tutor.videoIntro && (
              <div
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Video giới thiệu
                </h3>
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  {tutor.videoIntro.includes("youtube.com") ||
                  tutor.videoIntro.includes("youtu.be") ? (
                    <iframe
                      src={(() => {
                        let videoId = "";
                        if (tutor.videoIntro.includes("youtube.com/watch?v=")) {
                          videoId =
                            tutor.videoIntro.split("v=")[1]?.split("&")[0] ||
                            "";
                        } else if (tutor.videoIntro.includes("youtu.be/")) {
                          videoId =
                            tutor.videoIntro
                              .split("youtu.be/")[1]
                              ?.split("?")[0] || "";
                        } else if (
                          tutor.videoIntro.includes("youtube.com/embed/")
                        ) {
                          videoId =
                            tutor.videoIntro
                              .split("embed/")[1]
                              ?.split("?")[0] || "";
                        }
                        return `https://www.youtube.com/embed/${videoId}`;
                      })()}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Video giới thiệu gia sư"
                    />
                  ) : (
                    <video
                      src={tutor.videoIntro}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                      title="Video giới thiệu gia sư"
                    >
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Video giới thiệu bản thân của gia sư
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2">
            {/* About Section */}
            {tutor.bio && (
              <div
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
                style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Giới thiệu
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {tutor.bio}
                </p>
              </div>
            )}

            {/* Experience Section - Moved to right column */}
            {tutor.experience && (
              <div
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
                style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Kinh nghiệm
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {tutor.experience}
                </p>
              </div>
            )}

            {/* Teaching Qualification */}
            <div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
              style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Đối tượng nhận dạy
              </h2>
              <div className="flex flex-wrap gap-2">
                {tutor.teachingAudiences &&
                tutor.teachingAudiences.length > 0 ? (
                  tutor.teachingAudiences.map((audience) => (
                    <span
                      key={audience.id}
                      className="px-4 py-2 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: "rgb(148, 204, 230)" }}
                    >
                      {getTeachingAudienceText(audience.name)}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    Chưa cập nhật thông tin
                  </p>
                )}
              </div>
            </div>

            {/* Subjects Taught */}
            <div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
              style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Môn dạy</h2>
              <div className="space-y-3">
                {tutor.subjects && tutor.subjects.length > 0 ? (
                  tutor.subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex justify-between items-center p-4 rounded-xl border border-gray-200"
                      style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {subject.name}
                        </h3>
                        {subject.description && (
                          <p className="text-sm text-gray-600">
                            {subject.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-blue-600">
                          {subject.hourlyRate
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(subject.hourlyRate)
                            : "Liên hệ"}
                        </div>
                        <div className="text-sm text-gray-500">/buổi học</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    Chưa cập nhật thông tin môn dạy
                  </p>
                )}
              </div>
            </div>

            {/* Teaching Schedule */}
            {tutor.schedules && tutor.schedules.length > 0 && (
              <div
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
                style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Lịch giảng dạy
                </h2>
                <div className="space-y-3">
                  {tutor.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                    >
                      <span className="font-medium text-gray-900">
                        {schedule.dayOfWeek}
                      </span>
                      <span className="text-gray-600">
                        {schedule.fromTime} - {schedule.toTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates and Education Combined */}
            <div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
              style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Chứng chỉ & Học vấn
              </h2>

              {/* Certificates Section */}
              {tutor.certificates && tutor.certificates.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Chứng chỉ
                  </h3>
                  <div className="space-y-4">
                    {tutor.certificates.map((certificate, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start p-4 rounded-xl"
                        style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {certificate.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            {certificate.issuedBy}
                          </p>
                          {certificate.description && (
                            <p className="text-sm text-gray-500">
                              {certificate.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-green-600 text-xs font-medium">
                              Đã xác minh
                            </span>
                          </div>
                          {certificate.year && (
                            <p className="text-xs text-gray-500">
                              {certificate.year}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Section */}
              {tutor.educations && tutor.educations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Học vấn
                  </h3>
                  <div className="space-y-4">
                    {tutor.educations.map((education, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start p-4 rounded-xl"
                        style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {education.schoolName}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            {education.degree}
                          </p>
                          <p className="text-sm text-gray-500">
                            {education.major}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-600 mb-2">
                            {education.fromTime} - {education.toTime}
                          </p>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-green-600 text-xs font-medium">
                              Đã xác minh
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No data message */}
              {(!tutor.certificates || tutor.certificates.length === 0) &&
                (!tutor.educations || tutor.educations.length === 0) && (
                  <p className="text-gray-500 italic text-center py-8">
                    Chưa cập nhật thông tin chứng chỉ và học vấn
                  </p>
                )}
            </div>

            {/* Student Reviews */}
            <div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Đánh giá từ Học viên
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Reviews List */}
                <div>
                  {/* Average Rating */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-6 h-6 ${
                            star <= (tutor.ratePointAverage || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      Đánh giá trung bình
                    </span>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                          style={{ backgroundColor: "rgb(148, 204, 230)" }}
                        >
                          T
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            T Trung Phan
                          </p>
                          <p className="text-sm text-gray-500">Apr 19, 2025</p>
                        </div>
                        <div className="flex items-center ml-auto">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className="w-4 h-4 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">
                        Thầy giáo dạy rất tốt, có tâm và trình độ rất xứng đáng
                        để bỏ tiền học. Mong thầy sẽ tiếp tục phát huy.
                      </p>
                    </div>
                  </div>

                  <button
                    className="mt-4 font-medium transition-colors duration-200"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    Xem tất cả
                  </button>
                </div>

                {/* Right: Rating Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Phân tích đánh giá
                  </h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-8">
                          {rating} sao:
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: "rgb(148, 204, 230)",
                              width: `${
                                rating === 5
                                  ? 100
                                  : rating === 4
                                  ? 0
                                  : rating === 3
                                  ? 0
                                  : rating === 2
                                  ? 0
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          ({rating === 5 ? 1 : 0})
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Navigation arrows for more reviews */}
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      className="p-2 transition-colors duration-200"
                      style={{ color: "rgb(148, 204, 230)" }}
                    >
                      <svg
                        className="w-5 h-5"
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
                    <button
                      className="p-2 transition-colors duration-200"
                      style={{ color: "rgb(148, 204, 230)" }}
                    >
                      <svg
                        className="w-5 h-5"
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
                  </div>
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
