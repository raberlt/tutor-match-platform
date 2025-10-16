import api from "./api";
import type {
  BookingRequestCreateDTO,
  BookingListResponse,
  BookingCreateResponse,
  BookingStats,
  BookingSystemInfo,
  BookingType,
  BookingStatus,
  Booking,
} from "../types";

export const bookingService = {
  /**
   * Lấy thông tin hệ thống booking
   */
  async getBookingSystemInfo(): Promise<BookingSystemInfo> {
    try {
      const response = await api.get("/booking/info");
      return response.data;
    } catch (error: unknown) {
      console.error("Get booking system info error:", error);
      throw new Error(
        (error as any).response?.data?.message ||
          "Lấy thông tin hệ thống thất bại"
      );
    }
  },

  /**
   * Lấy danh sách loại booking
   */
  async getBookingTypes(): Promise<BookingType[]> {
    try {
      const response = await api.get("/booking/types");
      return response.data;
    } catch (error: unknown) {
      console.error("Get booking types error:", error);
      throw new Error(
        (error as any).response?.data?.message ||
          "Lấy danh sách loại booking thất bại"
      );
    }
  },

  /**
   * Lấy danh sách trạng thái booking
   */
  async getBookingStatuses(): Promise<BookingStatus[]> {
    try {
      const response = await api.get("/booking/statuses");
      return response.data;
    } catch (error: unknown) {
      console.error("Get booking statuses error:", error);
      throw new Error(
        (error as any).response?.data?.message ||
          "Lấy danh sách trạng thái booking thất bại"
      );
    }
  },

  /**
   * Tạo booking mới (chỉ student)
   */
  async createBooking(
    request: BookingRequestCreateDTO
  ): Promise<BookingCreateResponse> {
    try {
      const response = await api.post("/booking/student/create", request);
      return response.data;
    } catch (error: unknown) {
      console.error("Create booking error:", error);
      throw new Error(
        (error as any).response?.data?.message || "Tạo booking thất bại"
      );
    }
  },

  /**
   * Lấy danh sách booking của student
   */
  async getMyBookings(
    page: number = 0,
    size: number = 20,
    status?: BookingStatus
  ): Promise<BookingListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/api/booking/student/my-bookings?${params.toString()}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Get bookings error:", error);
      throw new Error(
        error.response?.data?.message || "Lấy danh sách booking thất bại"
      );
    }
  },

  /**
   * Lấy booking của student theo trạng thái
   */
  async getMyBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    try {
      const response = await api.get(
        `/api/booking/student/my-bookings/status/${status}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Get bookings by status error:", error);
      throw new Error(
        error.response?.data?.message ||
          "Lấy danh sách booking theo trạng thái thất bại"
      );
    }
  },

  /**
   * Lấy thống kê booking của student
   */
  async getStudentBookingStats(): Promise<BookingStats> {
    try {
      const response = await api.get("/booking/student/stats");
      return response.data;
    } catch (error: unknown) {
      console.error("Get student booking stats error:", error);
      throw new Error(
        error.response?.data?.message || "Lấy thống kê booking thất bại"
      );
    }
  },

  /**
   * Lấy danh sách booking của tutor
   */
  async getTutorBookings(
    page: number = 0,
    size: number = 20,
    status?: BookingStatus
  ): Promise<BookingListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/api/booking/tutor/my-bookings?${params.toString()}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Get tutor bookings error:", error);
      throw new Error(
        error.response?.data?.message || "Lấy danh sách booking thất bại"
      );
    }
  },

  /**
   * Lấy booking của tutor theo trạng thái
   */
  async getTutorBookingsByStatus(
    status: BookingStatus,
    page: number = 0,
    size: number = 20
  ): Promise<BookingListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      const response = await api.get(
        `/api/booking/tutor/my-bookings/status/${status}?${params.toString()}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Get tutor bookings by status error:", error);
      throw new Error(
        error.response?.data?.message ||
          "Lấy danh sách booking theo trạng thái thất bại"
      );
    }
  },

  /**
   * Lấy thống kê booking của tutor
   */
  async getTutorBookingStats(): Promise<BookingStats> {
    try {
      const response = await api.get("/booking/tutor/stats");
      return response.data;
    } catch (error: unknown) {
      console.error("Get tutor booking stats error:", error);
      throw new Error(
        error.response?.data?.message || "Lấy thống kê booking thất bại"
      );
    }
  },

  /**
   * Lấy tất cả booking (chỉ admin)
   */
  async getAllBookings(
    page: number = 0,
    size: number = 20,
    status?: BookingStatus
  ): Promise<BookingListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/api/booking/admin/all?${params.toString()}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Get all bookings error:", error);
      throw new Error(
        error.response?.data?.message || "Lấy danh sách booking thất bại"
      );
    }
  },

  /**
   * Lấy thống kê booking của admin
   */
  async getAdminBookingStats(): Promise<BookingStats> {
    try {
      const response = await api.get("/booking/admin/stats");
      return response.data;
    } catch (error: unknown) {
      console.error("Get admin booking stats error:", error);
      throw new Error(
        error.response?.data?.message || "Lấy thống kê booking thất bại"
      );
    }
  },

  /**
   * Lấy chi tiết booking của student
   */
  async getStudentBookingDetail(bookingId: number): Promise<Booking> {
    try {
      const response = await api.get(`/api/booking/student/${bookingId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Get student booking detail error:", error);
      throw new Error(
        error.response?.data?.message || "Lấy chi tiết booking thất bại"
      );
    }
  },

  /**
   * Lấy chi tiết booking của tutor
   */
  async getTutorBookingDetail(bookingId: number): Promise<Booking> {
    try {
      const response = await api.get(`/api/booking/tutor/${bookingId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Get tutor booking detail error:", error);
      throw new Error(
        error.response?.data?.message || "Lấy chi tiết booking thất bại"
      );
    }
  },

  /**
   * Lấy chi tiết booking của admin
   */
  async getAdminBookingDetail(bookingId: number): Promise<Booking> {
    try {
      const response = await api.get(`/api/booking/admin/${bookingId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Get admin booking detail error:", error);
      throw new Error(
        error.response?.data?.message || "Lấy chi tiết booking thất bại"
      );
    }
  },

  /**
   * Hủy booking (chỉ student cho booking của mình)
   */
  async cancelBooking(bookingId: number): Promise<{ message: string }> {
    try {
      const response = await api.put(
        `/api/booking/student/${bookingId}/cancel`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Cancel booking error:", error);
      throw new Error(
        (error as any).response?.data?.message || "Hủy booking thất bại"
      );
    }
  },

  /**
   * Chấp nhận booking (chỉ tutor cho PACKAGE booking)
   */
  async acceptBooking(bookingId: number): Promise<{ message: string }> {
    try {
      const response = await api.put(`/api/booking/tutor/${bookingId}/approve`);
      return response.data;
    } catch (error: unknown) {
      console.error("Accept booking error:", error);
      throw new Error(
        error.response?.data?.message || "Chấp nhận booking thất bại"
      );
    }
  },

  /**
   * Từ chối booking (chỉ tutor cho PACKAGE booking)
   */
  async rejectBooking(bookingId: number): Promise<{ message: string }> {
    try {
      const response = await api.put(`/api/booking/tutor/${bookingId}/reject`);
      return response.data;
    } catch (error: unknown) {
      console.error("Reject booking error:", error);
      throw new Error(
        error.response?.data?.message || "Từ chối booking thất bại"
      );
    }
  },

  /**
   * Cập nhật trạng thái booking (chỉ admin)
   */
  async updateBookingStatus(
    bookingId: number,
    status: BookingStatus
  ): Promise<{ message: string }> {
    try {
      const response = await api.put(
        `/api/booking/admin/${bookingId}/status?status=${status}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Update booking status error:", error);
      throw new Error(
        error.response?.data?.message || "Cập nhật trạng thái booking thất bại"
      );
    }
  },

  /**
   * Xóa booking (chỉ admin)
   */
  async deleteBooking(bookingId: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/api/booking/admin/${bookingId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Delete booking error:", error);
      throw new Error(error.response?.data?.message || "Xóa booking thất bại");
    }
  },

  /**
   * Tạo package booking
   */
  async createPackageBooking(
    bookingData: any
  ): Promise<{ message: string; bookingId: number }> {
    try {
      const response = await api.post("/api/booking/package", bookingData);
      return response.data;
    } catch (error: unknown) {
      console.error("Create package booking error:", error);
      throw new Error(error.response?.data?.message || "Tạo gói học thất bại");
    }
  },
};
