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
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  createdAt: string;
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
  const [showRejectNote, setShowRejectNote] = useState(false);
  const [verifyingItems, setVerifyingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await adminService.getApplicationsForReview();
      console.log("API Response:", data);

      let applicationData: TutorApplication[] = [];
      if (Array.isArray(data)) {
        applicationData = data;
      } else if (data && Array.isArray(data.applications)) {
        // Response với applications array
        applicationData = data.applications;
      } else if (data && Array.isArray(data.content)) {
        applicationData = data.content;
      } else if (data && Array.isArray(data.data)) {
        applicationData = data.data;
      } else {
        console.error("Unexpected API response format:", data);
        setApplications([]);
        setError("Định dạng dữ liệu không đúng");
        return;
      }

      // Sắp xếp theo ngày gửi mới nhất
      const sortedApplications = applicationData.sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.submittedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      setApplications(sortedApplications);
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
        return "bg-yellow-100 text-yellow-640";
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
    // Only set admin note if the application is in SUBMITTED status
    if (application.status === "SUBMITTED") {
      setAdminNote(application.adminNote || "");
    } else {
      setAdminNote(""); // Clear admin note for non-submitted applications
    }
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    try {
      await adminService.approveApplication(parseInt(selectedApplication.id));
      await loadApplications();
      setShowModal(false);
      setSelectedApplication(null);
      setAdminNote(""); // Clear admin note when approving
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
      setShowRejectNote(false);
    } catch (err: unknown) {
      console.error("Error rejecting application:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi từ chối hồ sơ");
    }
  };

  const handleVerifyEducation = async (
    educationId: number,
    isVerified: boolean
  ) => {
    const itemKey = `edu-${educationId}`;
    setVerifyingItems((prev) => new Set(prev).add(itemKey));

    try {
      await adminService.verifyEducation(educationId, isVerified);

      // Cập nhật trạng thái ngay lập tức trong selectedApplication
      if (selectedApplication) {
        const updatedApplication = { ...selectedApplication };
        const educationIndex = updatedApplication.educations.findIndex(
          (edu) => edu.id === educationId
        );
        if (educationIndex !== -1) {
          updatedApplication.educations[educationIndex] = {
            ...updatedApplication.educations[educationIndex],
            isVerified: isVerified,
          };
          setSelectedApplication(updatedApplication);
        }
      }

      // Reload toàn bộ danh sách để đảm bảo đồng bộ
      await loadApplications();
    } catch (err: unknown) {
      console.error("Error verifying education:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi xác thực học vấn");
    } finally {
      setVerifyingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleVerifyCertificate = async (
    certificateId: number,
    isVerified: boolean
  ) => {
    const itemKey = `cert-${certificateId}`;
    setVerifyingItems((prev) => new Set(prev).add(itemKey));

    try {
      await adminService.verifyCertificate(certificateId, isVerified);

      // Cập nhật trạng thái ngay lập tức trong selectedApplication
      if (selectedApplication) {
        const updatedApplication = { ...selectedApplication };
        const certificateIndex = updatedApplication.certificates.findIndex(
          (cert) => cert.id === certificateId
        );
        if (certificateIndex !== -1) {
          updatedApplication.certificates[certificateIndex] = {
            ...updatedApplication.certificates[certificateIndex],
            isVerified: isVerified,
          };
          setSelectedApplication(updatedApplication);
        }
      }

      // Reload toàn bộ danh sách để đảm bảo đồng bộ
      await loadApplications();
    } catch (err: unknown) {
      console.error("Error verifying certificate:", err);
      setError(
        err instanceof Error ? err.message : "Lỗi khi xác thực chứng chỉ"
      );
    } finally {
      setVerifyingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
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
          <div className="text-red-600 text-2xl mb-4">Lỗi: {error}</div>
          <button
            onClick={loadApplications}
            className="px-3 py-2 text-white rounded transition-colors"
            style={{ backgroundColor: "rgb(148, 204, 230)" }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor =
                "rgb(135, 190, 220)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor =
                "rgb(148, 204, 230)")
            }
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: "rgb(148, 204, 230)" }}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Duyệt gia sư</h1>
            <p className="text-sm text-gray-600">
              Duyệt và phê duyệt đơn đăng ký gia sư
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div
          className="bg-white p-6 rounded-xl shadow-sm border-l-4"
          style={{ borderLeftColor: "rgb(148, 204, 230)" }}
        >
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="rgb(148, 204, 230)"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
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

        <div
          className="bg-white p-6 rounded-xl shadow-sm border-l-4"
          style={{ borderLeftColor: "rgb(148, 204, 230)" }}
        >
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="rgb(148, 204, 230)"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter((app) => app.status === "APPROVED").length}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl shadow-sm border-l-4"
          style={{ borderLeftColor: "rgb(148, 204, 230)" }}
        >
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="rgb(148, 204, 230)"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
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
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none transition-colors"
              style={{
                borderColor: "rgb(148, 204, 230)",
              }}
              onFocus={(e) =>
                ((e.target as HTMLSelectElement).style.borderColor =
                  "rgb(135, 190, 220)")
              }
              onBlur={(e) =>
                ((e.target as HTMLSelectElement).style.borderColor =
                  "rgb(148, 204, 230)")
              }
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="SUBMITTED">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">
            Danh sách hồ sơ ({filteredApplications.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}>
              <tr>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Ứng viên
                </th>
                <th
                  className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: "200px" }}
                >
                  Thông tin cơ bản
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Ngày gửi
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-xs">
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
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{application.headline}</div>
                      <div className="text-gray-500 mt-1 line-clamp-1">
                        {application.bio}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {getStatusText(application.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {application.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString(
                          "vi-VN"
                        )
                      : "Chưa gửi"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
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
          <div className="relative top-4 mx-auto p-0 border-0 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-2xl rounded-xl bg-white">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Chi tiết hồ sơ gia sư</h3>
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
                    stroke="rgb(148, 204, 230)"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Thông tin cá nhân
                    </h4>
                    <div className="space-y-4">
                      {/* Avatar */}
                      {selectedApplication.imageAvatar && (
                        <div className="flex justify-center mb-4">
                          <img
                            src={selectedApplication.imageAvatar}
                            alt="Avatar"
                            className="w-24 h-1.54 rounded-full object-cover border-4 border-gray-200"
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
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Học vấn
                      </h4>
                      <div className="space-y-4">
                        {selectedApplication.educations.map((edu, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-blue-500 pl-4"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">
                                  {edu.schoolName}
                                </h5>
                                <p className="text-gray-700">{edu.degree}</p>
                                {edu.major && (
                                  <p className="text-gray-600 text-xs">
                                    Chuyên ngành: {edu.major}
                                  </p>
                                )}
                                <p className="text-gray-500 text-xs">
                                  {edu.fromTime} - {edu.toTime || "Hiện tại"}
                                </p>
                                {edu.degreeFileUrl && (
                                  <a
                                    href={edu.degreeFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                                  >
                                    Xem bằng cấp
                                  </a>
                                )}
                                <div className="mt-2 flex items-center space-x-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      edu.isVerified
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {edu.isVerified
                                      ? "Đã xác thực"
                                      : "Chờ xác thực"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() =>
                                    handleVerifyEducation(edu.id, true)
                                  }
                                  disabled={
                                    edu.isVerified ||
                                    verifyingItems.has(`edu-${edu.id}`)
                                  }
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                    edu.isVerified ||
                                    verifyingItems.has(`edu-${edu.id}`)
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-green-100 text-green-700 hover:bg-green-200"
                                  }`}
                                >
                                  {verifyingItems.has(`edu-${edu.id}`)
                                    ? "Đang xử lý..."
                                    : "Xác thực"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleVerifyEducation(edu.id, false)
                                  }
                                  disabled={
                                    !edu.isVerified ||
                                    verifyingItems.has(`edu-${edu.id}`)
                                  }
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                    !edu.isVerified ||
                                    verifyingItems.has(`edu-${edu.id}`)
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-red-100 text-red-700 hover:bg-red-200"
                                  }`}
                                >
                                  {verifyingItems.has(`edu-${edu.id}`)
                                    ? "Đang xử lý..."
                                    : "Bỏ xác thực"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Chứng chỉ
                      </h4>
                      <div className="space-y-4">
                        {selectedApplication.certificates.map((cert, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-green-500 pl-4"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">
                                  {cert.name}
                                </h5>
                                <p className="text-gray-700">
                                  Tổ chức cấp: {cert.issuedBy}
                                </p>
                                {cert.description && (
                                  <p className="text-gray-600 text-xs">
                                    {cert.description}
                                  </p>
                                )}
                                {cert.certFileUrl && (
                                  <a
                                    href={cert.certFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                                  >
                                    Xem chứng chỉ
                                  </a>
                                )}
                                <div className="mt-2 flex items-center space-x-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      cert.isVerified
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {cert.isVerified
                                      ? "Đã xác thực"
                                      : "Chờ xác thực"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() =>
                                    handleVerifyCertificate(cert.id, true)
                                  }
                                  disabled={
                                    cert.isVerified ||
                                    verifyingItems.has(`cert-${cert.id}`)
                                  }
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                    cert.isVerified ||
                                    verifyingItems.has(`cert-${cert.id}`)
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-green-100 text-green-700 hover:bg-green-200"
                                  }`}
                                >
                                  {verifyingItems.has(`cert-${cert.id}`)
                                    ? "Đang xử lý..."
                                    : "Xác thực"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleVerifyCertificate(cert.id, false)
                                  }
                                  disabled={
                                    !cert.isVerified ||
                                    verifyingItems.has(`cert-${cert.id}`)
                                  }
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                    !cert.isVerified ||
                                    verifyingItems.has(`cert-${cert.id}`)
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-red-100 text-red-700 hover:bg-red-200"
                                  }`}
                                >
                                  {verifyingItems.has(`cert-${cert.id}`)
                                    ? "Đang xử lý..."
                                    : "Bỏ xác thực"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Chứng chỉ
                      </h4>
                      <p className="text-gray-500 italic">
                        Chưa cập nhật chứng chỉ
                      </p>
                    </div>
                  )}

                  {/* Subject Fees */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Đối tượng dạy
                    </h4>
                    {selectedApplication.teachingAudiences &&
                    selectedApplication.teachingAudiences.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedApplication.teachingAudiences.map(
                          (audience, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
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
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2 rounded-b-lg border-t border-gray-200">
              {/* Admin Note - Only show when rejecting */}
              {selectedApplication.status === "SUBMITTED" && showRejectNote && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ghi chú từ chối (tùy chọn)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập lý do từ chối (có thể để trống)..."
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                {selectedApplication.status === "SUBMITTED" && (
                  <>
                    <button
                      onClick={() => setShowRejectNote(!showRejectNote)}
                      className="px-6 py-2 text-white rounded-xl transition-colors"
                      style={{ backgroundColor: "rgb(220, 100, 100)" }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLButtonElement).style.backgroundColor =
                          "rgb(200, 80, 80)")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLButtonElement).style.backgroundColor =
                          "rgb(220, 100, 100)")
                      }
                    >
                      {showRejectNote ? "Hủy từ chối" : "Từ chối"}
                    </button>
                    {showRejectNote && (
                      <button
                        onClick={handleReject}
                        className="px-6 py-2 text-white rounded-xl transition-colors"
                        style={{ backgroundColor: "rgb(180, 60, 60)" }}
                        onMouseEnter={(e) =>
                          ((
                            e.target as HTMLButtonElement
                          ).style.backgroundColor = "rgb(160, 40, 40)")
                        }
                        onMouseLeave={(e) =>
                          ((
                            e.target as HTMLButtonElement
                          ).style.backgroundColor = "rgb(180, 60, 60)")
                        }
                      >
                        Xác nhận từ chối
                      </button>
                    )}
                    <button
                      onClick={handleApprove}
                      className="px-6 py-2 text-white rounded-xl transition-colors"
                      style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLButtonElement).style.backgroundColor =
                          "rgb(135, 190, 220)")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLButtonElement).style.backgroundColor =
                          "rgb(148, 204, 230)")
                      }
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
