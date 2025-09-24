import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

interface TutorApplication {
  id: string;
  userId?: number;
  firstName?: string;
  lastName?: string;
  tutorName?: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  imageAvatar?: string;

  // Application info
  applicationType?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUBMITTED";
  bio?: string;
  headline?: string;
  experience?: string;
  educationLevel?: string;
  teachingLevel?: string;
  teachingMethods?: string[];
  cvUrl?: string;
  videoIntro?: string;
  timezone?: string;

  // Timestamps
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;

  // Related data
  educations?: Array<{
    school: string;
    degree: string;
    fromYear: string;
    toYear: string;
  }>;
  certificates?: Array<{
    name: string;
    issuer: string;
    issuedDate: string;
    url?: string;
  }>;
  schedules?: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    note?: string;
  }>;
  subjectFees?: Array<{
    subjectName: string;
    fee: number;
    note?: string;
  }>;
}

export const TutorApproval: React.FC = () => {
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug log applications state
  console.log("Current applications state:", applications);

  const [selectedApplication, setSelectedApplication] =
    useState<TutorApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await adminService.getApplicationsForReview();
      console.log("API Response:", data);
      console.log("Applications array:", data.applications);
      console.log("First application:", data.applications?.[0]);

      // Xử lý response có thể là array hoặc paginated object
      if (Array.isArray(data)) {
        setApplications(data);
      } else if (data && Array.isArray(data.content)) {
        // Paginated response
        setApplications(data.content);
      } else if (data && Array.isArray(data.data)) {
        // Wrapped response
        setApplications(data.data);
      } else if (data && data.success) {
        // Success response - check for any array field
        if (Array.isArray(data.applications)) {
          console.log(
            "Setting applications from data.applications:",
            data.applications
          );
          setApplications(data.applications);
        } else if (Array.isArray(data.content)) {
          console.log("Setting applications from data.content:", data.content);
          setApplications(data.content);
        } else if (Array.isArray(data.data)) {
          console.log("Setting applications from data.data:", data.data);
          setApplications(data.data);
        } else {
          console.error("Success response but no array found:", data);
          setApplications([]);
          setError("Không tìm thấy dữ liệu trong response");
        }
      } else {
        console.error("Unexpected API response format:", data);
        setApplications([]);
        setError("Định dạng dữ liệu không đúng");
      }
    } catch (err: unknown) {
      console.error("Error loading applications:", err);
      setError((err as Error).message || "Lỗi khi tải danh sách đơn đăng ký");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = Array.isArray(applications)
    ? applications.filter((app) => {
        if (filterStatus === "all") return true;
        if (filterStatus === "PENDING") {
          // "Chờ duyệt" bao gồm cả PENDING và SUBMITTED
          return app.status === "PENDING" || app.status === "SUBMITTED";
        }
        return app.status === filterStatus;
      })
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (application: TutorApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveApplication(parseInt(id));
      await loadApplications(); // Reload data
    } catch (err: unknown) {
      setError((err as Error).message || "Lỗi khi phê duyệt đơn");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminService.rejectApplication(parseInt(id), "Từ chối bởi admin");
      await loadApplications(); // Reload data
    } catch (err: unknown) {
      setError((err as Error).message || "Lỗi khi từ chối đơn");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Lỗi: {error}</div>
          <button
            onClick={loadApplications}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Duyệt đăng ký gia sư
        </h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  applications.filter(
                    (a) => a.status === "PENDING" || a.status === "SUBMITTED"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter((a) => a.status === "APPROVED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Từ chối</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter((a) => a.status === "REJECTED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đơn</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Lọc theo trạng thái:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Đơn đăng ký ({filteredApplications.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredApplications.map((application) => (
            <div key={application.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {application.tutorName?.charAt(0) ||
                          application.firstName?.charAt(0) ||
                          "?"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {application.tutorName ||
                        `${application.firstName || "N/A"} ${
                          application.lastName || "N/A"
                        }`}
                    </h3>
                    <p className="text-sm text-gray-500">{application.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-600">
                        📚{" "}
                        {application.subjectFees
                          ?.map((s) => s.subjectName)
                          .join(", ") || "Chưa có môn học"}
                      </span>
                      <span className="text-sm text-gray-600">
                        🎓{" "}
                        {application.educationLevel ||
                          "Chưa có thông tin học vấn"}
                      </span>
                      <span className="text-sm text-gray-600">
                        ⏱️ {application.experience || "Chưa có kinh nghiệm"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status === "PENDING" ||
                    application.status === "SUBMITTED"
                      ? "Chờ duyệt"
                      : application.status === "APPROVED"
                      ? "Đã duyệt"
                      : "Từ chối"}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(application)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Xem chi tiết
                    </button>
                    {application.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApprove(application.id)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          Phê duyệt
                        </button>
                        <button
                          onClick={() => handleReject(application.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Nộp đơn: {application.submittedAt}
                {application.reviewedAt && (
                  <span className="ml-4">
                    Duyệt: {application.reviewedAt} bởi {application.reviewedBy}
                  </span>
                )}
              </div>
              {application.notes && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Ghi chú:</strong> {application.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for application details */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết đơn đăng ký - {selectedApplication.firstName}{" "}
                  {selectedApplication.lastName}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Thông tin cơ bản
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Họ tên
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.firstName}{" "}
                        {selectedApplication.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Số điện thoại
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.phone || "Chưa cung cấp"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Địa chỉ
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.address || "Chưa cung cấp"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ngày sinh
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.dateOfBirth || "Chưa cung cấp"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Giới tính
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.gender || "Chưa cung cấp"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teaching Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Thông tin giảng dạy
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tiêu đề
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.headline || "Chưa cung cấp"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Giới thiệu bản thân
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.bio || "Chưa cung cấp"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kinh nghiệm
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.experience || "Chưa cung cấp"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Trình độ học vấn
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.educationLevel || "Chưa cung cấp"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cấp độ giảng dạy
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.teachingLevel || "Chưa cung cấp"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phương pháp giảng dạy
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {Array.isArray(selectedApplication.teachingMethods)
                          ? selectedApplication.teachingMethods.join(", ")
                          : selectedApplication.teachingMethods ||
                            "Chưa cung cấp"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Files and Media */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Tài liệu và Media
                  </h4>
                  <div className="space-y-4">
                    {selectedApplication.cvUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          CV
                        </label>
                        <a
                          href={selectedApplication.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Xem CV
                        </a>
                      </div>
                    )}
                    {selectedApplication.videoIntro && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Video giới thiệu
                        </label>
                        <a
                          href={selectedApplication.videoIntro}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Xem video
                        </a>
                      </div>
                    )}
                    {selectedApplication.imageAvatar && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ảnh đại diện
                        </label>
                        <img
                          src={selectedApplication.imageAvatar}
                          alt="Avatar"
                          className="mt-1 w-20 h-20 rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Education History */}
                {selectedApplication.educations &&
                  selectedApplication.educations.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Quá trình học tập
                      </h4>
                      <div className="space-y-3">
                        {selectedApplication.educations.map(
                          (edu, index: number) => (
                            <div
                              key={index}
                              className="border-l-4 border-yellow-400 pl-4"
                            >
                              <p className="font-medium">{edu.school}</p>
                              <p className="text-sm text-gray-600">
                                {edu.degree}
                              </p>
                              <p className="text-sm text-gray-500">
                                {edu.fromYear} - {edu.toYear}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Certificates */}
                {selectedApplication.certificates &&
                  selectedApplication.certificates.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Chứng chỉ
                      </h4>
                      <div className="space-y-3">
                        {selectedApplication.certificates.map(
                          (cert, index: number) => (
                            <div
                              key={index}
                              className="border-l-4 border-purple-400 pl-4"
                            >
                              <p className="font-medium">{cert.name}</p>
                              <p className="text-sm text-gray-600">
                                {cert.issuer}
                              </p>
                              <p className="text-sm text-gray-500">
                                {cert.issuedDate}
                              </p>
                              {cert.url && (
                                <a
                                  href={cert.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                  Xem chứng chỉ
                                </a>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Subject Fees */}
                {selectedApplication.subjectFees &&
                  selectedApplication.subjectFees.length > 0 && (
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Môn học và học phí
                      </h4>
                      <div className="space-y-3">
                        {selectedApplication.subjectFees.map(
                          (subject, index: number) => (
                            <div
                              key={index}
                              className="border-l-4 border-indigo-400 pl-4"
                            >
                              <p className="font-medium">
                                {subject.subjectName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Học phí: {subject.fee} VNĐ/buổi
                              </p>
                              <p className="text-sm text-gray-500">
                                {subject.note}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Schedules */}
                {selectedApplication.schedules &&
                  selectedApplication.schedules.length > 0 && (
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Lịch dạy
                      </h4>
                      <div className="space-y-3">
                        {selectedApplication.schedules.map(
                          (schedule, index: number) => (
                            <div
                              key={index}
                              className="border-l-4 border-pink-400 pl-4"
                            >
                              <p className="font-medium">
                                {schedule.dayOfWeek}
                              </p>
                              <p className="text-sm text-gray-600">
                                {schedule.startTime} - {schedule.endTime}
                              </p>
                              <p className="text-sm text-gray-500">
                                {schedule.note}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tài liệu đính kèm
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">📄 CV:</span>
                      <a
                        href={selectedApplication.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Xem CV
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        🖼️ Ảnh đại diện:
                      </span>
                      <a
                        href={selectedApplication.imageAvatar}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Xem ảnh
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        🏆 Chứng chỉ:
                      </span>
                      {selectedApplication.certificates?.map((cert, index) => (
                        <a
                          key={index}
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm mr-2"
                        >
                          {cert.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Đóng
                </button>
                {(selectedApplication.status === "PENDING" ||
                  selectedApplication.status === "SUBMITTED") && (
                  <>
                    <button
                      onClick={() => {
                        handleReject(selectedApplication.id);
                        setShowModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedApplication.id);
                        setShowModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Phê duyệt
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
