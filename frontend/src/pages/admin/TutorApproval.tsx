import React, { useState } from "react";

interface TutorApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  experience: string;
  education: string;
  cv: string;
  idCard: string;
  certificate: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export const TutorApproval: React.FC = () => {
  const [applications] = useState<TutorApplication[]>([
    {
      id: "1",
      name: "Nguyễn Thị Lan",
      email: "lan@example.com",
      phone: "0912345678",
      subjects: ["Tiếng Anh", "IELTS"],
      experience: "3 năm",
      education: "Đại học Ngoại ngữ Hà Nội",
      cv: "cv-nguyen-thi-lan.pdf",
      idCard: "id-nguyen-thi-lan.jpg",
      certificate: "cert-ielts.pdf",
      status: "pending",
      submittedAt: "2025-01-10",
    },
    {
      id: "2",
      name: "Trần Văn Nam",
      email: "nam@example.com",
      phone: "0987654321",
      subjects: ["Toán", "Vật lý"],
      experience: "5 năm",
      education: "Đại học Bách khoa Hà Nội",
      cv: "cv-tran-van-nam.pdf",
      idCard: "id-tran-van-nam.jpg",
      certificate: "cert-toán.pdf",
      status: "approved",
      submittedAt: "2025-01-08",
      reviewedAt: "2025-01-09",
      reviewedBy: "Admin",
    },
    {
      id: "3",
      name: "Lê Thị Hoa",
      email: "hoa@example.com",
      phone: "0909123456",
      subjects: ["Hóa học", "Sinh học"],
      experience: "2 năm",
      education: "Đại học Khoa học Tự nhiên",
      cv: "cv-le-thi-hoa.pdf",
      idCard: "id-le-thi-hoa.jpg",
      certificate: "cert-hoa.pdf",
      status: "rejected",
      submittedAt: "2025-01-05",
      reviewedAt: "2025-01-06",
      reviewedBy: "Admin",
      notes: "Chưa đủ kinh nghiệm giảng dạy",
    },
  ]);

  const [selectedApplication, setSelectedApplication] =
    useState<TutorApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredApplications = applications.filter((app) => {
    return filterStatus === "all" || app.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (application: TutorApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleApprove = (id: string) => {
    // Logic phê duyệt
    console.log("Phê duyệt đơn:", id);
  };

  const handleReject = (id: string) => {
    // Logic từ chối
    console.log("Từ chối đơn:", id);
  };

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
                {applications.filter((a) => a.status === "pending").length}
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
                {applications.filter((a) => a.status === "approved").length}
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
                {applications.filter((a) => a.status === "rejected").length}
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
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
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
                        {application.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {application.name}
                    </h3>
                    <p className="text-sm text-gray-500">{application.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-600">
                        📚 {application.subjects.join(", ")}
                      </span>
                      <span className="text-sm text-gray-600">
                        🎓 {application.education}
                      </span>
                      <span className="text-sm text-gray-600">
                        ⏱️ {application.experience}
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
                    {application.status === "pending"
                      ? "Chờ duyệt"
                      : application.status === "approved"
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
                    {application.status === "pending" && (
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
                  Chi tiết đơn đăng ký - {selectedApplication.name}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Họ tên
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedApplication.name}
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
                      {selectedApplication.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kinh nghiệm
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedApplication.experience}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Môn học
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedApplication.subjects.join(", ")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Học vấn
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedApplication.education}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tài liệu đính kèm
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">📄 CV:</span>
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {selectedApplication.cv}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        🆔 CMND/CCCD:
                      </span>
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {selectedApplication.idCard}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        🏆 Chứng chỉ:
                      </span>
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {selectedApplication.certificate}
                      </a>
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
                {selectedApplication.status === "pending" && (
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
