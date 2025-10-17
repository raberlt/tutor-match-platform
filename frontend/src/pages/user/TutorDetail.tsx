import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TutorService } from "../../services/tutorService";
import type { TutorProfile } from "../../types";
import type { TeachingAudience, TutorProfileSubject } from "../../types";

type SubjectSimple = { id: number; name: string; fees: number };

const TutorDetail: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );

  // Mapping teaching audiences sang tiếng Việt
  const getTeachingAudienceText = (audienceName: string) => {
    const mapping: { [key: string]: string } = {
      INDEPENDENT_LEARNER: "Tự học",
      MIDDLE_SCHOOL: "Trung học cơ sở",
      HIGH_SCHOOL: "Trung học phổ thông",
      VOCATIONAL_SCHOOL: "Trung cấp",
      COLLEGE_UNIVERSITY: "Đại học",
      POSTGRADUATE: "Sau đại học",
      WORKING_PROFESSIONAL: "Người đi làm",
    };
    return mapping[audienceName] || audienceName;
  };

  // Mapping ngày tháng sang tiếng Việt
  const getDayOfWeekText = (dayOfWeek: string) => {
    const mapping: { [key: string]: string } = {
      MONDAY: "Thứ hai",
      TUESDAY: "Thứ ba",
      WEDNESDAY: "Thứ tư",
      THURSDAY: "Thứ năm",
      FRIDAY: "Thứ sáu",
      SATURDAY: "Thứ bảy",
      SUNDAY: "Chủ nhật",
    };
    return mapping[dayOfWeek] || dayOfWeek;
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
        console.log("Tutor profileSubjects:", tutorData.profileSubjects);

        // Chuẩn hoá teachingAudiences về dạng [{id, name}] nếu API trả về dạng mảng string
        if (
          Array.isArray(tutorData.teachingAudiences) &&
          tutorData.teachingAudiences.length > 0
        ) {
          const first = tutorData.teachingAudiences[0];
          if (typeof first === "string") {
            tutorData.teachingAudiences = (
              tutorData.teachingAudiences as string[]
            ).map((name: string, idx: number) => ({
              id: idx + 1,
              name,
            })) as TeachingAudience[];
          }
        }

        // Sử dụng profileSubjects từ API trực tiếp
        if (
          tutorData.profileSubjects &&
          Array.isArray(tutorData.profileSubjects) &&
          tutorData.profileSubjects.length > 0
        ) {
          // Chuyển đổi profileSubjects thành subjects format với hourlyRate
          tutorData.subjects = (
            tutorData.profileSubjects as TutorProfileSubject[]
          ).map((subject: TutorProfileSubject) => ({
            id: subject.id,
            name: subject.name,
            fees: subject.fees,
          }));
          console.log("✅ Using profileSubjects from API:", tutorData.subjects);
        } else {
          // Fallback: nếu không có profileSubjects, thử tạo từ subjectNames
          if (tutorData.subjectNames && Array.isArray(tutorData.subjectNames)) {
            tutorData.subjects = tutorData.subjectNames.map(
              (subjectName: string, idx: number) => ({
                id: idx + 1,
                name: subjectName,
                fees:
                  tutorData.fees &&
                  (tutorData.fees as Record<string, number>)[subjectName]
                    ? (tutorData.fees as Record<string, number>)[subjectName]
                    : 200000,
              })
            );
            console.log("⚠️ Fallback: Using subjectNames:", tutorData.subjects);
          } else {
            // Không có dữ liệu, dùng mock data
            tutorData.subjects = [
              { id: 1, name: "Toán học", fees: 200000 },
              { id: 2, name: "Vật lý", fees: 180000 },
            ];
            console.log("❌ Using mock data:", tutorData.subjects);
          }
        }

        console.log("Final subjects:", tutorData.subjects);
        setTutor(tutorData);

        // Set mặc định môn đầu tiên được chọn
        if (tutorData.subjects && tutorData.subjects.length > 0) {
          setSelectedSubjectId(tutorData.subjects[0].id);
        }
      } catch (err) {
        setError("Không thể tải thông tin gia sư");
        console.error("Error loading tutor detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTutorDetail();
  }, [username]);

  const handleSingleBooking = () => {
    if (tutor) {
      navigate("/booking", {
        state: {
          selectedTutor: tutor,
        },
      });
    }
  };

  const handlePackageBooking = () => {
    if (tutor) {
      navigate("/booking", {
        state: {
          selectedTutor: tutor,
        },
      });
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

  const subjects: SubjectSimple[] | undefined = (
    tutor as unknown as { subjects?: SubjectSimple[] }
  )?.subjects;
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
              <div className="flex items-start space-x-6">
                {/* Left Column: Avatar and Booking Button */}
                <div className="flex-shrink-0">
                  {/* Avatar */}
                  <div className="relative mb-4">
                    {tutor.imageAvatar ? (
                      <img
                        src={tutor.imageAvatar}
                        alt={`${tutor.firstName} ${tutor.lastName}`}
                        className="w-32 h-32 rounded-2xl object-cover shadow-lg"
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

                  {/* Booking Button */}
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={handleSingleBooking}
                      className="w-32 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm hover:bg-green-700"
                    >
                      Học đơn
                    </button>
                    <button
                      onClick={handlePackageBooking}
                      className="w-32 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                      style={{ backgroundColor: "rgb(148, 204, 230)" }}
                    >
                      Đặt gói
                    </button>
                  </div>

                  {/* Headline */}
                  {tutor.headline && (
                    <div className="mt-4">
                      <div className="relative">
                        <p className="text-sm leading-relaxed text-center font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse">
                          "{tutor.headline}"
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-800/20 blur-sm -z-10 rounded-lg"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Tutor Info */}
                <div className="flex-1 min-w-0">
                  {/* Name and Verification */}
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-xl font-bold text-gray-900">
                      {tutor.firstName} {tutor.lastName}
                    </h1>
                    {tutor.user?.isVerified && (
                      <div className="flex items-center">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                          style={{
                            backgroundColor: "rgb(148, 204, 230)",
                          }}
                        >
                          <svg
                            className="w-3 h-3 text-white"
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
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {tutor.ratePointAverage?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({tutor.totalPoint || 0} đánh giá)
                    </span>
                  </div>

                  {/* Subjects and Fees */}
                  {subjects && subjects.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {subjects.map(
                          (subject: SubjectSimple, index: number) => (
                            <button
                              key={index}
                              onClick={() => {
                                console.log(
                                  "Clicked subject:",
                                  subject.name,
                                  "id:",
                                  subject.id,
                                  "fees:",
                                  subject.fees
                                );
                                setSelectedSubjectId(subject.id);
                              }}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                                selectedSubjectId === subject.id
                                  ? "text-white shadow-md"
                                  : "text-gray-700 hover:shadow-sm"
                              }`}
                              style={{
                                backgroundColor:
                                  selectedSubjectId === subject.id
                                    ? "rgb(148, 204, 230)"
                                    : "rgba(148, 204, 230, 0.1)",
                              }}
                            >
                              {subject.name}
                            </button>
                          )
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-blue-600">
                          {selectedSubjectId
                            ? (() => {
                                const selectedSubject = subjects.find(
                                  (s: SubjectSimple) =>
                                    s.id === selectedSubjectId
                                );
                                return selectedSubject
                                  ? new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(selectedSubject.fees)
                                  : "Liên hệ";
                              })()
                            : subjects.length > 0
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(subjects[0].fees)
                            : "Liên hệ"}
                        </span>
                        <span className="text-gray-500">/buổi học</span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                </div>
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
                {Array.isArray(tutor.teachingAudiences) &&
                tutor.teachingAudiences.length > 0 ? (
                  (
                    tutor.teachingAudiences as (TeachingAudience | string)[]
                  ).map((audience: TeachingAudience | string, idx: number) => {
                    const name =
                      typeof audience === "string" ? audience : audience.name;
                    const key =
                      typeof audience === "string" ? idx : audience.id;
                    return (
                      <span
                        key={key}
                        className="px-4 py-2 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      >
                        {getTeachingAudienceText(name)}
                      </span>
                    );
                  })
                ) : (
                  <p className="text-gray-500 italic">
                    Chưa cập nhật thông tin
                  </p>
                )}
              </div>
            </div>

            {/* Subjects Taught */}
            {/* <div
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
            </div> */}

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
                  {(() => {
                    // Gộp schedules theo dayOfWeek
                    const groupedSchedules = tutor.schedules.reduce(
                      (acc, schedule) => {
                        if (!acc[schedule.dayOfWeek]) {
                          acc[schedule.dayOfWeek] = [];
                        }
                        acc[schedule.dayOfWeek].push(schedule);
                        return acc;
                      },
                      {} as Record<string, typeof tutor.schedules>
                    );

                    return Object.entries(groupedSchedules).map(
                      ([dayOfWeek, schedules]) => (
                        <div
                          key={dayOfWeek}
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{
                            backgroundColor: "rgba(148, 204, 230, 0.1)",
                          }}
                        >
                          <span className="font-medium text-gray-900">
                            {getDayOfWeekText(dayOfWeek)}
                          </span>
                          <span className="text-gray-600">
                            {schedules
                              .map(
                                (schedule) =>
                                  `${schedule.fromTime} - ${schedule.toTime}`
                              )
                              .join(", ")}
                          </span>
                        </div>
                      )
                    );
                  })()}
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
                              className="w-4 h-4"
                              style={{ color: "rgb(96, 165, 250)" }}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span
                              className="text-xs font-medium"
                              style={{ color: "rgb(96, 165, 250)" }}
                            >
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
                              className="w-4 h-4"
                              style={{ color: "rgb(96, 165, 250)" }}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span
                              className="text-xs font-medium"
                              style={{ color: "rgb(96, 165, 250)" }}
                            >
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
                    style={{ color: "rgb(96, 165, 250)" }}
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
                      style={{ color: "rgb(96, 165, 250)" }}
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
                      style={{ color: "rgb(96, 165, 250)" }}
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
