import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Profile form
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
    phoneNumber: user?.phoneNumber || "",
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
    address: user?.address || "",
    educationLevel: user?.educationLevel || "INDEPENDENT_LEARNER",
    avatar: user?.imageAvatar || "",
  });

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Danh sách 63 tỉnh thành Việt Nam
  const vietnamProvinces = [
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bạc Liêu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Tĩnh",
    "Hải Dương",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
    "Hà Nội",
    "TP. Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
  ];

  // Load user profile data from API
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        if (response.data.success) {
          const userData = response.data.data;
          setProfileData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            username: userData.username || "",
            phoneNumber: userData.phoneNumber || "",
            dateOfBirth: userData.dateOfBirth || "",
            gender: userData.gender || "",
            address: userData.address || "",
            educationLevel: userData.educationLevel || "INDEPENDENT_LEARNER",
            avatar: userData.imageAvatar || "",
          });
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        // Fallback to user data from context if API fails
        if (user) {
          setProfileData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            username: user.username || "",
            phoneNumber: user.phoneNumber || "",
            dateOfBirth: user.dateOfBirth || "",
            gender: user.gender || "",
            address: user.address || "",
            educationLevel: user.educationLevel || "INDEPENDENT_LEARNER",
            avatar: user.imageAvatar || "",
          });
        }
      }
    };

    loadUserProfile();
  }, [user]);

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Payment form
  const [paymentData, setPaymentData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Tạo object data không bao gồm email vì email không thể chỉnh sửa
      const { email, ...updateData } = profileData;

      // Nếu có avatar file mới, upload trước
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const avatarResponse = await api.post("/auth/upload-avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updateData.avatar = avatarResponse.data.avatarUrl;
      }

      await api.put("/auth/profile", updateData);
      setMessage("Cập nhật thông tin thành công!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Cập nhật thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage("Đổi mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Đổi mật khẩu thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await api.put("/auth/payment-info", paymentData);
      setMessage("Cập nhật thông tin thanh toán thành công!");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Cập nhật thông tin thanh toán thất bại"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/auth/forgot-password", { email: user?.email });
      setMessage("Email khôi phục mật khẩu đã được gửi!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Gửi email khôi phục thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4">
        {/* Header
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⚙️ Cài đặt tài khoản
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân, bảo mật và thanh toán của bạn
          </p>
        </div> */}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-3 px-4 text-center font-semibold text-base transition-all duration-200 ${
                activeTab === "profile"
                  ? "text-white border-b-2 border-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              style={{
                backgroundColor:
                  activeTab === "profile"
                    ? "rgb(148, 204, 230)"
                    : "transparent",
              }}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex-1 py-3 px-4 text-center font-semibold text-base transition-all duration-200 ${
                activeTab === "password"
                  ? "text-white border-b-2 border-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              style={{
                backgroundColor:
                  activeTab === "password"
                    ? "rgb(148, 204, 230)"
                    : "transparent",
              }}
            >
              Đổi mật khẩu
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`flex-1 py-3 px-4 text-center font-semibold text-base transition-all duration-200 ${
                activeTab === "payment"
                  ? "text-white border-b-2 border-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              style={{
                backgroundColor:
                  activeTab === "payment"
                    ? "rgb(148, 204, 230)"
                    : "transparent",
              }}
            >
              Thanh toán
            </button>
          </nav>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Thông tin cá nhân
              </h2>
              <p className="text-gray-600 text-xs mt-1">
                Cập nhật thông tin cơ bản của bạn
              </p>
            </div>

            <div className="p-4">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {/* Avatar Section - Top Center */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <img
                      src={
                        avatarPreview ||
                        profileData.avatar ||
                        "/default-avatar.png"
                      }
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    {avatarPreview && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="text-xs text-gray-600 hover:text-gray-800 cursor-pointer underline"
                    >
                      Thay đổi ảnh
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG tối đa 5MB
                    </p>
                  </div>
                </div>

                {/* Họ và Tên */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ *
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập họ của bạn"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên *
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên của bạn"
                      required
                    />
                  </div>
                </div>

                {/* Email and Username */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="Email không thể chỉnh sửa"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Email không thể thay đổi
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên đăng nhập *
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          username: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên đăng nhập"
                      required
                    />
                  </div>
                </div>

                {/* Phone and Education Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trình độ học vấn
                    </label>
                    <select
                      value={profileData.educationLevel}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          educationLevel: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="INDEPENDENT_LEARNER">Tự học</option>
                      <option value="MIDDLE_SCHOOL">Trung học cơ sở</option>
                      <option value="HIGH_SCHOOL">Trung học phổ thông</option>
                      <option value="VOCATIONAL_SCHOOL">Trung cấp nghề</option>
                      <option value="COLLEGE_UNIVERSITY">
                        Cao đẳng / Đại học
                      </option>
                      <option value="POSTGRADUATE">Sau đại học</option>
                      <option value="WORKING_PROFESSIONAL">Người đi làm</option>
                    </select>
                  </div>
                </div>

                {/* Date of Birth and Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính
                    </label>
                    <select
                      value={profileData.gender}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          gender: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {vietnamProvinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 text-base text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium transition-all duration-200"
                    style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  >
                    {isLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Đổi mật khẩu
              </h2>
              <p className="text-gray-600 text-xs mt-1">
                Bảo mật tài khoản của bạn
              </p>
            </div>

            <div className="p-4">
              {/* Kiểm tra nếu user đăng nhập bằng OAuth2 */}
              {user?.provider === "GOOGLE" ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-xl flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-medium">
                      Bạn đang đăng nhập bằng Google. Để đặt mật khẩu mới, vui
                      lòng nhập mật khẩu mới và xác nhận.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mật khẩu mới"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Xác nhận mật khẩu mới"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-3 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 text-base text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium transition-all duration-200"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      >
                        {isLoading ? "Đang cập nhật..." : "Đặt mật khẩu"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mật khẩu mới"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Xác nhận mật khẩu mới"
                        required
                      />
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Quên mật khẩu?
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 text-base text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium transition-all duration-200"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      >
                        {isLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Thanh toán
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Quản lý thông tin thanh toán và rút tiền
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 text-blue-600 px-6 py-4 rounded-xl flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-medium">
                    Các yêu cầu bồi hoàn sẽ dựa trên thông tin thanh toán của
                    bạn
                  </p>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngân hàng
                  </label>
                  <select
                    value={paymentData.bankName}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        bankName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Chọn ngân hàng</option>
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="VietinBank">VietinBank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="Agribank">Agribank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="ACB">ACB</option>
                    <option value="Sacombank">Sacombank</option>
                    <option value="MBBank">MBBank</option>
                    <option value="VPBank">VPBank</option>
                    <option value="TPBank">TPBank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    value={paymentData.accountNumber}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        accountNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số tài khoản"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chủ tài khoản
                  </label>
                  <input
                    type="text"
                    value={paymentData.accountHolder}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        accountHolder: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên chủ tài khoản"
                    required
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium transition-all duration-200"
                    style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  >
                    {isLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
