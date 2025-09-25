import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

interface TutorApplication {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
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
  teachingAudiences: string[];
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Xem xét hồ sơ: {selectedApplication.firstName}{" "}
                  {selectedApplication.lastName}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Đóng</span>
                  <svg
                    className="h-6 w-6"
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

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Thông tin cơ bản
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>
                      <strong>Email:</strong> {selectedApplication.email}
                    </p>
                    <p>
                      <strong>Tiêu đề:</strong> {selectedApplication.headline}
                    </p>
                    <p>
                      <strong>Giới thiệu:</strong> {selectedApplication.bio}
                    </p>
                    <p>
                      <strong>Kinh nghiệm:</strong>{" "}
                      {selectedApplication.experience}
                    </p>
                    {selectedApplication.videoIntro && (
                      <p>
                        <strong>Video giới thiệu:</strong>{" "}
                        {selectedApplication.videoIntro}
                      </p>
                    )}
                  </div>
                </div>

                {/* Education */}
                {selectedApplication.educations &&
                  selectedApplication.educations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Học vấn
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {selectedApplication.educations.map((edu, index) => (
                          <div key={index} className="mb-2">
                            <p>
                              <strong>{edu.schoolName}</strong> - {edu.degree}
                            </p>
                            <p className="text-sm text-gray-600">
                              {edu.major} ({edu.fromTime} - {edu.toTime})
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Certificates */}
                {selectedApplication.certificates &&
                  selectedApplication.certificates.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Chứng chỉ
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {selectedApplication.certificates.map((cert, index) => (
                          <div key={index} className="mb-2">
                            <p>
                              <strong>{cert.name}</strong> - {cert.issuedBy}
                            </p>
                            <p className="text-sm text-gray-600">
                              {cert.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Subject Fees */}
                {selectedApplication.subjectFees &&
                  selectedApplication.subjectFees.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Môn học và học phí
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {selectedApplication.subjectFees.map(
                          (subject, index) => (
                            <div key={index} className="mb-2">
                              <p>
                                <strong>{subject.subjectName}</strong>:{" "}
                                {subject.fees.toLocaleString("vi-VN")} VNĐ/buổi
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Teaching Audiences */}
                {selectedApplication.teachingAudiences &&
                  selectedApplication.teachingAudiences.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Đối tượng dạy
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.teachingAudiences.map(
                            (audience, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {audience}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Admin Note */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú của admin
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Nhập ghi chú..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Đóng
                </button>
                {selectedApplication.status === "SUBMITTED" && (
                  <>
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Duyệt
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
