const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface Subject {
  id: number;
  name: string;
}

export interface TutorSearchFilters {
  keyword?: string;
  subjectId?: number;
  minFee?: number;
  maxFee?: number;
  minRating?: number;
  city?: string;
}

export interface TutorRegistrationData {
  // Step 1: Thông tin cơ bản
  fullName: string;
  phone: string;
  email: string;
  subjects: Array<{ name: string; hourlyRate: string }>;
  provinces: string[];

  // Step 2: Ảnh đại diện & CV
  profileImageUrl?: string;
  cvFileUrl?: string;

  // Step 3: Chứng chỉ
  certificates: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: string;
    imageUrl?: string;
  }>;
  noCertificates: boolean;

  // Step 4: Học vấn
  degrees: Array<{
    degree: string;
    school: string;
    startYear: string;
    endYear: string;
    imageUrl?: string;
  }>;
  noDegrees: boolean;

  // Step 5: Giới thiệu
  title: string;
  introduction: string;
  experience: string;
  teachingMethods: string;
  targetStudents: string[];

  // Step 6: Video
  videoUrl?: string;

  // Step 7: Thời gian dạy
  dayTimeSlots: Record<string, Array<{ start: string; end: string }>>;
}

export interface TutorRegistrationResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

export class TutorService {
  private static async makeRequest(
    endpoint: string,
    method: string = "GET",
    data?: unknown
  ): Promise<TutorRegistrationResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/${endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: data ? JSON.stringify(data) : undefined,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Request failed");
      }

