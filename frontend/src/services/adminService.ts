const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface ApplicationForReview {
  id: number;
  userId: number;
  applicationType: "BECOME_TUTOR" | "UPDATE_PROFILE";
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  headline?: string;
  experience?: string;
  teachingLevel?: string;
  phoneNumber?: string;
  address?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

export class AdminService {
  private static async makeRequest(
    endpoint: string,
    method: string = "GET",
    data?: unknown
  ): Promise<AdminResponse> {
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
      console.error("Admin service error:", error);
      return {
        success: false,
        message: "",
        error: error instanceof Error ? error.message : "Request failed",
      };
    }
  }

  // Lấy danh sách applications đang chờ review
  static async getApplicationsForReview(): Promise<{
    success: boolean;
    applications?: ApplicationForReview[];
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/admin/review`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications for review");
      }

      const applications = await response.json();
      return {
        success: true,
        applications,
      };
    } catch (error) {
      console.error("Error fetching applications for review:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch applications",
      };
    }
  }

  // Approve application
  static async approveApplication(
    applicationId: number
  ): Promise<AdminResponse> {
    return this.makeRequest(`admin/approve/${applicationId}`, "POST");
  }

  // Reject application với admin note
  static async rejectApplication(
    applicationId: number,
    adminNote?: string
  ): Promise<AdminResponse> {
    return this.makeRequest(`admin/reject/${applicationId}`, "POST", {
      adminNote,
    });
  }

  // Lấy chi tiết application
  static async getApplicationDetail(
    applicationId: number
  ): Promise<AdminResponse> {
    return this.makeRequest(`admin/detail/${applicationId}`, "GET");
  }

  // Lấy statistics về applications
  static async getApplicationStats(): Promise<{
    success: boolean;
    stats?: {
      totalApplications: number;
      pendingApplications: number;
      approvedApplications: number;
      rejectedApplications: number;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/admin/stats`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch application stats");
      }

      const stats = await response.json();
      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error("Error fetching application stats:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch stats",
      };
    }
  }
}
