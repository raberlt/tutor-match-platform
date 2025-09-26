import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "TUTOR" | "ADMIN";
  enable: boolean;
  createdAt: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      console.log("API Response:", data);

      // Xử lý response có thể là array hoặc paginated object
      let userData: User[] = [];
      if (Array.isArray(data)) {
        userData = data;
      } else if (data && Array.isArray(data.users)) {
        // Response với users array
        userData = data.users;
      } else if (data && Array.isArray(data.content)) {
        // Paginated response
        userData = data.content;
      } else if (data && Array.isArray(data.data)) {
        // Wrapped response
        userData = data.data;
      } else {
        console.error("Unexpected API response format:", data);
        setUsers([]);
        setError("Định dạng dữ liệu không đúng");
        return;
      }

      // Sắp xếp theo ngày tạo mới nhất
      const sortedUsers = userData.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setUsers(sortedUsers);
      setError(null);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Không thể tải danh sách người dùng");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "true" && user.enable) ||
      (filterStatus === "false" && !user.enable);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "TUTOR":
        return "bg-blue-100 text-blue-800";
      case "STUDENT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (enable: boolean) => {
    return enable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
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
            onClick={loadUsers}
            className="px-4 py-2 text-white rounded transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý người dùng
                </h1>
                <p className="text-sm text-gray-600">
                  Quản lý thông tin và trạng thái người dùng
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              className="text-white px-3 py-2 rounded-xl transition-colors"
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
              Thêm người dùng
            </button>
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
                    className="w-6 h-6"
                    style={{ color: "rgb(148, 204, 230)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng người dùng
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-xl shadow-sm border-l-4"
              style={{ borderLeftColor: "rgb(34, 197, 94)" }}
            >
              <div className="flex items-center">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                >
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gia sư</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.role === "TUTOR").length}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-xl shadow-sm border-l-4"
              style={{ borderLeftColor: "rgb(239, 68, 68)" }}
            >
              <div className="flex items-center">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                >
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bị khóa</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => !u.enable).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="STUDENT">Học viên</option>
                  <option value="TUTOR">Gia sư</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Bị khóa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách người dùng ({filteredUsers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                              style={{ backgroundColor: "rgb(148, 204, 230)" }}
                            >
                              {user.firstName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role === "STUDENT"
                            ? "Học viên"
                            : user.role === "TUTOR"
                            ? "Gia sư"
                            : "Admin"}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(
                            user.enable
                          )}`}
                        >
                          {user.enable ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button className="text-blue-600 hover:text-blue-900">
                            Xem
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900">
                            Sửa
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Khóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
