import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const TutorLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sidebarItems = [
    {
      name: "Dashboard",
      href: "/tutor",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
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
      name: "Lịch cá nhân",
      href: "/tutor/schedule",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "Quản lý đặt lịch",
      href: "/tutor/bookings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "Quản lý hồ sơ",
      href: "/tutor/profile",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm min-h-screen">
        <div className="p-6">
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
            <div
              className="mb-6 p-3 rounded-lg"
              style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  <span className="text-white font-medium text-sm">
                    {(user.name || user.firstName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {user.name ||
                      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                      "User"}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "rgb(148, 204, 230)" }}
                  >
                    Gia sư
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs transition-colors"
                style={{ color: "rgb(148, 204, 230)" }}
                onMouseEnter={(e) =>
                  (e.target.style.color = "rgb(100, 150, 200)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgb(148, 204, 230)")
                }
              >
                Đăng xuất
              </button>
            </div>
          )}

          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Bảng điều khiển Gia sư
          </h2>
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? "text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor:
                    location.pathname === item.href
                      ? "rgb(148, 204, 230)"
                      : "transparent",
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
