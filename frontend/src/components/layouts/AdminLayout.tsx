import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sidebarItems = [
    {
      name: "Tổng quan",
      href: "/admin",
      icon: (
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
      ),
    },
    {
      name: "Quản lý người dùng",
      href: "/admin/users",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="rgb(148, 204, 230)"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
      ),
    },
    {
      name: "Duyệt hồ sơ",
      href: "/admin/tutor-approval",
      icon: (
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
      ),
    },
    {
      name: "Doanh thu",
      href: "/admin/revenue",
      icon: (
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
    },
    {
      name: "Quản lý mã giảm giá",
      href: "/admin/coupons",
      icon: (
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
    {
      name: "Quản lý tin nhắn",
      href: "/admin/messages",
      icon: (
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed width and position */}
      <aside className="w-64 bg-white shadow-sm min-h-screen border-r flex-shrink-0 fixed left-0 top-0 z-10">
        <div className="p-6 h-full overflow-y-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgb(148, 204, 230)" }}
            >
              <span
                className="font-bold text-sm"
                style={{ color: "rgb(252, 243, 245)" }}
              >
                TM
              </span>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              TutorMatch
            </span>
          </Link>

          {/* User Info */}
          {user && (
            <div className="mb-6 relative" ref={userMenuRef}>
              <div
                className="p-3 rounded-lg cursor-pointer transition-colors hover:bg-opacity-20 bg-gray-50"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    {user.imageAvatar ? (
                      <img
                        src={user.imageAvatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-medium text-sm">
                          {(user.firstName || user.name || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.name || "Admin"}
                    </div>
                    <div className="text-xs text-gray-500">Quản trị viên</div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Đăng xuất</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Quản lý hệ thống
          </h2>
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? "bg-red-100 text-red-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content - Offset by sidebar width */}
      <main className="flex-1 ml-64 min-h-screen overflow-x-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default AdminLayout;
