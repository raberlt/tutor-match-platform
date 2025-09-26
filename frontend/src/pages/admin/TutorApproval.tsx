import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

interface TutorApplication {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  imageAvatar?: string;
  bio: string;
  headline: string;
  experience: string;
  cvFileUrl?: string;
  cvFileName?: string;
  videoIntro?: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt?: string;
  reviewedAt?: string;
  adminNote?: string;
  educations: Education[];
  certificates: Certificate[];
  subjectFees: SubjectFee[];
  schedules: Schedule[];
  teachingAudiences: TeachingAudience[];
}

interface TeachingAudience {
  id: number;
  name: string;
}

interface Education {
  id: string;
  schoolName: string;
  degree: string;
  major: string;
  fromTime: number;
  toTime: number;
  degreeFileName?: string;
  degreeFileUrl?: string;
}

interface Certificate {
  id: string;
  name: string;
  issuedBy: string;
  description: string;
  certFileName?: string;
  certFileUrl?: string;
  valid: boolean;
}

interface SubjectFee {
  subjectId: number;
  subjectName: string;
  fees: number;
}

interface Schedule {
  id: string;
  dayOfWeek: string;
  fromTime: string;
  toTime: string;
  enable: boolean;
}

export const TutorApproval: React.FC = () => {
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<TutorApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await adminService.getApplicationsForReview();
      console.log("API Response:", data);

      if (Array.isArray(data)) {
        setApplications(data);
      } else if (data && Array.isArray(data.applications)) {
        // Response với applications array
        setApplications(data.applications);
      } else if (data && Array.isArray(data.content)) {
        setApplications(data.content);
      } else if (data && Array.isArray(data.data)) {
        setApplications(data.data);
      } else {
        console.error("Unexpected API response format:", data);
        setApplications([]);
        setError("Định dạng dữ liệu không đúng");
      }
    } catch (err: unknown) {
      console.error("Error loading applications:", err);
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải danh sách hồ sơ"
      );
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(
    (app) => filterStatus === "all" || app.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "Đã gửi";
      case "UNDER_REVIEW":
        return "Đang xem xét";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Đã từ chối";
      case "DRAFT":
        return "Bản nháp";
      default:
        return status;
    }
  };

  const handleReview = (application: TutorApplication) => {
    setSelectedApplication(application);
    setAdminNote(application.adminNote || "");
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    try {
      await adminService.approveApplication(parseInt(selectedApplication.id));
      await loadApplications();
      setShowModal(false);
      setSelectedApplication(null);
      setAdminNote("");
    } catch (err: unknown) {
      console.error("Error approving application:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi duyệt hồ sơ");
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    try {
      await adminService.rejectApplication(
        parseInt(selectedApplication.id),
        adminNote
      );
      await loadApplications();
      setShowModal(false);
      setSelectedApplication(null);
      setAdminNote("");
    } catch (err: unknown) {
      console.error("Error rejecting application:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi từ chối hồ sơ");
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
        <h1 className="text-2xl font-bold text-gray-900">Duyệt hồ sơ gia sư</h1>
        <button
          onClick={loadApplications}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  applications.filter((app) => app.status === "SUBMITTED")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👀</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang xem xét</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  applications.filter((app) => app.status === "UNDER_REVIEW")
                    .length
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
                {applications.filter((app) => app.status === "APPROVED").length}
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
              <p className="text-sm font-medium text-gray-600">Đã từ chối</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter((app) => app.status === "REJECTED").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="SUBMITTED">Chờ duyệt</option>
              <option value="UNDER_REVIEW">Đang xem xét</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách hồ sơ ({filteredApplications.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ứng viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin cơ bản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {application.firstName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {application.firstName} {application.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{application.headline}</div>
                      <div className="text-gray-500 mt-1 line-clamp-2">
                        {application.bio}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {getStatusText(application.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString(
                          "vi-VN"
                        )
                      : "Chưa gửi"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReview(application)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Xem chi tiết
                      </button>
                      {application.status === "SUBMITTED" && (
                        <>
                          <button
                            onClick={() => handleReview(application)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReview(application)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-0 border-0 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-2xl rounded-lg bg-white">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Chi tiết hồ sơ gia sư</h3>
                  <p className="text-blue-100 mt-1">
                    {selectedApplication.firstName}{" "}
                    {selectedApplication.lastName}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <span className="sr-only">Đóng</span>
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Thông tin cá nhân
                    </h4>
                    <div className="space-y-4">
                      {/* Avatar */}
                      {selectedApplication.imageAvatar && (
                        <div className="flex justify-center mb-4">
                          <img
                            src={selectedApplication.imageAvatar}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                          />
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex">
                          <span className="w-24 text-gray-600 font-medium">
                            Họ tên:
                          </span>
                          <span className="text-gray-900">
                            {selectedApplication.firstName}{" "}
                            {selectedApplication.lastName}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-600 font-medium">
                            Email:
                          </span>
                          <span className="text-gray-900">
                            {selectedApplication.email}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-600 font-medium">
                            SĐT:
                          </span>
                          <span className="text-gray-900">
                            {selectedApplication.phoneNumber || "Chưa cập nhật"}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-600 font-medium">
                            Địa chỉ:
                          </span>
                          <span className="text-gray-900">
                            {selectedApplication.address || "Chưa cập nhật"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Thông tin chuyên môn
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-600 font-medium block mb-1">
                          Tiêu đề:
                        </span>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                          {selectedApplication.headline || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium block mb-1">
                          Giới thiệu bản thân:
                        </span>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                          {selectedApplication.bio || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium block mb-1">
                          Kinh nghiệm:
                        </span>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                          {selectedApplication.experience || "Chưa cập nhật"}
                        </p>
                      </div>
                      {selectedApplication.videoIntro && (
                        <div>
                          <span className="text-gray-600 font-medium block mb-1">
                            Video giới thiệu:
                          </span>
                          <a
                            href={selectedApplication.videoIntro}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {selectedApplication.videoIntro}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CV Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Hồ sơ CV
                    </h4>
                    <div className="space-y-3">
                      {selectedApplication.cvFileUrl ? (
                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-600 font-medium block mb-1">
                              Tên file:
                            </span>
                            <p className="text-gray-900">
                              {selectedApplication.cvFileName || "CV.pdf"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600 font-medium mr-2">
                              Link CV:
                            </span>
                            <a
                              href={selectedApplication.cvFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Xem CV
                            </a>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Chưa tải lên CV</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Education */}
                  {selectedApplication.educations &&
                  selectedApplication.educations.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Học vấn
                      </h4>
                      <div className="space-y-4">
                        {selectedApplication.educations.map((edu, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-blue-500 pl-4"
                          >
                            <h5 className="font-semibold text-gray-900">
                              {edu.schoolName}
                            </h5>
                            <p className="text-gray-700">{edu.degree}</p>
                            {edu.major && (
                              <p className="text-gray-600 text-sm">
                                Chuyên ngành: {edu.major}
                              </p>
                            )}
                            <p className="text-gray-500 text-sm">
                              {edu.fromTime} - {edu.toTime || "Hiện tại"}
                            </p>
                            {edu.degreeFileUrl && (
                              <a
                                href={edu.degreeFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                Xem bằng cấp
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Học vấn
                      </h4>
                      <p className="text-gray-500 italic">
                        Chưa cập nhật thông tin học vấn
                      </p>
                    </div>
                  )}

                  {/* Certificates */}
                  {selectedApplication.certificates &&
                  selectedApplication.certificates.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Chứng chỉ
                      </h4>
                      <div className="space-y-4">
                        {selectedApplication.certificates.map((cert, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-green-500 pl-4"
                          >
                            <h5 className="font-semibold text-gray-900">
                              {cert.name}
                            </h5>
                            <p className="text-gray-700">
                              Tổ chức cấp: {cert.issuedBy}
                            </p>
                            {cert.description && (
                              <p className="text-gray-600 text-sm">
                                {cert.description}
                              </p>
                            )}
                            {cert.certFileUrl && (
                              <a
                                href={cert.certFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                Xem chứng chỉ
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Chứng chỉ
                      </h4>
                      <p className="text-gray-500 italic">
                        Chưa cập nhật chứng chỉ
                      </p>
                    </div>
                  )}

                  {/* Subject Fees */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Môn học và học phí
                    </h4>
                    {selectedApplication.subjectFees &&
                    selectedApplication.subjectFees.length > 0 ? (
                      <div className="space-y-3">
                        {selectedApplication.subjectFees.map(
                          (subject, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                            >
                              <span className="font-medium text-gray-900">
                                {subject.subjectName || `Môn học ${index + 1}`}
                              </span>
                              <span className="text-green-600 font-semibold">
                                {subject.fees
                                  ? subject.fees.toLocaleString("vi-VN")
                                  : "0"}{" "}
                                VNĐ/buổi
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        Chưa cập nhật môn học
                      </p>
                    )}
                  </div>

                  {/* Teaching Audiences */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Đối tượng dạy
                    </h4>
                    {selectedApplication.teachingAudiences &&
                    selectedApplication.teachingAudiences.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.teachingAudiences.map(
                          (audience, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                            >
                              {audience.name}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        Chưa cập nhật đối tượng dạy
                      </p>
                    )}
                  </div>

                  {/* Schedules */}
                  {selectedApplication.schedules &&
                  selectedApplication.schedules.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Lịch dạy
                      </h4>
                      <div className="space-y-2">
                        {selectedApplication.schedules.map(
                          (schedule, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                            >
                              <span className="font-medium text-gray-900">
                                {schedule.dayOfWeek}
                              </span>
                              <span className="text-gray-600">
                                {schedule.fromTime} - {schedule.toTime}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Lịch dạy
                      </h4>
                      <p className="text-gray-500 italic">
                        Chưa cập nhật lịch dạy
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
              {/* Admin Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú của admin
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập ghi chú về hồ sơ này..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                {selectedApplication.status === "SUBMITTED" && (
                  <>
                    <button
                      onClick={handleReject}
                      className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Duyệt hồ sơ
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
