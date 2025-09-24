import React, { useState, useEffect } from "react";

interface Contract {
  id: number;
  contractNumber: string;
  studentName: string;
  tutorName: string;
  subject: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  hourlyRate: number;
  totalAmount: number;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  createdAt: string;
  signedAt?: string;
  completedAt?: string;
}

const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form state for creating/editing contract
  const [formData, setFormData] = useState({
    studentName: "",
    tutorName: "",
    subject: "",
    startDate: "",
    endDate: "",
    totalHours: 0,
    hourlyRate: 0,
    status: "DRAFT",
  });

  useEffect(() => {
    loadContracts();
  }, [currentPage, searchTerm, statusFilter]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getContracts(
        currentPage,
        10,
        "createdAt",
        "desc",
        statusFilter,
        searchTerm
      );

      if (response.contracts) {
        setContracts(response.contracts || []);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setContracts(response);
        setTotalPages(1);
      } else {
        setContracts([]);
        setTotalPages(0);
      }
    } catch (error: any) {
      setError(error.message || "Lỗi khi tải dữ liệu hợp đồng");
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback - remove when API is ready
  const getMockContracts = (): Contract[] => [
    {
      id: 1,
      contractNumber: "CT-2024-001",
      studentName: "Nguyễn Văn A",
      tutorName: "Trần Thị B",
      subject: "Toán học",
      startDate: "2024-01-15",
      endDate: "2024-06-15",
      totalHours: 40,
      hourlyRate: 200000,
      totalAmount: 8000000,
      status: "ACTIVE",
      createdAt: "2024-01-10",
      signedAt: "2024-01-12",
    },
    {
      id: 2,
      contractNumber: "CT-2024-002",
      studentName: "Lê Văn C",
      tutorName: "Phạm Thị D",
      subject: "Tiếng Anh",
      startDate: "2024-02-01",
      endDate: "2024-07-01",
      totalHours: 60,
      hourlyRate: 180000,
      totalAmount: 10800000,
      status: "COMPLETED",
      createdAt: "2024-01-25",
      signedAt: "2024-01-28",
      completedAt: "2024-07-01",
    },
    {
      id: 3,
      contractNumber: "CT-2024-003",
      studentName: "Hoàng Văn E",
      tutorName: "Vũ Thị F",
      subject: "Vật lý",
      startDate: "2024-03-01",
      endDate: "2024-08-01",
      totalHours: 50,
      hourlyRate: 220000,
      totalAmount: 11000000,
      status: "DRAFT",
      createdAt: "2024-02-20",
    },
    {
      id: 4,
      contractNumber: "CT-2024-004",
      studentName: "Đỗ Văn G",
      tutorName: "Bùi Thị H",
      subject: "Hóa học",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      totalHours: 100,
      hourlyRate: 200000,
      totalAmount: 20000000,
      status: "CANCELLED",
      createdAt: "2023-12-15",
      signedAt: "2023-12-20",
    },
  ];

  const handleCreateContract = async () => {
    try {
      await adminService.createContract(formData);
      setShowCreateModal(false);
      resetForm();
      loadContracts();
    } catch (error: any) {
      setError(error.message || "Lỗi khi tạo hợp đồng");
    }
  };

  const handleUpdateContract = async () => {
    if (!editingContract) return;

    try {
      await adminService.updateContract(editingContract.id, formData);
      setEditingContract(null);
      setShowCreateModal(false);
      resetForm();
      loadContracts();
    } catch (error: any) {
      setError(error.message || "Lỗi khi cập nhật hợp đồng");
    }
  };

  const handleStatusChange = async (contractId: number, newStatus: string) => {
    try {
      await adminService.changeContractStatus(contractId, newStatus);
      loadContracts();
    } catch (error: any) {
      setError(error.message || "Lỗi khi thay đổi trạng thái hợp đồng");
    }
  };

  const resetForm = () => {
    setFormData({
      studentName: "",
      tutorName: "",
      subject: "",
      startDate: "",
      endDate: "",
      totalHours: 0,
      hourlyRate: 0,
      status: "DRAFT",
    });
  };

  const openEditModal = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      studentName: contract.studentName,
      tutorName: contract.tutorName,
      subject: contract.subject,
      startDate: contract.startDate,
      endDate: contract.endDate,
      totalHours: contract.totalHours,
      hourlyRate: contract.hourlyRate,
      status: contract.status,
    });
    setShowCreateModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "EXPIRED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Nháp";
      case "ACTIVE":
        return "Đang hoạt động";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "EXPIRED":
        return "Hết hạn";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý hợp đồng</h1>
        <p className="text-gray-600">
          Quản lý các hợp đồng gia sư trong hệ thống
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Tìm kiếm hợp đồng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingContract(null);
            setShowCreateModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Tạo hợp đồng mới
        </button>
      </div>

      {/* Contracts table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số hợp đồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học sinh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gia sư
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số giờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts && contracts.length > 0 ? (
                contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contract.contractNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.tutorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>
                          Từ:{" "}
                          {new Date(contract.startDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                        <div>
                          Đến:{" "}
                          {new Date(contract.endDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.totalHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(contract.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          contract.status
                        )}`}
                      >
                        {getStatusText(contract.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(contract)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                        {contract.status === "DRAFT" && (
                          <button
                            onClick={() =>
                              handleStatusChange(contract.id, "ACTIVE")
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            Kích hoạt
                          </button>
                        )}
                        {contract.status === "ACTIVE" && (
                          <button
                            onClick={() =>
                              handleStatusChange(contract.id, "COMPLETED")
                            }
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Hoàn thành
                          </button>
                        )}
                        {(contract.status === "DRAFT" ||
                          contract.status === "ACTIVE") && (
                          <button
                            onClick={() =>
                              handleStatusChange(contract.id, "CANCELLED")
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Không có hợp đồng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đầu
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
            <button
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cuối
            </button>
          </nav>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingContract ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng mới"}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên học sinh
                  </label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nhập tên học sinh"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên gia sư
                  </label>
                  <input
                    type="text"
                    value={formData.tutorName}
                    onChange={(e) =>
                      setFormData({ ...formData, tutorName: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nhập tên gia sư"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Môn học
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nhập môn học"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="DRAFT">Nháp</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                    <option value="EXPIRED">Hết hạn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tổng số giờ
                  </label>
                  <input
                    type="number"
                    value={formData.totalHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalHours: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nhập tổng số giờ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Giá mỗi giờ (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hourlyRate: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nhập giá mỗi giờ"
                  />
                </div>
              </div>

              {formData.totalHours > 0 && formData.hourlyRate > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>
                      Tổng tiền:{" "}
                      {formatCurrency(
                        formData.totalHours * formData.hourlyRate
                      )}
                    </strong>
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingContract(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={
                    editingContract
                      ? handleUpdateContract
                      : handleCreateContract
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingContract ? "Cập nhật" : "Tạo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
