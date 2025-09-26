import React, { useState } from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  imageAvatar?: string;
  imageAvatarUrl?: string;
}

interface ProfileApplication {
  id: number;
  bio: string;
  headline: string;
  experience: string;
  cvFileUrl?: string;
  videoIntro?: string;
  teachingAudiences: string[];
  subjects: Array<{ name: string; hourlyRate: number }>;
  hourlyRate: number;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  senderName: string;
  senderAvatar?: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  type: "system" | "student" | "admin";
}

export const ProfileManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Mock data - trong thực tế sẽ fetch từ API
  const [userData] = useState<User>({
    id: 1,
    firstName: "Nguyễn Thị",
    lastName: "Lan",
    email: "lan@example.com",
    phoneNumber: "0901234567",
    dateOfBirth: "1990-05-15",
    gender: "FEMALE",
    address: "123 Lê Lợi, Q.1, TP.HCM",
    imageAvatarUrl: "https://example.com/avatar.jpg",
  });

  const [profileApplication] = useState<ProfileApplication>({
    id: 1,
    bio: "Tôi là một giảng viên tiếng Anh với 5 năm kinh nghiệm dạy IELTS. Đã giúp hơn 100 học viên đạt điểm mục tiêu.",
    headline: "Giảng viên Tiếng Anh chuyên nghiệp",
    experience: "5 năm kinh nghiệm dạy tiếng Anh, chuyên về IELTS và TOEIC",
    cvFileUrl: "https://example.com/cv.pdf",
    videoIntro: "https://youtube.com/watch?v=example",
    teachingAudiences: ["Lớp 10-12", "Đại học", "Người đi làm"],
    subjects: [
      { name: "Tiếng Anh", hourlyRate: 200000 },
      { name: "IELTS", hourlyRate: 300000 },
      { name: "TOEIC", hourlyRate: 250000 },
    ],
    hourlyRate: 300000,
    status: "SUBMITTED",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderName: "Hệ thống",
      subject: "Hồ sơ của bạn đã được duyệt",
      content:
        "Chúc mừng! Hồ sơ đăng ký trở thành gia sư của bạn đã được phê duyệt. Bạn có thể bắt đầu nhận lớp ngay bây giờ.",
      isRead: false,
      createdAt: "2025-01-20T10:00:00Z",
      type: "system",
    },
    {
      id: 2,
      senderName: "Nguyễn Văn A",
      subject: "Yêu cầu học IELTS",
      content:
        "Chào cô Lan, em muốn học IELTS để đạt 7.0. Cô có thể dạy em vào cuối tuần không ạ?",
      isRead: true,
      createdAt: "2025-01-19T14:30:00Z",
      type: "student",
    },
    {
      id: 3,
      senderName: "Admin",
      subject: "Cập nhật thông tin hồ sơ",
      content:
        "Vui lòng cập nhật thêm thông tin về kinh nghiệm giảng dạy trong hồ sơ của bạn.",
      isRead: false,
      createdAt: "2025-01-18T09:15:00Z",
      type: "admin",
    },
  ]);

  const [formData, setFormData] = useState({
    // Step 1: Thông tin cơ bản
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phoneNumber,
    email: userData.email,
    address: userData.address,
    dateOfBirth: userData.dateOfBirth,
    gender: userData.gender,

    // Step 2: Ảnh đại diện và CV
    imageAvatarUrl: userData.imageAvatarUrl || "",
    cvFileUrl: profileApplication.cvFileUrl || "",

    // Step 3: Chứng chỉ
    certificates: [
      {
        name: "IELTS 8.0",
        description: "Chứng chỉ tiếng Anh quốc tế",
        issuedBy: "British Council",
        year: "2020",
        isVerified: true,
      },
      {
        name: "TESOL Certificate",
        description: "Chứng chỉ giảng dạy tiếng Anh",
        issuedBy: "Arizona State University",
        year: "2019",
        isVerified: false,
      },
    ],

    // Step 4: Học vấn
    educations: [
      {
        schoolName: "Đại học Sư phạm TP.HCM",
        degree: "Cử nhân",
        major: "Sư phạm Tiếng Anh",
        fromTime: 2011,
        toTime: 2015,
        isVerified: true,
      },
    ],

    // Step 5: Giới thiệu
    bio: profileApplication.bio,
    headline: profileApplication.headline,
    experience: profileApplication.experience,
    teachingAudiences: profileApplication.teachingAudiences,

    // Step 6: Video
    videoUrl: profileApplication.videoIntro || "",

    // Step 7: Thời gian dạy
    availableDays: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"],
    availableTimes: ["Sáng", "Chiều", "Tối"],
  });

  const handleInputChange = (
    field: string,
    value:
      | string
      | number
      | string[]
      | Array<{
          name: string;
          description: string;
          issuedBy: string;
          year: string;
        }>
      | Array<{
          schoolName: string;
          degree: string;
          major: string;
          fromTime: number;
          toTime: number;
        }>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving profile data:", formData);
    alert("Lưu hồ sơ thành công!");
  };

  const handleSubmit = () => {
    console.log("Submitting profile data:", formData);
    alert("Gửi hồ sơ thành công!");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Thông tin cơ bản
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                    style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Ảnh đại diện và CV
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Ảnh đại diện
                    </label>
                    <div className="flex flex-col items-center space-y-4">
                      {formData.imageAvatarUrl ? (
                        <img
                          src={formData.imageAvatarUrl}
                          alt="Avatar"
                          className="w-32 h-32 rounded-full object-cover border-4"
                          style={{ borderColor: "rgb(148, 204, 230)" }}
                        />
                      ) : (
                        <div
                          className="w-32 h-32 rounded-full flex items-center justify-center text-white font-medium text-2xl"
                          style={{ backgroundColor: "rgb(148, 204, 230)" }}
                        >
                          {formData.firstName.charAt(0)}
                          {formData.lastName.charAt(0)}
                        </div>
                      )}
                      <button
                        className="px-4 py-2 text-white rounded-xl transition-colors duration-200"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      >
                        Chọn ảnh
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      CV/Sơ yếu lý lịch
                    </label>
                    <div
                      className="border-2 border-dashed rounded-xl p-6 text-center"
                      style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                    >
                      {formData.cvFileUrl ? (
                        <div className="space-y-2">
                          <div className="text-blue-600 text-4xl">📄</div>
                          <p className="text-sm text-gray-600">CV đã tải lên</p>
                          <button className="text-sm text-blue-600 hover:text-blue-800">
                            Xem CV
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-gray-400 text-4xl">📄</div>
                          <p className="text-sm text-gray-600">Chưa có CV</p>
                          <button
                            className="px-4 py-2 text-white rounded-xl transition-colors duration-200"
                            style={{ backgroundColor: "rgb(148, 204, 230)" }}
                          >
                            Tải lên CV
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Chứng chỉ
                </h2>

                <div className="space-y-4">
                  {formData.certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="border rounded-xl p-4"
                      style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên chứng chỉ
                          </label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => {
                              const newCerts = [...formData.certificates];
                              newCerts[index].name = e.target.value;
                              handleInputChange("certificates", newCerts);
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                            style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tổ chức cấp
                          </label>
                          <input
                            type="text"
                            value={cert.issuedBy}
                            onChange={(e) => {
                              const newCerts = [...formData.certificates];
                              newCerts[index].issuedBy = e.target.value;
                              handleInputChange("certificates", newCerts);
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                            style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Năm cấp
                          </label>
                          <input
                            type="text"
                            value={cert.year}
                            onChange={(e) => {
                              const newCerts = [...formData.certificates];
                              newCerts[index].year = e.target.value;
                              handleInputChange("certificates", newCerts);
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                            style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            Trạng thái xác thực:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cert.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {cert.isVerified ? "Đã xác thực" : "Chờ xác thực"}
                          </span>
                        </div>
                        {cert.isVerified && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-xs">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    className="w-full py-3 border-2 border-dashed rounded-xl text-gray-600 hover:text-gray-800 transition-colors"
                    style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                  >
                    + Thêm chứng chỉ
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Học vấn
                </h2>

                <div className="space-y-4">
                  {formData.educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border rounded-xl p-4"
                      style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên trường
                          </label>
                          <input
                            type="text"
                            value={edu.schoolName}
                            onChange={(e) => {
                              const newEdus = [...formData.educations];
                              newEdus[index].schoolName = e.target.value;
                              handleInputChange("educations", newEdus);
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                            style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bằng cấp
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEdus = [...formData.educations];
                              newEdus[index].degree = e.target.value;
                              handleInputChange("educations", newEdus);
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                            style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chuyên ngành
                          </label>
                          <input
                            type="text"
                            value={edu.major}
                            onChange={(e) => {
                              const newEdus = [...formData.educations];
                              newEdus[index].major = e.target.value;
                              handleInputChange("educations", newEdus);
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                            style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Năm tốt nghiệp
                          </label>
                          <input
                            type="number"
                            value={edu.toTime}
                            onChange={(e) => {
                              const newEdus = [...formData.educations];
                              newEdus[index].toTime = parseInt(e.target.value);
                              handleInputChange("educations", newEdus);
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                            style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            Trạng thái xác thực:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              edu.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {edu.isVerified ? "Đã xác thực" : "Chờ xác thực"}
                          </span>
                        </div>
                        {edu.isVerified && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-xs">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    className="w-full py-3 border-2 border-dashed rounded-xl text-gray-600 hover:text-gray-800 transition-colors"
                    style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                  >
                    + Thêm học vấn
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Giới thiệu
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề hồ sơ
                    </label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) =>
                        handleInputChange("headline", e.target.value)
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                      placeholder="Ví dụ: Giảng viên Tiếng Anh chuyên nghiệp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kinh nghiệm giảng dạy
                    </label>
                    <textarea
                      value={formData.experience}
                      onChange={(e) =>
                        handleInputChange("experience", e.target.value)
                      }
                      rows={4}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                      placeholder="Mô tả kinh nghiệm giảng dạy của bạn..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới thiệu bản thân
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                      placeholder="Giới thiệu về bản thân, phương pháp giảng dạy..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đối tượng giảng dạy
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Lớp 10-12", "Đại học", "Người đi làm", "Trẻ em"].map(
                        (audience) => (
                          <button
                            key={audience}
                            className={`px-4 py-2 rounded-full text-sm transition-colors ${
                              formData.teachingAudiences.includes(audience)
                                ? "text-white"
                                : "text-gray-600 border"
                            }`}
                            style={{
                              backgroundColor:
                                formData.teachingAudiences.includes(audience)
                                  ? "rgb(148, 204, 230)"
                                  : "transparent",
                              borderColor: "rgba(148, 204, 230, 0.3)",
                            }}
                            onClick={() => {
                              const newAudiences =
                                formData.teachingAudiences.includes(audience)
                                  ? formData.teachingAudiences.filter(
                                      (a) => a !== audience
                                    )
                                  : [...formData.teachingAudiences, audience];
                              handleInputChange(
                                "teachingAudiences",
                                newAudiences
                              );
                            }}
                          >
                            {audience}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Video giới thiệu
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link video YouTube
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      handleInputChange("videoUrl", e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                    style={{ borderColor: "rgba(148, 204, 230, 0.3)" }}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Tải video lên YouTube và dán link vào đây
                  </p>
                </div>

                {formData.videoUrl && (
                  <div className="mt-4">
                    <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl text-gray-400 mb-2">🎥</div>
                        <p className="text-gray-600">Video preview</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Thời gian dạy
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Ngày trong tuần
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        "Thứ 2",
                        "Thứ 3",
                        "Thứ 4",
                        "Thứ 5",
                        "Thứ 6",
                        "Thứ 7",
                        "Chủ nhật",
                      ].map((day) => (
                        <button
                          key={day}
                          className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                            formData.availableDays.includes(day)
                              ? "text-white"
                              : "text-gray-600 border"
                          }`}
                          style={{
                            backgroundColor: formData.availableDays.includes(
                              day
                            )
                              ? "rgb(148, 204, 230)"
                              : "transparent",
                            borderColor: "rgba(148, 204, 230, 0.3)",
                          }}
                          onClick={() => {
                            const newDays = formData.availableDays.includes(day)
                              ? formData.availableDays.filter((d) => d !== day)
                              : [...formData.availableDays, day];
                            handleInputChange("availableDays", newDays);
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Khung giờ
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        "Sáng (7h-12h)",
                        "Chiều (12h-17h)",
                        "Tối (17h-22h)",
                      ].map((time) => (
                        <button
                          key={time}
                          className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                            formData.availableTimes.includes(time)
                              ? "text-white"
                              : "text-gray-600 border"
                          }`}
                          style={{
                            backgroundColor: formData.availableTimes.includes(
                              time
                            )
                              ? "rgb(148, 204, 230)"
                              : "transparent",
                            borderColor: "rgba(148, 204, 230, 0.3)",
                          }}
                          onClick={() => {
                            const newTimes = formData.availableTimes.includes(
                              time
                            )
                              ? formData.availableTimes.filter(
                                  (t) => t !== time
                                )
                              : [...formData.availableTimes, time];
                            handleInputChange("availableTimes", newTimes);
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderMessages = () => {
    const unreadCount = messages.filter((msg) => !msg.isRead).length;

    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Hộp thư</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {unreadCount} tin nhắn chưa đọc
                </span>
                <button
                  className="px-4 py-2 text-white rounded-xl transition-colors duration-200"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  Đánh dấu tất cả đã đọc
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !message.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === message.id ? { ...msg, isRead: true } : msg
                    )
                  );
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: "rgb(148, 204, 230)" }}
                    >
                      {message.senderName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {message.senderName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        {!message.isRead && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "rgb(148, 204, 230)" }}
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {message.subject}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {message.content}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          message.type === "system"
                            ? "bg-blue-100 text-blue-800"
                            : message.type === "student"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {message.type === "system"
                          ? "Hệ thống"
                          : message.type === "student"
                          ? "Học viên"
                          : "Admin"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý hồ sơ gia sư
            </h1>
            <div className="flex items-center space-x-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profileApplication.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : profileApplication.status === "SUBMITTED"
                    ? "bg-yellow-100 text-yellow-800"
                    : profileApplication.status === "REJECTED"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {profileApplication.status === "APPROVED"
                  ? "Đã duyệt"
                  : profileApplication.status === "SUBMITTED"
                  ? "Chờ duyệt"
                  : profileApplication.status === "REJECTED"
                  ? "Bị từ chối"
                  : "Nháp"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Hồ sơ cá nhân
              </button>
              <button
                onClick={() => setActiveTab("messages")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "messages"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Hộp thư
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "profile" ? (
          <div>
            {/* Step Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                    (step) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            step <= currentStep
                              ? "text-white"
                              : "text-gray-500 border-2"
                          }`}
                          style={{
                            backgroundColor:
                              step <= currentStep
                                ? "rgb(148, 204, 230)"
                                : "transparent",
                            borderColor:
                              step <= currentStep
                                ? "rgb(148, 204, 230)"
                                : "rgba(148, 204, 230, 0.3)",
                          }}
                        >
                          {step}
                        </div>
                        {step < totalSteps && (
                          <div
                            className={`w-8 h-0.5 mx-2 ${
                              step < currentStep ? "bg-blue-400" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Bước {currentStep} / {totalSteps}
                </div>
              </div>
            </div>

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Quay lại
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Lưu nháp
                </button>
                {currentStep < totalSteps ? (
                  <button
                    onClick={() =>
                      setCurrentStep(Math.min(totalSteps, currentStep + 1))
                    }
                    className="px-6 py-3 text-white rounded-xl font-medium transition-colors duration-200"
                    style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  >
                    Tiếp theo
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 text-white rounded-xl font-medium transition-colors duration-200"
                    style={{ backgroundColor: "rgb(148, 204, 230)" }}
                  >
                    Hoàn thành
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          renderMessages()
        )}
      </div>
    </div>
  );
};
