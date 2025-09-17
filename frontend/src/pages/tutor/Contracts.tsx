import React, { useState } from "react";

interface Contract {
  id: string;
  studentName: string;
  subject: string;
  type: "single" | "package" | "monthly";
  startDate: string;
  endDate?: string;
  totalSessions: number;
  completedSessions: number;
  hourlyRate: number;
  totalAmount: number;
  paidAmount: number;
  status: "active" | "completed" | "paused" | "cancelled";
  createdDate: string;
  notes?: string;
  paymentMethod: string;
  sessionSchedule: string[];
}

export const Contracts: React.FC = () => {
  const [contracts] = useState<Contract[]>([
    {
      id: "CON001",
      studentName: "Nguyễn Minh An",
      subject: "IELTS",
      type: "package",
      startDate: "2024-11-01",
      endDate: "2025-02-01",
      totalSessions: 20,
      completedSessions: 12,
      hourlyRate: 300000,
      totalAmount: 9000000,
      paidAmount: 5400000,
      status: "active",
      createdDate: "2024-10-25",
      notes: "Package 20 buổi IELTS Speaking + Writing",
      paymentMethod: "Chuyển khoản",
      sessionSchedule: ["Thứ 3: 19:00-20:30", "Thứ 6: 19:00-20:30"],
    },
    {
      id: "CON002",
      studentName: "Trần Thị Bình",
      subject: "Tiếng Anh",
      type: "monthly",
      startDate: "2024-12-01",
      endDate: "2025-03-01",
      totalSessions: 12,
      completedSessions: 8,
      hourlyRate: 250000,
      totalAmount: 3000000,
      paidAmount: 3000000,
      status: "active",
      createdDate: "2024-11-28",
      paymentMethod: "Ví điện tử",
      sessionSchedule: ["Chủ nhật: 14:00-15:30"],
    },
    {
      id: "CON003",
      studentName: "Lê Văn Cường",
      subject: "Tiếng Anh",
      type: "single",
      startDate: "2024-10-15",
      endDate: "2024-12-15",
      totalSessions: 8,
      completedSessions: 8,
      hourlyRate: 200000,
      totalAmount: 1600000,
      paidAmount: 1600000,
      status: "completed",
      createdDate: "2024-10-10",
      paymentMethod: "Tiền mặt",
      sessionSchedule: ["Thứ 7: 16:00-17:30"],
    },
  ]);

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredContracts = contracts.filter((contract) => {
    const matchesStatus = filterStatus === "all" || contract.status === filterStatus;
    const matchesType = filterType === "all" || contract.type === filterType;
    return matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "paused":
        return "Tạm dừng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "single":
        return "bg-gray-100 text-gray-800";
      case "package":
        return "bg-purple-100 text-purple-800";
      case "monthly":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "single":
        return "Đơn lẻ";
      case "package":
        return "Gói học";
      case "monthly":
        return "Theo tháng";
      default:
        return type;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setShowDetailModal(true);
  };

  const handleExtendContract = (contractId: string) => {
    console.log("Extending contract:", contractId);
    alert("Gia hạn hợp đồng thành công!");
  };

  const handlePauseContract = (contractId: string) => {
    console.log("Pausing contract:", contractId);
    alert("Tạm dừng hợp đồng thành công!");
  };

  const handleTerminateContract = (contractId: string) => {
    if (confirm("Bạn có chắc chắn muốn kết thúc hợp đồng này?")) {
      console.log("Terminating contract:", contractId);
      alert("Kết thúc hợp đồng thành công!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý hợp đồng</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Tạo hợp đồng mới
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng hợp đồng</p>
              <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang thực hiện</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.filter(c => c.status === "active").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.filter(c => c.status === "completed").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng giá trị</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(contracts.reduce((total, c) => total + c.totalAmount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <option value="active">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="paused">Tạm dừng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại hợp đồng
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="single">Đơn lẻ</option>
              <option value="package">Gói học</option>
              <option value="monthly">Theo tháng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((contract) => (
          <div key={contract.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {contract.id} - {contract.studentName}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                    {getStatusText(contract.status)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contract.type)}`}>
                    {getTypeText(contract.type)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="block font-medium text-gray-900">{contract.subject}</span>
                    <span>Môn học</span>
                  </div>
                  <div>
                    <span className="block font-medium text-gray-900">
                      {contract.completedSessions}/{contract.totalSessions}
                    </span>
                    <span>Buổi học</span>
                  </div>
                  <div>
                    <span className="block font-medium text-green-600">{formatPrice(contract.hourlyRate)}</span>
                    <span>Phí/giờ</span>
                  </div>
                  <div>
                    <span className="block font-medium text-purple-600">{formatPrice(contract.totalAmount)}</span>
                    <span>Tổng giá trị</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span>📅 {new Date(contract.startDate).toLocaleDateString('vi-VN')} - {contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</span>
                  <span>💳 {contract.paymentMethod}</span>
                  <span className="text-green-600 font-medium">
                    Đã thanh toán: {formatPrice(contract.paidAmount)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tiến độ thực hiện</span>
                    <span>{calculateProgress(contract.completedSessions, contract.totalSessions)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${calculateProgress(contract.completedSessions, contract.totalSessions)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="text-sm">
                  <span className="text-gray-600">Lịch học: </span>
                  <span className="text-gray-900">{contract.sessionSchedule.join(", ")}</span>
                </div>

                {contract.notes && (
                  <p className="text-sm text-gray-600 mt-2">
                    📝 {contract.notes}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
                <button
                  onClick={() => handleViewDetails(contract)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Chi tiết
                </button>
                
                {contract.status === "active" && (
                  <>
                    <button
                      onClick={() => handleExtendContract(contract.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Gia hạn
                    </button>
                    <button
                      onClick={() => handlePauseContract(contract.id)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                    >
                      Tạm dừng
                    </button>
                    <button
                      onClick={() => handleTerminateContract(contract.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Kết thúc
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không có hợp đồng nào
          </h3>
          <p className="text-gray-600 mb-4">
            Hãy tạo hợp đồng đầu tiên với học viên của bạn
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Tạo hợp đồng mới
          </button>
        </div>
      )}

      {/* Contract Detail Modal */}
      {showDetailModal && selectedContract && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết hợp đồng {selectedContract.id}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Học viên</label>
                    <p className="text-gray-900">{selectedContract.studentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Môn học</label>
                    <p className="text-gray-900">{selectedContract.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Loại hợp đồng</label>
                    <p className="text-gray-900">{getTypeText(selectedContract.type)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContract.status)}`}>
                      {getStatusText(selectedContract.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                    <p className="text-gray-900">{new Date(selectedContract.startDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  {selectedContract.endDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                      <p className="text-gray-900">{new Date(selectedContract.endDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tổng buổi học</label>
                    <p className="text-gray-900 font-medium">{selectedContract.totalSessions}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Đã hoàn thành</label>
                    <p className="text-green-600 font-medium">{selectedContract.completedSessions}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Còn lại</label>
                    <p className="text-blue-600 font-medium">{selectedContract.totalSessions - selectedContract.completedSessions}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phí/giờ</label>
                    <p className="text-gray-900 font-medium">{formatPrice(selectedContract.hourlyRate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
                    <p className="text-gray-900">{selectedContract.paymentMethod}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tổng giá trị</label>
                    <p className="text-purple-600 font-bold text-lg">{formatPrice(selectedContract.totalAmount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Đã thanh toán</label>
                    <p className="text-green-600 font-bold text-lg">{formatPrice(selectedContract.paidAmount)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Lịch học</label>
                  <div className="mt-2">
                    {selectedContract.sessionSchedule.map((schedule, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
                      >
                        {schedule}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedContract.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                      {selectedContract.notes}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiến độ thực hiện</label>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full flex items-center justify-center text-xs text-white font-medium" 
                      style={{ width: `${calculateProgress(selectedContract.completedSessions, selectedContract.totalSessions)}%` }}
                    >
                      {calculateProgress(selectedContract.completedSessions, selectedContract.totalSessions)}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Đóng
                </button>
                {selectedContract.status === "active" && (
                  <>
                    <button
                      onClick={() => {
                        handleExtendContract(selectedContract.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Gia hạn
                    </button>
                    <button
                      onClick={() => {
                        handleTerminateContract(selectedContract.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Kết thúc
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tạo hợp đồng mới</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Học viên</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                      <option>Chọn học viên</option>
                      <option>Nguyễn Minh An</option>
                      <option>Trần Thị Bình</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Ví dụ: IELTS, Tiếng Anh..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại hợp đồng</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                      <option value="single">Đơn lẻ</option>
                      <option value="package">Gói học</option>
                      <option value="monthly">Theo tháng</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số buổi học</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phí/giờ (VND)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="300000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc (tùy chọn)</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option>Chuyển khoản</option>
                    <option>Tiền mặt</option>
                    <option>Ví điện tử</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lịch học</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows={3}
                    placeholder="Ví dụ: Thứ 3: 19:00-20:30, Thứ 6: 19:00-20:30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows={3}
                    placeholder="Mô tả về nội dung học, yêu cầu đặc biệt..."
                  />
                </div>
              </form>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    alert("Tạo hợp đồng thành công!");
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Tạo hợp đồng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
