import React, { useState } from "react";

interface Report {
  id: string;
  reporterName: string;
  reporterEmail: string;
  reportedName: string;
  reportedType: "user" | "tutor";
  category:
    | "inappropriate_behavior"
    | "fake_profile"
    | "payment_issue"
    | "technical_issue"
    | "other";
  title: string;
  description: string;
  status: "pending" | "investigating" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  submittedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  attachments?: string[];
}

export const ReportManagement: React.FC = () => {
  const [reports] = useState<Report[]>([
    {
      id: "1",
      reporterName: "Nguyễn Văn A",
      reporterEmail: "a@example.com",
      reportedName: "Trần Thị B",
      reportedType: "tutor",
      category: "inappropriate_behavior",
      title: "Gia sư có hành vi không phù hợp",
      description:
        "Gia sư thường xuyên đến muộn và không chuẩn bị bài giảng tốt. Thái độ không chuyên nghiệp.",
      status: "pending",
      priority: "high",
      submittedAt: "2025-01-12",
      attachments: ["evidence1.jpg", "chat_log.png"],
    },
    {
      id: "2",
      reporterName: "Lê Văn C",
      reporterEmail: "c@example.com",
      reportedName: "Phạm Thị D",
      reportedType: "user",
      category: "payment_issue",
      title: "Học viên không thanh toán",
      description:
        "Học viên đã học 5 buổi nhưng không thanh toán theo thỏa thuận. Luôn lý do để trì hoãn.",
      status: "investigating",
      priority: "medium",
      submittedAt: "2025-01-10",
    },
    {
      id: "3",
      reporterName: "Hoàng Văn E",
      reporterEmail: "e@example.com",
      reportedName: "Đinh Thị F",
      reportedType: "tutor",
      category: "fake_profile",
      title: "Hồ sơ gia sư giả mạo",
      description:
        "Gia sư khai báo bằng cấp và kinh nghiệm không đúng sự thật. Không có chứng chỉ như đã đăng ký.",
      status: "resolved",
      priority: "urgent",
      submittedAt: "2025-01-08",
      resolvedAt: "2025-01-11",
      resolvedBy: "Admin",
      resolution:
        "Đã xác minh và tạm khóa tài khoản gia sư. Yêu cầu cung cấp lại giấy tờ hợp lệ.",
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || report.priority === filterPriority;
    const matchesCategory =
      filterCategory === "all" || report.category === filterCategory;

    return matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "investigating":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "inappropriate_behavior":
        return "Hành vi không phù hợp";
      case "fake_profile":
        return "Hồ sơ giả mạo";
      case "payment_issue":
        return "Vấn đề thanh toán";
      case "technical_issue":
        return "Sự cố kỹ thuật";
      case "other":
        return "Khác";
      default:
        return category;
    }
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    console.log(`Cập nhật trạng thái báo cáo ${id} thành ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý báo cáo</h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter((r) => r.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang điều tra</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter((r) => r.status === "investigating").length}
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
              <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter((r) => r.status === "resolved").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Khẩn cấp</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter((r) => r.priority === "urgent").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="investigating">Đang điều tra</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mức độ ưu tiên
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="inappropriate_behavior">
                Hành vi không phù hợp
              </option>
              <option value="fake_profile">Hồ sơ giả mạo</option>
              <option value="payment_issue">Vấn đề thanh toán</option>
              <option value="technical_issue">Sự cố kỹ thuật</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách báo cáo ({filteredReports.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredReports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {report.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        report.priority
                      )}`}
                    >
                      {report.priority === "low"
                        ? "Thấp"
                        : report.priority === "medium"
                        ? "Trung bình"
                        : report.priority === "high"
                        ? "Cao"
                        : "Khẩn cấp"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>👤 Người báo cáo: {report.reporterName}</span>
                    <span>
                      🎯 Đối tượng: {report.reportedName} (
                      {report.reportedType === "tutor" ? "Gia sư" : "Học viên"})
                    </span>
                    <span>📂 {getCategoryText(report.category)}</span>
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">
                    {report.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📅 {report.submittedAt}</span>
                    {report.attachments && (
                      <span>📎 {report.attachments.length} tệp đính kèm</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {report.status === "pending"
                      ? "Chờ xử lý"
                      : report.status === "investigating"
                      ? "Đang điều tra"
                      : report.status === "resolved"
                      ? "Đã giải quyết"
                      : "Từ chối"}
                  </span>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(report)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Chi tiết
                    </button>
                    {report.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(report.id, "investigating")
                          }
                          className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                        >
                          Điều tra
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(report.id, "resolved")
                          }
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          Giải quyết
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for report details */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết báo cáo #{selectedReport.id}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedReport.title}
                  </h4>
                  <div className="flex space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedReport.status
                      )}`}
                    >
                      {selectedReport.status === "pending"
                        ? "Chờ xử lý"
                        : selectedReport.status === "investigating"
                        ? "Đang điều tra"
                        : selectedReport.status === "resolved"
                        ? "Đã giải quyết"
                        : "Từ chối"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        selectedReport.priority
                      )}`}
                    >
                      {selectedReport.priority === "low"
                        ? "Thấp"
                        : selectedReport.priority === "medium"
                        ? "Trung bình"
                        : selectedReport.priority === "high"
                        ? "Cao"
                        : "Khẩn cấp"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Người báo cáo
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.reporterName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedReport.reporterEmail}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Đối tượng bị báo cáo
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.reportedName} (
                      {selectedReport.reportedType === "tutor"
                        ? "Gia sư"
                        : "Học viên"}
                      )
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Danh mục
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {getCategoryText(selectedReport.category)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mô tả chi tiết
                  </label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>

                {selectedReport.attachments &&
                  selectedReport.attachments.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tệp đính kèm
                      </label>
                      <div className="mt-2 space-y-2">
                        {selectedReport.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-sm text-gray-600">📎</span>
                            <a
                              href="#"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {file}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedReport.resolution && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-800">
                      Kết quả xử lý
                    </label>
                    <p className="mt-1 text-sm text-green-700">
                      {selectedReport.resolution}
                    </p>
                    {selectedReport.resolvedAt && (
                      <p className="mt-2 text-xs text-green-600">
                        Giải quyết ngày {selectedReport.resolvedAt} bởi{" "}
                        {selectedReport.resolvedBy}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Đóng
                </button>
                {selectedReport.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedReport.id, "investigating");
                        setShowModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                    >
                      Bắt đầu điều tra
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedReport.id, "resolved");
                        setShowModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Đánh dấu đã giải quyết
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
