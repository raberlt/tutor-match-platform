// Authentication and API utilities for TutorMatch

class AuthManager {
  constructor() {
    this.token = this.getToken();
    this.user = this.getUser();
    this.init();
  }

  init() {
    this.checkTokenExpiry();
    this.setupAuthInterceptors();
  }

  // Token Management
  getToken() {
    return (
      localStorage.getItem("jwt_token") || sessionStorage.getItem("jwt_token")
    );
  }

  setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem("jwt_token", token);
      sessionStorage.removeItem("jwt_token");
    } else {
      sessionStorage.setItem("jwt_token", token);
      localStorage.removeItem("jwt_token");
    }
    this.token = token;
  }

  removeToken() {
    localStorage.removeItem("jwt_token");
    sessionStorage.removeItem("jwt_token");
    this.token = null;
    this.user = null;
  }

  // User Management
  getUser() {
    const userStr =
      localStorage.getItem("user_info") || sessionStorage.getItem("user_info");
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user, remember = false) {
    const userStr = JSON.stringify(user);
    if (remember) {
      localStorage.setItem("user_info", userStr);
      sessionStorage.removeItem("user_info");
    } else {
      sessionStorage.setItem("user_info", userStr);
      localStorage.removeItem("user_info");
    }
    this.user = user;
  }

  removeUser() {
    localStorage.removeItem("user_info");
    sessionStorage.removeItem("user_info");
    this.user = null;
  }

  // Authentication State
  isAuthenticated() {
    return !!this.token && !this.isTokenExpired();
  }

  isTokenExpired() {
    if (!this.token) return true;

    try {
      const payload = JSON.parse(atob(this.token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error parsing token:", error);
      return true;
    }
  }

  checkTokenExpiry() {
    if (this.token && this.isTokenExpired()) {
      this.logout();
      if (window.location.pathname !== "/showLogin") {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/showLogin";
      }
    }
  }

  // Auth Actions
  async login(credentials, rememberMe = false) {
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // API response structure: { token, type, username, role, expiresIn, userId, profileComplete }
        this.setToken(data.token, rememberMe);

        // Create user object from response
        const user = {
          id: data.userId,
          username: data.username,
          role: data.role,
          profileComplete: data.profileComplete,
        };

        this.setUser(user, rememberMe);
        return { success: true, user: user };
      } else {
        // API trả về error message
        return {
          success: false,
          message: data.error || data.message || "Đăng nhập thất bại",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Có lỗi xảy ra khi đăng nhập" };
    }
  }

  async register(userData) {
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Có lỗi xảy ra khi đăng ký" };
    }
  }

  logout() {
    this.removeToken();
    this.removeUser();

    // Clear any other user-specific data
    localStorage.removeItem("user_preferences");
    sessionStorage.removeItem("user_preferences");

    // Redirect to login if not already there
    if (
      window.location.pathname !== "/showLogin" &&
      window.location.pathname !== "/"
    ) {
      window.location.href = "/showLogin";
    }
  }

  // API Interceptors
  setupAuthInterceptors() {
    // Override fetch to automatically add auth headers
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, config = {}] = args;

      // Skip auth for public endpoints
      if (this.isPublicEndpoint(url)) {
        return originalFetch(url, config);
      }

      // Add auth header if user is authenticated
      if (this.isAuthenticated()) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${this.token}`,
        };
      }

      const response = await originalFetch(url, config);

      // Handle 401 responses
      if (response.status === 401) {
        this.logout();
        throw new Error("Unauthorized");
      }

      return response;
    };
  }

  isPublicEndpoint(url) {
    const publicEndpoints = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/public/",
      "/showLogin",
      "/register",
    ];

    return publicEndpoints.some((endpoint) => url.includes(endpoint));
  }

  // User Role Checks
  hasRole(role) {
    return this.user && this.user.role === role;
  }

  isStudent() {
    return this.hasRole("STUDENT");
  }

  isTutor() {
    return this.hasRole("TUTOR");
  }

  isAdmin() {
    return this.hasRole("ADMIN");
  }

  // Redirect based on role
  redirectToRoleDashboard() {
    if (this.isAdmin()) {
      window.location.href = "/admin/dashboard";
    } else if (this.isTutor()) {
      window.location.href = "/tutor/dashboard";
    } else if (this.isStudent()) {
      window.location.href = "/student/dashboard";
    } else {
      window.location.href = "/";
    }
  }
}

// API Helper Class
class ApiClient {
  constructor(authManager) {
    this.auth = authManager;
    this.baseUrl = "http://localhost:8080";
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    if (this.auth.isAuthenticated()) {
      config.headers.Authorization = `Bearer ${this.auth.token}`;
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.auth.logout();
        throw new Error("Unauthorized");
      }

      const data = await response.json();
      return { response, data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const url = new URL(endpoint, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    });

    return this.request(url.pathname + url.search);
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

// Form Helper Class
class FormHelper {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^[0-9]{9,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  }

  static validatePassword(password) {
    return password.length >= 6;
  }

  static showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add("is-invalid");

      // Remove existing error message
      const existingError = field.parentNode.querySelector(".invalid-feedback");
      if (existingError) {
        existingError.remove();
      }

      // Add new error message
      const errorDiv = document.createElement("div");
      errorDiv.className = "invalid-feedback";
      errorDiv.textContent = message;
      field.parentNode.appendChild(errorDiv);
    }
  }

  static clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove("is-invalid");
      const errorDiv = field.parentNode.querySelector(".invalid-feedback");
      if (errorDiv) {
        errorDiv.remove();
      }
    }
  }

  static clearAllErrors(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.querySelectorAll(".is-invalid").forEach((field) => {
        field.classList.remove("is-invalid");
      });
      form.querySelectorAll(".invalid-feedback").forEach((error) => {
        error.remove();
      });
    }
  }

  static getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }
}

// Notification Helper
class NotificationManager {
  static show(message, type = "info", duration = 5000) {
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    document.body.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  }

  static success(message) {
    this.show(message, "success");
  }

  static error(message) {
    this.show(message, "danger");
  }

  static warning(message) {
    this.show(message, "warning");
  }

  static info(message) {
    this.show(message, "info");
  }
}

// Global utilities
window.formatCurrency = function (amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

window.formatDate = function (dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

window.formatDateTime = function (dateTimeStr) {
  if (!dateTimeStr) return "N/A";
  return new Date(dateTimeStr).toLocaleString("vi-VN");
};

window.debounce = function (func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Initialize global instances
window.authManager = new AuthManager();
window.apiClient = new ApiClient(window.authManager);
window.notifications = NotificationManager;

// Check auth on page load
document.addEventListener("DOMContentLoaded", function () {
  // Auto-refresh token every 55 minutes (before 60min expiry)
  setInterval(() => {
    window.authManager.checkTokenExpiry();
  }, 55 * 60 * 1000);

  // Update UI based on auth state
  updateAuthUI();
});

function updateAuthUI() {
  const isAuth = window.authManager.isAuthenticated();
  const user = window.authManager.user;

  // Update login/logout buttons
  const loginBtn = document.querySelector(".btn-login");
  const logoutBtn = document.querySelector(".btn-logout");
  const userInfo = document.querySelector(".user-info");

  if (loginBtn) loginBtn.style.display = isAuth ? "none" : "inline-block";
  if (logoutBtn) logoutBtn.style.display = isAuth ? "inline-block" : "none";

  if (userInfo && user) {
    userInfo.textContent = user.username || "User";
  }

  // Redirect unauthenticated users from protected pages
  const protectedPaths = [
    "/student/",
    "/tutor/",
    "/admin/",
    "/profile",
    "/my-sessions",
  ];
  const currentPath = window.location.pathname;

  if (!isAuth && protectedPaths.some((path) => currentPath.startsWith(path))) {
    window.location.href = "/showLogin";
  }
}

// Export for ES6 modules (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    AuthManager,
    ApiClient,
    FormHelper,
    NotificationManager,
  };
}