      return result;
    } catch (error) {
      console.error("Tutor service error:", error);
      return {
        success: false,
        message: "",
        error: error instanceof Error ? error.message : "Request failed",
      };
    }
  }

  // Lấy dữ liệu draft đã lưu
  static async getDraftData(): Promise<unknown> {
    try {
      const token = localStorage.getItem("token");
      console.log(
        "TutorService: Token from localStorage:",
        token ? "EXISTS" : "NOT FOUND"
      );

      // Kiểm tra có token không
      if (!token) {
        console.log("TutorService: No token found, returning error");
        return {
          success: false,
          hasDraft: false,
          message: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/applications/tutor/draft`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          redirect: "manual", // Không follow redirect tự động
        }
      );

      // Kiểm tra redirect (Spring Security redirect về login)
      if (response.status === 302 || response.status === 0) {
        console.warn("Server redirected, likely authentication failed");
        return {
          success: false,
          hasDraft: false,
          message: "Authentication required - redirected to login",
        };
      }

      // Kiểm tra authentication errors
      if (response.status === 401 || response.status === 403) {
        console.warn("Authentication failed, user may need to login again");
        return {
          success: false,
          hasDraft: false,
          message: "Authentication required",
        };
      }

      // Kiểm tra response type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Server trả về HTML thay vì JSON, có thể là lỗi server
        console.warn("Server returned non-JSON response, possibly error page");
        return {
          success: false,
          hasDraft: false,
          message: "Server error - non-JSON response",
        };
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to get draft data"
        );
      }

      return result;
    } catch (error) {
      console.error("Error getting draft data:", error);
      return {
        success: false,
        hasDraft: false,
        error:
          error instanceof Error ? error.message : "Failed to get draft data",
      };
    }
  }

  // Lưu nháp hồ sơ gia sư
  static async saveDraft(
    data: Partial<TutorRegistrationData>
  ): Promise<TutorRegistrationResponse> {
    // Filter out empty/invalid fields for draft
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => {
        // Keep non-empty strings, non-empty arrays, and non-null values
        if (typeof value === "string") return value.trim() !== "";
        if (Array.isArray(value)) return value.length > 0;
        if (value === null || value === undefined) return false;
        return true;
      })
    );

    // Use real endpoint with authentication
    return this.makeRequest("tutor/draft", "POST", cleanData);
  }

  // Gửi hồ sơ gia sư để duyệt
  static async submitApplication(
    data: TutorRegistrationData
  ): Promise<TutorRegistrationResponse> {
    // Use real endpoint with authentication
    return this.makeRequest("tutor/submit", "POST", data);
  }

  // Lấy hồ sơ gia sư hiện tại
  static async getCurrentProfile(): Promise<TutorRegistrationResponse> {
    return this.makeRequest("profile", "GET");
  }

  // Cập nhật hồ sơ gia sư
  static async updateProfile(
    data: Partial<TutorRegistrationData>
  ): Promise<TutorRegistrationResponse> {
    return this.makeRequest("profile", "PUT", data);
  }

  // Lấy trạng thái hồ sơ
  static async getApplicationStatus(): Promise<TutorRegistrationResponse> {
    return this.makeRequest("status", "GET");
  }

  // Hủy hồ sơ đang chờ duyệt
  static async cancelApplication(): Promise<TutorRegistrationResponse> {
    return this.makeRequest("cancel", "POST");
  }

  // Lấy chi tiết gia sư
  static async getTutorDetail(tutorId: number): Promise<unknown> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tutors/${tutorId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tutor detail");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching tutor detail:", error);
      throw error;
    }
  }

  // Lấy danh sách môn học
  static async getSubjects(): Promise<Subject[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/subjects`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }

      const data = await response.json();
      return data.subjects || [];
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  }

  // Tìm kiếm gia sư (cho user đã đăng nhập)
  static async searchTutors(
    filters: TutorSearchFilters,
    page: number = 1,
    size: number = 10,
    sortBy: string = "createdAt",
    sortDirection: string = "desc"
  ): Promise<{
    content: unknown[];
    totalPages: number;
    currentPage: number;
    totalElements: number;
  }> {
    try {
      const params = new URLSearchParams();
      params.append("page", Math.max(0, page - 1).toString()); // Convert to 0-based index, ensure >= 0
      params.append("size", size.toString());
      params.append("sortBy", sortBy);
      params.append("sortDirection", sortDirection);

      if (filters.keyword) {
        params.append("keyword", filters.keyword);
      }
      if (filters.subjectId !== undefined) {
        params.append("subjectId", filters.subjectId.toString());
      }
      if (filters.minFee !== undefined) {
        params.append("minFee", filters.minFee.toString());
      }
      if (filters.maxFee !== undefined) {
        params.append("maxFee", filters.maxFee.toString());
      }
      if (filters.city) {
        params.append("city", filters.city);
      }
      if (filters.minRating !== undefined) {
        params.append("minRating", filters.minRating.toString());
      }

      const response = await fetch(`${API_BASE_URL}/api/tutors?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to search tutors");
      }

      return await response.json();
    } catch (error) {
      console.error("Error searching tutors:", error);
      return { content: [], totalPages: 0, currentPage: 1, totalElements: 0 };
    }
  }

  // Tìm kiếm gia sư preview (cho user chưa đăng nhập)
  static async searchTutorPreviews(
    filters: TutorSearchFilters,
    page: number = 1,
    size: number = 10,
    sortBy: string = "id",
    sortDirection: string = "asc"
  ): Promise<{
    content: unknown[];
    totalPages: number;
    currentPage: number;
    totalElements: number;
  }> {
    try {
      const params = new URLSearchParams();
      params.append("page", Math.max(0, page - 1).toString()); // Convert to 0-based index, ensure >= 0
      params.append("size", size.toString());
      params.append("sortBy", sortBy);
      params.append("sortDirection", sortDirection);

      if (filters.keyword) {
        params.append("keyword", filters.keyword);
      }
      if (filters.subjectId !== undefined) {
        params.append("subjectId", filters.subjectId.toString());
      }
      if (filters.minFee !== undefined) {
        params.append("minFee", filters.minFee.toString());
      }
      if (filters.maxFee !== undefined) {
        params.append("maxFee", filters.maxFee.toString());
      }
      if (filters.city) {
        params.append("city", filters.city);
      }
      if (filters.minRating !== undefined) {
        params.append("minRating", filters.minRating.toString());
      }

      const response = await fetch(
        `${API_BASE_URL}/api/public/tutors?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search tutor previews");
      }

      const data = await response.json();
      return {
        content: data.content || [],
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || 0,
        totalElements: data.totalElements || 0,
      };
    } catch (error) {
      console.error("Error searching tutor previews:", error);
      return { content: [], totalPages: 0, currentPage: 0, totalElements: 0 };
    }
  }
}
