import React, { useState } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  subjects: string[];
  joinedDate: string;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  totalPaid: number;
  lastSession?: string;
  status: "active" | "inactive" | "paused";
  notes?: string;
  level: string;
  goals: string[];
}

export const StudentManagement: React.FC = () => {
  const [students] = useState<Student[]>([
    {
      id: "1",
      name: "Nguyễn Minh An",
      email: "an@example.com",
      phone: "0901234567",
      subjects: ["Tiếng Anh", "IELTS"],
      joinedDate: "2024-11-15",
      totalSessions: 24,
      completedSessions: 18,
      upcomingSessions: 3,
      totalPaid: 5400000,
      lastSession: "2025-01-12",
      status: "active",
      level: "Intermediate",
      goals: ["IELTS 7.0", "Giao tiếp tự tin"],
      notes: "Học viên rất chăm chỉ, cần tập trung vào Speaking",
    },
    {
      id: "2",
      name: "Trần Thị Bình",
      email: "binh@example.com",
      phone: "0987654321",
      subjects: ["IELTS"],
      joinedDate: "2024-12-01",
      totalSessions: 12,
      completedSessions: 10,
      upcomingSessions: 2,
      totalPaid: 3600000,
      lastSession: "2025-01-10",
      status: "active",
      level: "Advanced",
      goals: ["IELTS 8.0"],
      notes: "Học viên có nền tảng tốt, tập trung vào Writing Task 2",
    },
    {
      id: "3",
      name: "Lê Văn Cường",
      email: "cuong@example.com",
      phone: "0909123456",
      subjects: ["Tiếng Anh"],
      joinedDate: "2024-10-20",
      totalSessions: 8,
      completedSessions: 6,
      upcomingSessions: 0,
      totalPaid: 1800000,
      lastSession: "2024-12-20",
      status: "paused",
      level: "Beginner",
      goals: ["Giao tiếp cơ bản"],
      notes: "Tạm dừng học do bận công việc",
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || student.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang học";
      case "inactive":
        return "Không hoạt động";
      case "paused":
        return "Tạm dừng";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleSendMessage = (studentId: string) => {
    console.log("Opening message with student:", studentId);
  };

  const handleScheduleSession = (studentId: string) => {
    console.log("Scheduling session with student:", studentId);
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý học viên</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Thêm học viên
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng học viên</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang học</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.status === "active").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏸️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tạm dừng</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.status === "paused").length}
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
              <p className="text-sm font-medium text-gray-600">Tổng thu nhập</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(students.reduce((total, s) => total + s.totalPaid, 0))}
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
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

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
              <option value="active">Đang học</option>
              <option value="paused">Tạm dừng</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">
                    {student.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                {getStatusText(student.status)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Môn học:</span>
                <span className="font-medium">{student.subjects.join(", ")}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trình độ:</span>
                <span className="font-medium">{student.level}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Buổi học:</span>
                <span className="font-medium">{student.completedSessions}/{student.totalSessions}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${calculateProgress(student.completedSessions, student.totalSessions)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sắp tới:</span>
                <span className="font-medium text-blue-600">{student.upcomingSessions} buổi</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng thu:</span>
                <span className="font-medium text-green-600">{formatPrice(student.totalPaid)}</span>
              </div>
              
              {student.lastSession && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Học cuối:</span>
                  <span className="text-gray-900">{new Date(student.lastSession).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewDetails(student)}
                className="flex-1 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Chi tiết
              </button>
              <button
                onClick={() => handleSendMessage(student.id)}
                className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Nhắn tin
              </button>
              <button
                onClick={() => handleScheduleSession(student.id)}
                className="flex-1 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Đặt lịch
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy học viên
          </h3>
          <p className="text-gray-600 mb-4">
            Hãy thử điều chỉnh bộ lọc hoặc thêm học viên mới
          </p>
        </div>
      )}

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết học viên - {selectedStudent.name}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày tham gia</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedStudent.joinedDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                {/* Learning Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Thông tin học tập</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Môn học</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.subjects.join(", ")}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Trình độ</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.level}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Mục tiêu</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedStudent.goals.map((goal, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tiến độ học tập</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedStudent.totalSessions}</p>
                      <p className="text-sm text-gray-600">Tổng buổi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedStudent.completedSessions}</p>
                      <p className="text-sm text-gray-600">Hoàn thành</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{selectedStudent.upcomingSessions}</p>
                      <p className="text-sm text-gray-600">Sắp tới</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tỷ lệ hoàn thành</span>
                      <span>{calculateProgress(selectedStudent.completedSessions, selectedStudent.totalSessions)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${calculateProgress(selectedStudent.completedSessions, selectedStudent.totalSessions)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Financial */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Thông tin tài chính</h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-green-800">
                      Tổng thu nhập: {formatPrice(selectedStudent.totalPaid)}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedStudent.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedStudent.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleSendMessage(selectedStudent.id);
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Nhắn tin
                </button>
                <button
                  onClick={() => {
                    handleScheduleSession(selectedStudent.id);
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Đặt lịch học
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
