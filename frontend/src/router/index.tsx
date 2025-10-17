import { createBrowserRouter } from "react-router-dom";
import { BookingProtectedRoute } from "../components/BookingProtectedRoute";
import { UserLayout } from "../components/layouts/UserLayout";
import { TutorLayout } from "../components/layouts/TutorLayout";

// Public pages
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { NotFound } from "../pages/NotFound";
import { Unauthorized } from "../pages/Unauthorized";

// User pages
import { UserDashboard } from "../pages/user/UserDashboard";
import TutorSearch from "../pages/user/TutorSearch";
import Booking from "../pages/user/Booking";
import { BookingSuccess } from "../pages/user/BookingSuccess";
import PaymentPage from "../pages/user/PaymentPage";
import { BecomeTutor } from "../pages/user/BecomeTutor";
import Messages from "../pages/user/Messages";
import MySessions from "../pages/user/MySessions";
import { Settings } from "../pages/user/Settings";
import TutorDetail from "../pages/user/TutorDetail";
import BookingDetail from "../pages/user/BookingDetail";
import PackageBookingForm from "../pages/user/PackageBookingForm";
import PackagePayment from "../pages/user/PackagePayment";
import PaymentQR from "../pages/user/PaymentQR";

// Tutor pages
import { TutorDashboard } from "../pages/tutor/TutorDashboard";
import { Schedule } from "../pages/tutor/Schedule";
import { ProfileManagement } from "../pages/tutor/ProfileManagement";
import { TutorInbox } from "../pages/tutor/TutorInbox";
import TutorBookings from "../pages/tutor/TutorBookings";

// Admin pages (only import pages that exist and export correctly)
import UserManagement from "../pages/admin/UserManagement";
import { TutorApproval } from "../pages/admin/TutorApproval";

// Demo pages
import BookingDemo from "../pages/BookingDemo";
import CloudinaryDemo from "../pages/CloudinaryDemo";
import CreditDemo from "../pages/CreditDemo";
import { DebugLogin } from "../pages/DebugLogin";
import AdminLayout from "../components/layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },

  // User routes
  {
    path: "/user",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <UserDashboard />,
      },
      {
        path: "search",
        element: <TutorSearch />,
      },
      {
        path: "booking",
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <Booking />
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
        path: "payment",
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <PaymentPage />
          </BookingProtectedRoute>
        ),
      },
      {
        path: "become-tutor",
        element: <BecomeTutor />,
      },
      {
        path: "messages",
        element: <Messages />,
      },
      {
        path: "my-sessions",
        element: <MySessions />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "tutor/:id",
        element: <TutorDetail />,
      },
      {
        path: "booking/:id",
        element: <BookingDetail />,
      },
      {
        path: "package-booking",
        element: <PackageBookingForm />,
      },
      {
        path: "package-payment",
        element: <PackagePayment />,
      },
      {
        path: "payment-qr",
        element: <PaymentQR />,
      },
      {
        path: "bookings",
        element: <MySessions />,
      },
    ],
  },

  // Additional public routes that might be accessed directly
  {
    path: "/find-tutor",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <TutorSearch />,
      },
    ],
  },
  {
    path: "/become-tutor",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <BecomeTutor />,
      },
    ],
  },
  {
    path: "/messages",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <Messages />,
      },
    ],
  },
  {
    path: "/settings",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <Settings />,
      },
    ],
  },
  {
    path: "/my-sessions",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <MySessions />,
      },
    ],
  },
  {
    path: "/booking",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <Booking />
          </BookingProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/booking-success",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <BookingSuccess />
          </BookingProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/payment",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: (
          <BookingProtectedRoute allowedRoles={["STUDENT"]}>
            <PaymentPage />
          </BookingProtectedRoute>
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
        path: "profile",
        element: <ProfileManagement />,
      },
      {
        path: "inbox",
        element: <TutorInbox />,
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

  // Admin routes (wrapped in AdminLayout)
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "tutor-approval", element: <TutorApproval /> },
      { path: "profile", element: <TutorApproval /> },
      { path: "profiles", element: <TutorApproval /> },
      // Các trang dưới đây sẽ được bật khi có component hoàn chỉnh
      // { path: "applications", element: <ApplicationManagement /> },
      // { path: "bookings", element: <BookingManagement /> },
      // { path: "payments", element: <PaymentManagement /> },
      // { path: "coupons", element: <CouponManagement /> },
      // { path: "ratings", element: <RatingManagement /> },
      // { path: "schedule", element: <ScheduleManagement /> },
      // { path: "profile", element: <AdminProfileManagement /> },
      // { path: "messages", element: <AdminMessages /> },
      // { path: "contracts", element: <ContractManagement /> },
    ],
  },

  // Demo routes
  {
    path: "/demo/booking",
    element: <BookingDemo />,
  },
  {
    path: "/demo/cloudinary",
    element: <CloudinaryDemo />,
  },
  {
    path: "/demo/credit",
    element: <CreditDemo />,
  },
  {
    path: "/debug/login",
    element: <DebugLogin />,
  },

  // Catch all route
  {
    path: "*",
    element: <NotFound />,
  },
]);
