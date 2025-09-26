import React, { useState, useEffect } from "react";
import {
  AdminService,
  ApplicationForReview,
} from "../../services/adminService";

const ApplicationManagement: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationForReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationForReview | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AdminService.getApplicationsForReview();
      if (result.success && result.applications) {
        setApplications(result.applications);
      } else {
        setError(result.error || "Không thể tải danh sách đơn đăng ký");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: number) => {
    setActionLoading(applicationId);

    try {
      const result = await AdminService.approveApplication(applicationId);
      if (result.success) {
        // Refresh danh sách
        await fetchApplications();
        alert("Đã duyệt đơn đăng ký thành công!");
      } else {
        alert(result.error || "Có lỗi xảy ra khi duyệt đơn");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId: number, adminNote?: string) => {
    setActionLoading(applicationId);

    try {
      const result = await AdminService.rejectApplication(
        applicationId,
        adminNote
      );
      if (result.success) {
        // Refresh danh sách
        await fetchApplications();
        alert("Đã từ chối đơn đăng ký!");
      } else {
        alert(result.error || "Có lỗi xảy ra khi từ chối đơn");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      DRAFT: { text: "Nháp", className: "bg-gray-100 text-gray-800" },
      SUBMITTED: { text: "Đã gửi", className: "bg-blue-100 text-blue-800" },
      UNDER_REVIEW: {
        text: "Đang xét duyệt",
        className: "bg-yellow-100 text-yellow-640",
      },
      APPROVED: { text: "Đã duyệt", className: "bg-green-100 text-green-800" },
      REJECTED: { text: "Đã từ chối", className: "bg-red-100 text-red-800" },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      text: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-2 text-sm font-semibold rounded-full ${statusInfo.className}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  const getApplicationTypeBadge = (type: string) => {
    const typeMap = {
      BECOME_TUTOR: {
        text: "Đăng ký gia sư",
        className: "bg-purple-100 text-purple-800",
      },
      UPDATE_PROFILE: {
        text: "Cập nhật hồ sơ",
        className: "bg-orange-100 text-orange-800",
      },
    };

    const typeInfo = typeMap[type as keyof typeof typeMap] || {
      text: type,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-2 text-sm font-semibold rounded-full ${typeInfo.className}`}
      >
        {typeInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
            <div className="mt-3 text-xs text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-3">
              <button
                onClick={fetchApplications}
                className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-2 px-4 rounded"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý đơn đăng ký
        </h1>
        <p className="text-gray-600 mt-3">
          Xét duyệt các đơn đăng ký gia sư và cập nhật hồ sơ
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            Không có đơn đăng ký nào cần xét duyệt
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {applications.map((application) => (
              <li key={application.id}>
                <div className="px-3 py-2 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {application.firstName?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-1">
                          <p className="text-sm font-medium text-gray-900">
                            {application.firstName} {application.lastName}
                          </p>
                          {getApplicationTypeBadge(application.applicationType)}
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-sm text-gray-500">
                            Email: {application.email}
                          </p>
                          {application.phoneNumber && (
                            <p className="text-sm text-gray-500">
                              SĐT: {application.phoneNumber}
                            </p>
                          )}
                        </div>
                        {application.headline && (
                          <p className="text-sm text-gray-600 mt-1">
                            {application.headline}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {application.status === "SUBMITTED" && (
                        <>
                          <button
                            onClick={() => handleApprove(application.id)}
                            disabled={actionLoading === application.id}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md text-xs disabled:opacity-50"
                          >
                            {actionLoading === application.id
                              ? "Đang xử lý..."
                              : "Duyệt"}
                          </button>
                          <button
                            onClick={() => {
                              const adminNote = prompt(
                                "Lý do từ chối (tùy chọn):"
                              );
                              if (adminNote !== null) {
                                handleReject(
                                  application.id,
                                  adminNote || undefined
                                );
                              }
                            }}
                            disabled={actionLoading === application.id}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md text-xs disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-xs"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <span>
                        Ngày gửi:{" "}
                        {new Date(
                          application.submittedAt || application.createdAt
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal chi tiết application */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-md rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết đơn đăng ký
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
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
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Thông tin cơ bản
                  </h4>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <p>
                      <span className="font-medium">Họ tên:</span>{" "}
                      {selectedApplication.firstName}{" "}
                      {selectedApplication.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedApplication.email}
                    </p>
                    <p>
                      <span className="font-medium">Loại đơn:</span>{" "}
                      {selectedApplication.applicationType === "BECOME_TUTOR"
                        ? "Đăng ký gia sư"
                        : "Cập nhật hồ sơ"}
                    </p>
                    <p>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      {getStatusBadge(selectedApplication.status)}
                    </p>
                  </div>
                </div>

                {selectedApplication.bio && (
                  <div>
                    <h4 className="font-medium text-gray-900">Giới thiệu</h4>
                    <p className="mt-3 text-gray-600">
                      {selectedApplication.bio}
                    </p>
                  </div>
                )}

                {selectedApplication.experience && (
                  <div>
                    <h4 className="font-medium text-gray-900">Kinh nghiệm</h4>
                    <p className="mt-3 text-gray-600">
                      {selectedApplication.experience}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
