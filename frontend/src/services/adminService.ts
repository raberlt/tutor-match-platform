import api from "./api";

// Types
export interface DashboardStats {
  users: {
    totalUsers: number;
    totalTutors: number;
    activeUsers: number;
  };
  bookings: {
    totalBookings: number;
    todayBookings: number;
    pendingBookings: number;
    completedBookings: number;
  };
  applications: {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
  };
  systemHealth: {
    database: boolean;
    externalServices: boolean;
    uptime: string;
  };
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: string;
}

export interface Booking {
  id: number;
  studentName: string;
  tutorName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
  createdAt: string;
}

export interface Payment {
  id: number;
  bookingId: number;
  studentName: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

export interface Feedback {
  id: number;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  priority: string;
}

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  assignedTo: string;
}

class AdminService {
  // Dashboard APIs
  async getDashboardOverview() {
    const response = await api.get("/admin/dashboard/overview");
    return response.data;
  }

  async getSystemHealth() {
    const response = await api.get("/admin/dashboard/system-health");
    return response.data;
  }

  // User Management APIs
  async getUsers(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    role = null,
    search = null
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (role) params.append("role", role);
    if (search) params.append("search", search);

    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  }

  async getUserById(userId: number) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: number, userData: any) {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async toggleUserStatus(userId: number) {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  }

  async deleteUser(userId: number) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  }

  async getUserStatistics() {
    const response = await api.get("/admin/users/statistics");
    return response.data;
  }

  async getStudents(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    search = null
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (search) params.append("search", search);

    const response = await api.get(`/admin/users/students?${params}`);
    return response.data;
  }

  async getTutors(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    search = null
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (search) params.append("search", search);

    const response = await api.get(`/admin/users/tutors?${params}`);
    return response.data;
  }

  // Booking Management APIs
  async getBookings(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    status?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });

    if (status) {
      params.append("status", status);
    }

    const response = await api.get(`/admin/bookings?${params}`);
    return response.data;
  }

  async getBookingById(bookingId: number) {
    const response = await api.get(`/admin/bookings/${bookingId}`);
    return response.data;
  }

  async updateBookingStatus(
    bookingId: number,
    status: string,
    adminNote?: string
  ) {
    const response = await api.put(`/admin/bookings/${bookingId}/status`, {
      status,
      adminNote,
    });
    return response.data;
  }

  async cancelBooking(
    bookingId: number,
    cancelReason?: string,
    adminNote?: string
  ) {
    const response = await api.put(`/admin/bookings/${bookingId}/cancel`, {
      cancelReason,
      adminNote,
    });
    return response.data;
  }

  async deleteBooking(bookingId: number) {
    const response = await api.delete(`/admin/bookings/${bookingId}`);
    return response.data;
  }

  async getBookingsByDate(date: string) {
    const response = await api.get(`/admin/bookings/date/${date}`);
    return response.data;
  }

  async getTodayBookings() {
    const response = await api.get("/admin/bookings/today");
    return response.data;
  }

  async getBookingStats() {
    const response = await api.get("/admin/bookings/stats");
    return response.data;
  }

  // Tutor Application APIs
  async getApplicationsForReview() {
    const response = await api.get("/admin/tutor-applications");
    return response.data;
  }

  async approveApplication(applicationId: number) {
    const response = await api.post(
      `/applications/admin/approve/${applicationId}`
    );
    return response.data;
  }

  async rejectApplication(applicationId: number, reason: string) {
    const response = await api.post(
      `/applications/admin/reject/${applicationId}`,
      null,
      {
        params: { reason },
      }
    );
    return response.data;
  }

  // Financial Management APIs
  async getFinancialBookings(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    status = null,
    search = null
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    const response = await api.get(`/admin/financial/bookings?${params}`);
    return response.data;
  }

  async cancelFinancialBooking(bookingId: number, reason = null) {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    const response = await api.put(
      `/admin/financial/bookings/${bookingId}/cancel${params}`
    );
    return response.data;
  }

  async getPaymentHistory(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    status = null
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (status) params.append("status", status);

    const response = await api.get(`/admin/financial/payments?${params}`);
    return response.data;
  }

  async getFinancialCoupons(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    status = null
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (status) params.append("status", status);

    const response = await api.get(`/admin/financial/coupons?${params}`);
    return response.data;
  }

  async createFinancialCoupon(couponData: any) {
    const response = await api.post("/admin/financial/coupons", couponData);
    return response.data;
  }

  async updateFinancialCoupon(couponId: number, couponData: any) {
    const response = await api.put(
      `/admin/financial/coupons/${couponId}`,
      couponData
    );
    return response.data;
  }

  async exportFinancialReport(
    startDate: string,
    endDate: string,
    format = "json"
  ) {
    const response = await api.get(
      `/admin/financial/reports/financial?startDate=${startDate}&endDate=${endDate}&format=${format}`
    );
    return response.data;
  }

  // Notification Management APIs
  async sendBroadcastNotification(notificationData: any) {
    const response = await api.post(
      "/admin/notifications/broadcast",
      notificationData
    );
    return response.data;
  }

  async sendGroupNotification(notificationData: any) {
    const response = await api.post(
      "/admin/notifications/group",
      notificationData
    );
    return response.data;
  }

  async sendPromotionalNotification(notificationData: any) {
    const response = await api.post(
      "/admin/notifications/promotional",
      notificationData
    );
    return response.data;
  }

  async getFeedback(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    status = null
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (status) params.append("status", status);

    const response = await api.get(`/admin/notifications/feedback?${params}`);
    return response.data;
  }

  async resolveFeedback(feedbackId: number, resolutionData: any) {
    const response = await api.put(
      `/admin/notifications/feedback/${feedbackId}/resolve`,
      resolutionData
    );
    return response.data;
  }

  async getSupportTickets(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    status = null
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (status) params.append("status", status);

    const response = await api.get(`/admin/notifications/support?${params}`);
    return response.data;
  }

  async updateSupportTicket(ticketId: number, updateData: any) {
    const response = await api.put(
      `/admin/notifications/support/${ticketId}`,
      updateData
    );
    return response.data;
  }

  async getNotificationStatistics() {
    const response = await api.get("/admin/notifications/statistics");
    return response.data;
  }

  // Coupon Management APIs
  async getCoupons(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    status?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (status) params.append("status", status);

    const response = await api.get(`/admin/coupons?${params}`);
    return response.data;
  }

  async createCoupon(couponData: any) {
    const response = await api.post("/admin/coupons", couponData);
    return response.data;
  }

  async updateCoupon(couponId: number, couponData: any) {
    const response = await api.put(`/admin/coupons/${couponId}`, couponData);
    return response.data;
  }

  async deleteCoupon(couponId: number) {
    const response = await api.delete(`/admin/coupons/${couponId}`);
    return response.data;
  }

  async getCouponStatistics() {
    const response = await api.get("/admin/coupons/statistics");
    return response.data;
  }

  // Payment Management APIs
  async getPayments(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    status?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (status) params.append("status", status);

    const response = await api.get(`/admin/payments?${params}`);
    return response.data;
  }

  async resolvePaymentIssue(paymentId: number, action: string, note?: string) {
    const response = await api.put(
      `/admin/payments/${paymentId}/resolve`,
      null,
      {
        params: { action, note },
      }
    );
    return response.data;
  }

  async getRevenueStatistics() {
    const response = await api.get("/admin/payments/revenue/statistics");
    return response.data;
  }

  // Contract Management APIs
  async getContracts(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    status?: string,
    search?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    const response = await api.get(`/admin/contracts?${params}`);
    return response.data;
  }

  async createContract(contractData: any) {
    const response = await api.post("/admin/contracts", contractData);
    return response.data;
  }

  async updateContract(contractId: number, contractData: any) {
    const response = await api.put(
      `/admin/contracts/${contractId}`,
      contractData
    );
    return response.data;
  }

  async changeContractStatus(contractId: number, status: string) {
    const response = await api.put(
      `/admin/contracts/${contractId}/status`,
      null,
      {
        params: { status },
      }
    );
    return response.data;
  }

  async deleteContract(contractId: number) {
    const response = await api.delete(`/admin/contracts/${contractId}`);
    return response.data;
  }

  // Review Management APIs
  async getReviews(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    rating?: string,
    status?: string,
    search?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (rating) params.append("rating", rating);
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    const response = await api.get(`/admin/reviews?${params}`);
    return response.data;
  }

  async toggleReviewVerification(reviewId: number) {
    const response = await api.put(`/admin/reviews/${reviewId}/verification`);
    return response.data;
  }

  async toggleReviewVisibility(reviewId: number) {
    const response = await api.put(`/admin/reviews/${reviewId}/visibility`);
    return response.data;
  }

  async addReviewResponse(
    reviewId: number,
    responseData: { response: string }
  ) {
    const response = await api.put(
      `/admin/reviews/${reviewId}/response`,
      responseData
    );
    return response.data;
  }

  async deleteReview(reviewId: number) {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  }

  async getReviewStatistics() {
    const response = await api.get("/admin/reviews/statistics");
    return response.data;
  }

  // Subject Management APIs
  async getSubjects(
    page = 0,
    size = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    category?: string,
    level?: string,
    search?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    if (category) params.append("category", category);
    if (level) params.append("level", level);
    if (search) params.append("search", search);

    const response = await api.get(`/admin/subjects?${params}`);
    return response.data;
  }

  async createSubject(subjectData: any) {
    const response = await api.post("/admin/subjects", subjectData);
    return response.data;
  }

  async updateSubject(subjectId: number, subjectData: any) {
    const response = await api.put(`/admin/subjects/${subjectId}`, subjectData);
    return response.data;
  }

  async toggleSubjectStatus(subjectId: number) {
    const response = await api.put(
      `/admin/subjects/${subjectId}/toggle-status`
    );
    return response.data;
  }

  async deleteSubject(subjectId: number) {
    const response = await api.delete(`/admin/subjects/${subjectId}`);
    return response.data;
  }

  async getSubjectStatistics() {
    const response = await api.get("/admin/subjects/statistics");
    return response.data;
  }

  // Verify Education
  async verifyEducation(educationId: number, isVerified: boolean) {
    const response = await api.put(`/admin/educations/${educationId}/verify`, {
      isVerified,
    });
    return response.data;
  }

  // Verify Certificate
  async verifyCertificate(certificateId: number, isVerified: boolean) {
    const response = await api.put(
      `/admin/certificates/${certificateId}/verify`,
      {
        isVerified,
      }
    );
    return response.data;
  }
}

export const adminService = new AdminService();
export { AdminService };

// Application types
export interface ApplicationForReview {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  headline?: string;
  bio?: string;
  experience?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  educations?: any[];
  certificates?: any[];
  schedules?: any[];
  subjectFees?: any[];
  teachingAudiences?: string[];
}
