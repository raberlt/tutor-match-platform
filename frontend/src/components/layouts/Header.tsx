import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getNavigationItems = () => {
    // Navigation for public pages (guests)
    if (!user) {
      return [
        { label: "Tìm gia sư", href: "/find-tutor" },
        { label: "Trở thành gia sư", href: "/become-tutor" },
      ];
    }

    // User navigation for logged-in users
    const baseNav = [{ label: "Hộp thư", href: "/messages" }];

    // Thêm navigation dựa trên role
    if (user.role === "STUDENT") {
      baseNav.unshift(
        { label: "Tìm gia sư", href: "/find-tutor" },
        { label: "Trở thành gia sư", href: "/become-tutor" }
      );
      baseNav.push({ label: "Buổi học của tôi", href: "/my-sessions" });
    } else if (user.role === "TUTOR") {
      baseNav.unshift(
        { label: "Tìm gia sư", href: "/find-tutor" },
        { label: "Trở thành gia sư", href: "/become-tutor" }
      );
      baseNav.push(
        { label: "Quản lý booking", href: "/tutor/bookings" },
        { label: "Lịch dạy", href: "/tutor/schedule" },
        { label: "Học sinh", href: "/tutor/students" }
      );
    } else if (user.role === "ADMIN") {
      baseNav.unshift(
        { label: "Tìm gia sư", href: "/find-tutor" },
        { label: "Trở thành gia sư", href: "/become-tutor" }
      );
      baseNav.push(
        { label: "Quản lý booking", href: "/admin/bookings" },
        { label: "Quản lý người dùng", href: "/admin/users" },
        { label: "Phê duyệt gia sư", href: "/admin/tutors" }
      );
    }

    return baseNav;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgb(148, 204, 230)" }}
            >
              <span
                className="font-black text-sm"
                style={{ color: "rgb(252, 243, 245)" }}
              >
                TM
              </span>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              TutorMatch
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {getNavigationItems().map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={index}
                  to={item.href}
                  className={`transition-colors px-3 py-2 rounded-lg ${
                    isActive
                      ? "hover:opacity-80"
                      : "text-gray-600 hover:opacity-80 hover:bg-opacity-10"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: "rgb(148, 204, 230)",
                          color: "rgb(252, 243, 245)",
                        }
                      : ({
                          "--hover-bg": "#94cce6",
                        } as React.CSSProperties)
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(148, 204, 230, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  >
                    {user.imageAvatar ? (
                      <img
                        src={user.imageAvatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="font-medium text-sm"
                        style={{ color: "rgb(252, 243, 245)" }}
                      >
                        {user.firstName?.charAt(0)?.toUpperCase() || ""}
                        {user.lastName?.charAt(0)?.toUpperCase() || ""}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
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
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Cài đặt
                    </Link>

                    {/* Nút chuyển sang giao diện khác */}
                    {user.role === "TUTOR" && (
                      <Link
                        to="/user-dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-3"
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
                        Chuyển sang giao diện học sinh
                      </Link>
                    )}

                    {user.role === "ADMIN" && (
                      <>
                        <Link
                          to="/tutor-dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          Chuyển sang giao diện gia sư
                        </Link>
                        <Link
                          to="/user-dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg
                            className="w-4 h-4 mr-3"
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
                          Chuyển sang giao diện học sinh
                        </Link>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
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
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    location.pathname === "/login"
                      ? "hover:opacity-80"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  style={
                    location.pathname === "/login"
                      ? {
                          backgroundColor: "rgb(148, 204, 230)",
                          color: "rgb(252, 243, 245)",
                        }
                      : {}
                  }
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    location.pathname === "/register"
                      ? "hover:opacity-80"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  style={
                    location.pathname === "/register"
                      ? {
                          backgroundColor: "rgb(148, 204, 230)",
                          color: "rgb(252, 243, 245)",
                        }
                      : {}
                  }
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
