import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Không có quyền truy cập
          </h2>
          <p className="mt-2 text-gray-600">
            Bạn không có quyền truy cập vào trang này.
          </p>
          {user && (
            <p className="mt-2 text-sm text-gray-500">
              Tài khoản hiện tại: {user.name} (
              {user.role === "user"
                ? "Học viên"
                : user.role === "tutor"
                ? "Gia sư"
                : "Admin"}
              )
            </p>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {user ? (
            <>
              <Link
                to={
                  user.role === "admin"
                    ? "/admin"
                    : user.role === "tutor"
                    ? "/tutor"
                    : "/"
                }
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Về trang chính
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Đăng nhập
            </Link>
          )}

          <button
            onClick={() => window.history.back()}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};
