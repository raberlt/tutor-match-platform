import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

interface BookingProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const BookingProtectedRoute: React.FC<BookingProtectedRouteProps> = ({
  children,
  allowedRoles = ["STUDENT", "TUTOR", "ADMIN"],
  requireAuth = true,
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Nếu không yêu cầu đăng nhập
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Nếu chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu role không được phép
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
