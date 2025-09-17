import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthContextType, UserRole } from "../types";
import type { User } from "../services/authService";
import authService from "../services/authService";

// Helper function to map backend role to frontend role
const mapRole = (backendRole: string): UserRole => {
  const role = backendRole.toLowerCase().replace("role_", "");
  switch (role) {
    case "student":
      return "STUDENT";
    case "tutor":
      return "TUTOR";
    case "admin":
      return "ADMIN";
    default:
      return "STUDENT";
  }
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra localStorage để khôi phục trạng thái đăng nhập
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      // Map role từ backend sang frontend
      savedUser.role = mapRole(savedUser.role);
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login({
        username: email,
        password: password,
      });

      // Lấy user từ localStorage sau khi login (authService đã lưu)
      const user = authService.getCurrentUser();
      if (user) {
        // Map role từ backend sang frontend
        user.role = mapRole(user.role);
        setUser(user);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
