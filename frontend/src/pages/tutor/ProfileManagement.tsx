import React, { useState } from "react";

export const ProfileManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("basic");

  const [basicInfo, setBasicInfo] = useState({
    fullName: "Nguyễn Thị Lan",
    email: "lan@example.com",
    phone: "0901234567",
    dateOfBirth: "1990-05-15",
    address: "123 Lê Lợi, Q.1, TP.HCM",
    bio: "Tôi là một giảng viên tiếng Anh với 5 năm kinh nghiệm dạy IELTS. Đã giúp hơn 100 học viên đạt điểm mục tiêu.",
    avatar: null as File | null,
  });

  const [educationInfo, setEducationInfo] = useState({
    university: "Đại học Ngoại ngữ Hà Nội",
    degree: "Thạc sĩ",
    major: "Ngôn ngữ Anh",
    graduationYear: "2018",
    certificates: ["IELTS 8.5", "TESOL", "CELTA"],
  });

  const [teachingInfo, setTeachingInfo] = useState({
    subjects: ["Tiếng Anh", "IELTS", "TOEIC"],
    grades: ["Lớp 10-12", "Đại học", "Người đi làm"],
    experience: "5 năm",
    teachingMethods: ["1-1", "Online", "Tại nhà"],
    locations: ["Hà Nội", "Online"],
    hourlyRate: 300000,
    availability: ["Tối (18h-22h)", "Cuối tuần"],
    specialties: ["IELTS Speaking", "Business English", "Grammar"],
  });

  const [documents] = useState({
    cv: "cv-nguyen-thi-lan.pdf",
    diploma: "diploma-master.pdf",
    idCard: "cmnd-front.jpg",
    certificates: ["ielts-certificate.pdf", "tesol-certificate.pdf"],
  });

  const [stats] = useState({
    totalStudents: 24,
    completedSessions: 185,
    rating: 4.9,
    reviewCount: 47,
    earnings: 15600000,
    responseRate: 98,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const tabs = [
    { id: "basic", name: "Thông tin cơ bản", icon: "👤" },
    { id: "education", name: "Học vấn", icon: "🎓" },
    { id: "teaching", name: "Giảng dạy", icon: "📚" },
    { id: "documents", name: "Tài liệu", icon: "📄" },
    { id: "stats", name: "Thống kê", icon: "📊" },
  ];

  const handleBasicInfoUpdate = () => {
    const newErrors: Record<string, string> = {};

    if (!basicInfo.fullName) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!basicInfo.email) newErrors.email = "Vui lòng nhập email";
    if (!basicInfo.phone) newErrors.phone = "Vui lòng nhập số điện thoại";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Updating basic info:", basicInfo);
      alert("Cập nhật thông tin cơ bản thành công!");
    }
  };

  const handleEducationUpdate = () => {
    console.log("Updating education:", educationInfo);
    alert("Cập nhật thông tin học vấn thành công!");
  };

  const handleTeachingUpdate = () => {
    console.log("Updating teaching info:", teachingInfo);
    alert("Cập nhật thông tin giảng dạy thành công!");
  };

  const handleDocumentUpload = (type: string, file: File) => {
    console.log("Uploading document:", type, file.name);
    alert(`Tải lên ${type} thành công!`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderBasicTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl text-blue-600 font-medium">
              {basicInfo.fullName.charAt(0)}
            </span>
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-700">
            ✎
          </button>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{basicInfo.fullName}</h4>
          <p className="text-sm text-gray-500">Gia sư TutorMatch</p>
          <div className="flex items-center mt-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-medium text-gray-900 ml-1">
              {stats.rating}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              ({stats.reviewCount} đánh giá)
            </span>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
            Thay đổi ảnh đại diện
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên *
          </label>
          <input
            type="text"
            value={basicInfo.fullName}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, fullName: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={basicInfo.email}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, email: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại *
          </label>
          <input
            type="tel"
            value={basicInfo.phone}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, phone: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày sinh
          </label>
          <input
            type="date"
            value={basicInfo.dateOfBirth}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, dateOfBirth: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Địa chỉ
        </label>
        <textarea
          value={basicInfo.address}
          onChange={(e) =>
            setBasicInfo({ ...basicInfo, address: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Giới thiệu bản thân
        </label>
        <textarea
          value={basicInfo.bio}
          onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Mô tả về kinh nghiệm, phương pháp giảng dạy của bạn..."
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleBasicInfoUpdate}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );

  const renderEducationTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Thông tin học vấn</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trường đại học
          </label>
          <input
            type="text"
            value={educationInfo.university}
            onChange={(e) =>
              setEducationInfo({ ...educationInfo, university: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bằng cấp
          </label>
          <select
            value={educationInfo.degree}
            onChange={(e) =>
              setEducationInfo({ ...educationInfo, degree: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="Cử nhân">Cử nhân</option>
            <option value="Thạc sĩ">Thạc sĩ</option>
            <option value="Tiến sĩ">Tiến sĩ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chuyên ngành
          </label>
          <input
            type="text"
            value={educationInfo.major}
            onChange={(e) =>
              setEducationInfo({ ...educationInfo, major: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Năm tốt nghiệp
          </label>
          <input
            type="text"
            value={educationInfo.graduationYear}
            onChange={(e) =>
              setEducationInfo({
                ...educationInfo,
                graduationYear: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Chứng chỉ
        </label>
        <div className="space-y-2">
          {educationInfo.certificates.map((cert, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <span className="text-gray-900">{cert}</span>
              <button className="text-red-600 hover:text-red-700 text-sm">
                Xóa
              </button>
            </div>
          ))}
          <button className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-300 hover:text-blue-600">
            + Thêm chứng chỉ
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleEducationUpdate}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );

  const renderTeachingTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Thông tin giảng dạy
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kinh nghiệm
          </label>
          <select
            value={teachingInfo.experience}
            onChange={(e) =>
              setTeachingInfo({ ...teachingInfo, experience: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="Dưới 1 năm">Dưới 1 năm</option>
            <option value="1-2 năm">1-2 năm</option>
            <option value="3-5 năm">3-5 năm</option>
            <option value="Trên 5 năm">Trên 5 năm</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mức phí (VND/giờ)
          </label>
          <input
            type="number"
            value={teachingInfo.hourlyRate}
            onChange={(e) =>
              setTeachingInfo({
                ...teachingInfo,
                hourlyRate: parseInt(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Môn học có thể dạy
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            "Tiếng Anh",
            "IELTS",
            "TOEIC",
            "Tiếng Trung",
            "Tiếng Hàn",
            "Tiếng Nhật",
          ].map((subject) => (
            <label key={subject} className="flex items-center">
              <input
                type="checkbox"
                checked={teachingInfo.subjects.includes(subject)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTeachingInfo({
                      ...teachingInfo,
                      subjects: [...teachingInfo.subjects, subject],
                    });
                  } else {
                    setTeachingInfo({
                      ...teachingInfo,
                      subjects: teachingInfo.subjects.filter(
                        (s) => s !== subject
                      ),
                    });
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm">{subject}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Cấp học
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {["Lớp 1-5", "Lớp 6-9", "Lớp 10-12", "Đại học", "Người đi làm"].map(
            (grade) => (
              <label key={grade} className="flex items-center">
                <input
                  type="checkbox"
                  checked={teachingInfo.grades.includes(grade)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTeachingInfo({
                        ...teachingInfo,
                        grades: [...teachingInfo.grades, grade],
                      });
                    } else {
                      setTeachingInfo({
                        ...teachingInfo,
                        grades: teachingInfo.grades.filter((g) => g !== grade),
                      });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{grade}</span>
              </label>
            )
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hình thức dạy
        </label>
        <div className="grid grid-cols-2 gap-3">
          {["1-1", "Nhóm nhỏ", "Online", "Tại nhà"].map((method) => (
            <label key={method} className="flex items-center">
              <input
                type="checkbox"
                checked={teachingInfo.teachingMethods.includes(method)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTeachingInfo({
                      ...teachingInfo,
                      teachingMethods: [
                        ...teachingInfo.teachingMethods,
                        method,
                      ],
                    });
                  } else {
                    setTeachingInfo({
                      ...teachingInfo,
                      teachingMethods: teachingInfo.teachingMethods.filter(
                        (m) => m !== method
                      ),
                    });
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm">{method}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Chuyên môn đặc biệt
        </label>
        <div className="flex flex-wrap gap-2">
          {teachingInfo.specialties.map((specialty, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {specialty}
              <button className="ml-2 text-blue-600 hover:text-blue-800">
                ✕
              </button>
            </span>
          ))}
          <button className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:border-blue-300 hover:text-blue-600">
            + Thêm chuyên môn
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleTeachingUpdate}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Quản lý tài liệu</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">CV/Sơ yếu lý lịch</h4>
          {documents.cv ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">📄</span>
                <span className="text-sm text-gray-900">{documents.cv}</span>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  Xem
                </button>
                <button className="text-red-600 hover:text-red-700 text-sm">
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                e.target.files?.[0] &&
                handleDocumentUpload("CV", e.target.files[0])
              }
              className="w-full"
            />
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Bằng cấp</h4>
          {documents.diploma ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">🎓</span>
                <span className="text-sm text-gray-900">
                  {documents.diploma}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  Xem
                </button>
                <button className="text-red-600 hover:text-red-700 text-sm">
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) =>
                e.target.files?.[0] &&
                handleDocumentUpload("Bằng cấp", e.target.files[0])
              }
              className="w-full"
            />
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">CMND/CCCD</h4>
          {documents.idCard ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">🆔</span>
                <span className="text-sm text-gray-900">
                  {documents.idCard}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  Xem
                </button>
                <button className="text-red-600 hover:text-red-700 text-sm">
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            <input
              type="file"
              accept=".jpg,.png,.pdf"
              onChange={(e) =>
                e.target.files?.[0] &&
                handleDocumentUpload("CMND", e.target.files[0])
              }
              className="w-full"
            />
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Chứng chỉ</h4>
          <div className="space-y-2">
            {documents.certificates.map((cert, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">🏆</span>
                  <span className="text-sm text-gray-900">{cert}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    Xem
                  </button>
                  <button className="text-red-600 hover:text-red-700 text-sm">
                    Xóa
                  </button>
                </div>
              </div>
            ))}
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  Array.from(e.target.files).forEach((file) =>
                    handleDocumentUpload("Chứng chỉ", file)
                  );
                }
              }}
              className="w-full mt-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Lưu ý:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tất cả tài liệu phải rõ ràng, đọc được</li>
          <li>• Định dạng hỗ trợ: PDF, JPG, PNG, DOC, DOCX</li>
          <li>• Dung lượng tối đa: 5MB mỗi file</li>
          <li>• Tài liệu sẽ được xem xét và phê duyệt trong 1-2 ngày</li>
        </ul>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Thống kê hiệu suất
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Tổng học viên</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Buổi đã dạy</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.completedSessions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Đánh giá</p>
              <p className="text-2xl font-bold text-yellow-900">
                {stats.rating}/5
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Thu nhập</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng thu nhập:</span>
              <span className="font-medium text-green-600">
                {formatPrice(stats.earnings)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thu nhập trung bình/buổi:</span>
              <span className="font-medium">
                {formatPrice(stats.earnings / stats.completedSessions)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mức phí hiện tại:</span>
              <span className="font-medium">
                {formatPrice(teachingInfo.hourlyRate)}/giờ
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Hiệu suất</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tỷ lệ phản hồi:</span>
              <span className="font-medium text-green-600">
                {stats.responseRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số đánh giá:</span>
              <span className="font-medium">{stats.reviewCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trung bình buổi/học viên:</span>
              <span className="font-medium">
                {Math.round(stats.completedSessions / stats.totalStudents)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Đánh giá gần đây</h4>
        <div className="space-y-4">
          {[
            {
              name: "Nguyễn Minh An",
              rating: 5,
              comment: "Cô dạy rất hay và dễ hiểu!",
            },
            {
              name: "Trần Thị Bình",
              rating: 5,
              comment: "Phương pháp dạy hiệu quả, em đã cải thiện rõ rệt.",
            },
            {
              name: "Lê Văn Cường",
              rating: 4,
              comment: "Cô rất tận tâm, giải đáp thắc mắc chi tiết.",
            },
          ].map((review, index) => (
            <div
              key={index}
              className="border-b border-gray-100 pb-4 last:border-b-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{review.name}</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">"{review.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return renderBasicTab();
      case "education":
        return renderEducationTab();
      case "teaching":
        return renderTeachingTab();
      case "documents":
        return renderDocumentsTab();
      case "stats":
        return renderStatsTab();
      default:
        return renderBasicTab();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý hồ sơ gia sư</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};
