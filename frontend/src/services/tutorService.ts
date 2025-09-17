import api from "./api";
import type {
  TutorProfile,
  TutorPreviewProfile,
  TutorSearchFilters,
  TutorSearchResponse,
  Subject,
} from "../types";

export const tutorService = {
  /**
   * Lấy danh sách môn học
   */
  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await api.get("/student/become-tutor/subjects");
      if (response.data.success) {
        return response.data.subjects;
      }
      throw new Error("Failed to load subjects");
    } catch (error: unknown) {
      console.error("Get subjects error:", error);
      throw new Error(
        (error as any).response?.data?.error || "Lấy danh sách môn học thất bại"
      );
    }
  },

  /**
   * Tìm kiếm gia sư cho guest (không cần đăng nhập)
   */
  async searchTutorPreviews(
    filters: TutorSearchFilters,
    page: number = 0,
    size: number = 20,
    sortBy: string = "id",
    sortDirection: string = "asc"
  ): Promise<TutorSearchResponse<TutorPreviewProfile>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection,
      });

      // Add filters to params
      if (filters.keyword) params.append("keyword", filters.keyword);
      if (filters.subjectId)
        params.append("subjectId", filters.subjectId.toString());
      if (filters.minFee) params.append("minFee", filters.minFee.toString());
      if (filters.maxFee) params.append("maxFee", filters.maxFee.toString());
      if (filters.minRating)
        params.append("minRating", filters.minRating.toString());
      if (filters.city) params.append("city", filters.city);

      const response = await api.get(`/public/tutors?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Search tutor previews error:", error);
      throw new Error(
        (error as any).response?.data?.error || "Tìm kiếm gia sư thất bại"
      );
    }
  },

  /**
   * Tìm kiếm gia sư cho student (cần đăng nhập)
   */
  async searchTutors(
    filters: TutorSearchFilters,
    page: number = 0,
    size: number = 20,
    sortBy: string = "id",
    sortDirection: string = "asc"
  ): Promise<TutorSearchResponse<TutorProfile>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection,
      });

      // Add filters to params
      if (filters.keyword) params.append("keyword", filters.keyword);
      if (filters.subjectId)
        params.append("subjectId", filters.subjectId.toString());
      if (filters.minFee) params.append("minFee", filters.minFee.toString());
      if (filters.maxFee) params.append("maxFee", filters.maxFee.toString());
      if (filters.minRating)
        params.append("minRating", filters.minRating.toString());
      if (filters.city) params.append("city", filters.city);

      const response = await api.get(`/tutors?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Search tutors error:", error);
      throw new Error(
        (error as any).response?.data?.error || "Tìm kiếm gia sư thất bại"
      );
    }
  },

  /**
   * Lấy chi tiết gia sư theo ID (cần đăng nhập)
   */
  async getTutorDetail(tutorId: number): Promise<TutorProfile> {
    try {
      const response = await api.get(`/tutors/${tutorId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Get tutor detail error:", error);
      throw new Error(
        (error as any).response?.data?.error || "Lấy chi tiết gia sư thất bại"
      );
    }
  },

  /**
   * Lấy thông tin hệ thống (public)
   */
  async getSystemInfo(): Promise<any> {
    try {
      const response = await api.get("/public/info");
      return response.data;
    } catch (error: unknown) {
      console.error("Get system info error:", error);
      throw new Error(
        (error as any).response?.data?.error ||
          "Lấy thông tin hệ thống thất bại"
      );
    }
  },

  /**
   * Đảm bảo có TutorProfile cho user hiện tại (tạo rỗng nếu chưa có) và trả về
   */
  async ensureMyTutorProfile(): Promise<any> {
    try {
      const response = await api.post(`/tutors/profile/ensure`);
      return response.data;
    } catch (error: unknown) {
      console.error("Ensure tutor profile error:", error);
      throw new Error(
        (error as Error & { response?: { data?: { error?: string } } })
          ?.response?.data?.error || "Không thể đảm bảo hồ sơ gia sư"
      );
    }
  },

  /**
   * Lấy hồ sơ gia sư của chính mình
   */
  async getMyTutorProfile(): Promise<any> {
    try {
      const response = await api.get(`/tutors/profile/me`);
      return response.data;
    } catch (error: unknown) {
      console.error("Get my tutor profile error:", error);
      throw new Error(
        (error as Error & { response?: { data?: { error?: string } } })
          ?.response?.data?.error || "Không thể lấy hồ sơ gia sư"
      );
    }
  },

  /**
   * Nộp hồ sơ gia sư (POST /api/student/become-tutor/apply)
   */
  async updateMyTutorProfile(payload: any): Promise<any> {
    try {
      const response = await api.post(`/student/become-tutor/apply`, payload);
      return response.data;
    } catch (error: unknown) {
      console.error("Update tutor profile error:", error);
      throw new Error(
        (error as Error & { response?: { data?: { error?: string } } })
          ?.response?.data?.error || "Cập nhật hồ sơ gia sư thất bại"
      );
    }
  },
};
