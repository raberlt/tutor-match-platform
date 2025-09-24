import React, { useState, useEffect, useCallback } from "react";
import { adminService } from "../../services/adminService";

interface Subject {
  id: number;
  name: string;
  description: string;
  category: string;
  level: string;
  isActive: boolean;
  tutorCount: number;
  studentCount: number;
  createdAt: string;
}

const SubjectManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state for creating/editing subject
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "ACADEMIC",
    level: "ELEMENTARY",
    isActive: true,
  });

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const loadSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getSubjects(
        currentPage,
        10,
        "name",
        "asc",
        searchTerm,
        categoryFilter,
        levelFilter
      );

      if (response.subjects) {
        setSubjects(response.subjects || []);
        setTotalPages(response.totalPages || 0);
      } else if (response.content) {
        setSubjects(response.content || []);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setSubjects(response);
        setTotalPages(1);
      } else {
        setSubjects([]);
        setTotalPages(0);
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Lỗi khi tải dữ liệu môn học"
      );
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, categoryFilter, levelFilter]);
  const handleCreateSubject = async () => {
    try {
      await adminService.createSubject(formData);
      setShowCreateModal(false);
      resetForm();
      loadSubjects();
    } catch (error: any) {
      setError(error.message || "Lỗi khi tạo môn học");
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;

    try {
      await adminService.updateSubject(editingSubject.id, formData);
      setEditingSubject(null);
      setShowCreateModal(false);
      resetForm();
      loadSubjects();
    } catch (error: any) {
      setError(error.message || "Lỗi khi cập nhật môn học");
    }
  };

  const handleToggleActive = async (subjectId: number) => {
    try {
      await adminService.toggleSubjectStatus(subjectId);
      loadSubjects();
    } catch (error: any) {
      setError(error.message || "Lỗi khi thay đổi trạng thái môn học");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "ACADEMIC",
      level: "ELEMENTARY",
      isActive: true,
    });
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      category: subject.category,
      level: subject.level,
      isActive: subject.isActive,
    });
    setShowCreateModal(true);
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "ACADEMIC":
        return "Học thuật";
      case "LANGUAGE":
        return "Ngôn ngữ";
      case "ART":
        return "Nghệ thuật";
      case "SPORT":
        return "Thể thao";
      default:
        return category;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "ELEMENTARY":
        return "Tiểu học";
      case "MIDDLE_SCHOOL":
        return "THCS";
      case "HIGH_SCHOOL":
        return "THPT";
      case "UNIVERSITY":
        return "Đại học";
      default:
        return level;
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý môn học</h1>
        <p className="text-gray-600">
          Quản lý danh sách các môn học trong hệ thống
        </p>
      </div>

      {/* Search and Action buttons */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSubject(null);
            setShowCreateModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Thêm môn học mới
        </button>
      </div>

      {/* Subjects table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cấp độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gia sư
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học sinh
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
              {subjects && subjects.length > 0 ? (
                subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={subject.description}>
                        {subject.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryText(subject.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getLevelText(subject.level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.tutorCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.studentCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subject.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {subject.isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(subject)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggleActive(subject.id)}
                          className={`${
                            subject.isActive
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {subject.isActive ? "Tạm dừng" : "Kích hoạt"}
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Không có môn học nào
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSubject ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên môn học
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nhập tên môn học"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Nhập mô tả môn học"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Danh mục
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="ACADEMIC">Học thuật</option>
                      <option value="LANGUAGE">Ngôn ngữ</option>
                      <option value="ART">Nghệ thuật</option>
                      <option value="SPORT">Thể thao</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cấp độ
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="ELEMENTARY">Tiểu học</option>
                      <option value="MIDDLE_SCHOOL">THCS</option>
                      <option value="HIGH_SCHOOL">THPT</option>
                      <option value="UNIVERSITY">Đại học</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Kích hoạt
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSubject(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={
                    editingSubject ? handleUpdateSubject : handleCreateSubject
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingSubject ? "Cập nhật" : "Tạo"}
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

export default SubjectManagement;
