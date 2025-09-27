import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";

// Layouts
import { UserLayout } from "../components/layouts/UserLayout";
import { TutorLayout } from "../components/layouts/TutorLayout";
import { AdminLayout } from "../components/layouts/AdminLayout";
import { BookingProtectedRoute } from "../components/BookingProtectedRoute";

// Pages
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { NotFound } from "../pages/NotFound";
import { Unauthorized } from "../pages/Unauthorized";
import { DebugLogin } from "../pages/DebugLogin";
import BookingDemo from "../pages/BookingDemo";
import CloudinaryDemo from "../pages/CloudinaryDemo";

// User Pages
import TutorSearch from "../pages/user/TutorSearch";
import { BecomeTutor } from "../pages/user/BecomeTutor";
import Messages from "../pages/user/Messages";
import MySessions from "../pages/user/MySessions";
import { Settings } from "../pages/user/Settings";
import BookingDetail from "../pages/user/BookingDetail";
import CreateBooking from "../pages/user/CreateBooking";
import SingleBooking from "../pages/user/SingleBooking";
import PackageBookingForm from "../pages/user/PackageBookingForm";
import PackagePayment from "../pages/user/PackagePayment";
import BookingSuccess from "../pages/user/BookingSuccess";
import TutorDetail from "../pages/user/TutorDetail";

// Tutor Pages
import { TutorDashboard } from "../pages/tutor/TutorDashboard";
import { Schedule } from "../pages/tutor/Schedule";
import { StudentManagement } from "../pages/tutor/StudentManagement";
import { ProfileManagement } from "../pages/tutor/ProfileManagement";
import TutorBookings from "../pages/tutor/TutorBookings";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import { UserManagement } from "../pages/admin/UserManagement";
import { AdminProfileManagement } from "../pages/admin/ProfileManagement";
import { AdminMessages } from "../pages/admin/AdminMessages";
import CouponManagement from "../pages/admin/CouponManagement";
import PaymentManagement from "../pages/admin/PaymentManagement";
import BookingManagement from "../pages/admin/BookingManagement";

const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "debug-login",
        element: <DebugLogin />,
      },
      {
        path: "booking-demo",
        element: <BookingDemo />,
      },
      {
        path: "cloudinary-demo",
        element: <CloudinaryDemo />,
      },
      {
        path: "unauthorized",
        element: <Unauthorized />,
      },
      // Public routes
      {
        path: "find-tutor",
        element: <TutorSearch />,
      },
      {
        path: "become-tutor",
        element: <BecomeTutor />,
      },
      {
        path: "support",
        element: (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">Hỗ trợ</h1>
            <p className="text-gray-600 mt-2">
              Trang này đang được phát triển...
            </p>
          </div>
        ),
      },
      {
        path: "register",
        element: (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
            <p className="text-gray-600 mt-2">
              Trang này đang được phát triển...
            </p>
          </div>
        ),
      },
      // User routes
      {
        path: "messages",
        element: <Messages />,
      },
      {
        path: "my-sessions",
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT", "TUTOR", "ADMIN"]}>
            <MySessions />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "create-booking",
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <CreateBooking />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "single-booking",
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <SingleBooking />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "package-booking",
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <PackageBookingForm />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "package-payment",
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <PackagePayment />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "booking-success",
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <BookingSuccess />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "booking-detail/:id",
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <BookingDetail />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "tutor/:username",
        element: <TutorDetail />,
      },
      {
        path: "payments",
        element: (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">Thanh toán</h1>
            <p className="text-gray-600 mt-2">
              Trang này đang được phát triển...
            </p>
          </div>
        ),
      },
    ],
  },

  // Tutor routes
  {
    path: "/tutor",
    element: <TutorLayout />,
    children: [
      {
        index: true,
        element: <TutorDashboard />,
      },
      {
        path: "schedule",
        element: <Schedule />,
      },
      {
        path: "students",
        element: <StudentManagement />,
      },
      {
        path: "profile",
        element: <ProfileManagement />,
      },
      {
        path: "bookings",
        element: (
          <BookingProtectedRoute allowedRoles={["TUTOR"]}>
            <TutorBookings />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "earnings",
        element: (
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold">Thu nhập</h1>
            <p className="text-gray-600 mt-2">
              Trang này đang được phát triển...
            </p>
          </div>
        ),
      },
    ],
  },

  // Admin routes
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "profiles",
        element: <AdminProfileManagement />,
      },
      {
        path: "messages",
        element: <AdminMessages />,
      },
      {
        path: "bookings",
        element: (
          <BookingProtectedRoute allowedRoles={["ADMIN"]}>
            <BookingManagement />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "coupons",
        element: (
          <BookingProtectedRoute allowedRoles={["ADMIN"]}>
            <CouponManagement />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "payments",
        element: (
          <BookingProtectedRoute allowedRoles={["ADMIN"]}>
            <PaymentManagement />
          </BookingProtectedRoute>
        ),
      },
    ],
  },

  // 404 route
  {
    path: "*",
    element: <NotFound />,
  },
]);

export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};
