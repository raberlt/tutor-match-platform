import api from "./api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  expiresIn: number;
  profileComplete: boolean;
  role: string;
  type: string;
  userId: number;
  token: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageAvatar?: string | null;
}

export interface User {
  id: number;
  username: string;
  role: string;
  profileComplete: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageAvatar?: string | null;
}

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log("Attempting login with:", credentials);
      const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      console.log("Login response:", response.data);

      // Store token and user data in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
          role: response.data.role,
          profileComplete: response.data.profileComplete,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          imageAvatar: response.data.imageAvatar,
        })
      );

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        status: (
          error as Error & { response?: { status: number; data: unknown } }
        )?.response?.status,
        data: (
          error as Error & { response?: { status: number; data: unknown } }
        )?.response?.data,
      });
      throw error;
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  // Get user profile details
  async getUserProfile(): Promise<User | null> {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      console.error("Get user profile error:", error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(profileData: Partial<User>): Promise<User | null> {
    try {
      const response = await api.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Update user profile error:", error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    return !!token;
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

export default new AuthService();
