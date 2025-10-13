import React, { useState, useEffect, useCallback } from "react";
import {
  TutorService,
  type TutorApplicationData,
  type TeachingAudience,
} from "../../services/tutorService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const ProfileManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Track completed steps
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [teachingAudiences, setTeachingAudiences] = useState<
    TeachingAudience[]
  >([]);
  const [provinces, setProvinces] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [filteredProvinces, setFilteredProvinces] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // States for upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<"avatar" | "cv">("avatar");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Thông tin cơ bản
    firstName: "",
    lastName: "",
    phone: "",
    subjects: [] as Array<{ name: string; hourlyRate: string }>,
    email: "",
    province: "",
    confirmAge: false,
    acceptTerms: false,

    // Step 2: Ảnh đại diện và CV
    imageAvatar: null as File | null,
    cvFile: null as File | null,
    imageAvatarUrl: "",
    cvFileUrl: "",
    cvFileName: "",
    // Step 3: Chứng chỉ
    certificates: [
      {
        name: "",
        description: "",
        issuedBy: "",
        file: null,
        imageUrl: "",
        imageFileName: "",
      },
    ] as Array<{
      name: string;
      description: string;
      issuedBy: string;
      file: File | null;
      imageUrl: string;
      imageFileName: string;
    }>,
    noCertificates: false,

    // Step 4: Học vấn
    noEducation: false,
    educations: [
      {
        schoolName: "",
        degree: "",
        major: "",
        fromTime: 0,
        toTime: 0,
        degreeFileName: "",
        degreeFileUrl: "",
      },
    ] as Array<{
      schoolName: string;
      degree: string;
      major: string;
      fromTime: number;
      toTime: number;
      degreeFileName: string;
      degreeFileUrl: string;
    }>,

    // Step 5: Giới thiệu
    bio: "",
    headline: "",
    experience: "",
    teachingAudiences: [] as string[],

    // Step 6: Video giới thiệu
    videoIntro: "",

    // Step 7: Thời gian dạy
    availableTimes: [] as Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
    }>,
    timezone: "Asia/Ho_Chi_Minh",
  });

  // Kiểm tra từng bước có hoàn thành không
  const isStepCompleted = useCallback(
    (step: number) => {
      switch (step) {
        case 1:
          return (
            formData.firstName &&
            formData.lastName &&
            formData.phone &&
            formData.email &&
            formData.province &&
            formData.subjects.length > 0 &&
            formData.confirmAge &&
            formData.acceptTerms
          );
        case 2:
          return formData.imageAvatarUrl && formData.cvFileUrl;
        case 3:
          return (
            formData.noCertificates ||
            formData.certificates.some((cert) => cert.name)
          );
        case 4:
          return (
            formData.noEducation ||
            formData.educations.some((edu) => edu.schoolName)
          );
        case 5:
          return (
            formData.bio &&
            formData.headline &&
            formData.experience &&
            formData.teachingAudiences.length > 0
          );
        case 6:
          return true; // Video is optional
        case 7:
          return formData.availableTimes.length > 0;
        default:
          return false;
      }
    },
    [formData]
  );

  // Update completed steps when form data changes
  useEffect(() => {
    const newCompletedSteps = new Set<number>();
    for (let i = 1; i <= totalSteps; i++) {
      if (isStepCompleted(i)) {
        newCompletedSteps.add(i);
      }
    }
    setCompletedSteps(newCompletedSteps);
  }, [formData, isStepCompleted]);

  // Update formData when user is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Load draft data đã lưu
  useEffect(() => {
    const loadDraftData = async () => {
      console.log("🔍 Debug: isAuthenticated =", isAuthenticated);
      console.log("🔍 Debug: user =", user);
      const token = localStorage.getItem("token");
      console.log("🔍 Debug: token =", token);

      // Check both isAuthenticated and token existence
      if (isAuthenticated && token && subjects.length > 0) {
        try {
          console.log("✅ User is authenticated, loading draft data...");
          const draftData = await TutorService.getDraftData();

          if ((draftData as any).success && (draftData as any).hasDraft) {
            console.log("✅ Loading saved draft data:", draftData);
            const typedDraftData = draftData as any;

            // Điền dữ liệu vào form
            setFormData((prev) => {
              const updatedData = {
                ...prev,
                // Step 1: Thông tin cơ bản
                firstName: typedDraftData.firstName || prev.firstName,
                lastName: typedDraftData.lastName || prev.lastName,
                phone: typedDraftData.phoneNumber || prev.phone,
                email: typedDraftData.email || prev.email,
                province: typedDraftData.address || prev.province,
                timezone: typedDraftData.timezone || prev.timezone,

                // Step 2: Ảnh đại diện và CV
                imageAvatarUrl:
                  typedDraftData.imageAvatar || prev.imageAvatarUrl,
                cvFileUrl: typedDraftData.cvFileUrl || prev.cvFileUrl,
                cvFileName: typedDraftData.cvFileName || prev.cvFileName,

                // Step 5: Giới thiệu
                bio: typedDraftData.bio || prev.bio,
                headline: typedDraftData.headline || prev.headline,
                experience: typedDraftData.experience || prev.experience,

                // Step 6: Video
                videoIntro: typedDraftData.videoIntro || prev.videoIntro,

                // Step 7: Thời gian dạy
                availableTimes:
                  typedDraftData.availableTimes || prev.availableTimes,
              };

              console.log("📝 Updated formData:", updatedData);
              return updatedData;
            });
          }
        } catch (error) {
          console.error("❌ Error loading draft data:", error);
        }
      }
    };

    loadDraftData();
  }, [isAuthenticated, user, subjects]);

  // Load initial data (subjects, provinces, etc.)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("🔄 Loading initial data...");

        // Load subjects
        const subjectsResponse = await TutorService.getSubjects();
        console.log("📚 Subjects response:", subjectsResponse);
        setSubjects(subjectsResponse);

        // Load teaching audiences
        const audiencesResponse = await TutorService.getTeachingAudiences();
        console.log("👥 Teaching audiences response:", audiencesResponse);
        setTeachingAudiences(audiencesResponse);

        // Load provinces - Mock data for now
        const mockProvinces = [
          { id: 1, name: "Hà Nội" },
          { id: 2, name: "TP. Hồ Chí Minh" },
          { id: 3, name: "Đà Nẵng" },
          { id: 4, name: "Hải Phòng" },
          { id: 5, name: "Cần Thơ" },
        ];
        setProvinces(mockProvinces);
        setFilteredProvinces(mockProvinces);
      } catch (error) {
        console.error("❌ Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user makes changes
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.firstName) newErrors.firstName = "Vui lòng nhập tên";
        if (!formData.lastName) newErrors.lastName = "Vui lòng nhập họ";
        if (!formData.phone) newErrors.phone = "Vui lòng nhập số điện thoại";
        if (!formData.province)
          newErrors.province = "Vui lòng chọn tỉnh/thành phố";
        if (formData.subjects.length === 0)
          newErrors.subjects = "Vui lòng chọn ít nhất một môn học";
        if (!formData.confirmAge)
          newErrors.confirmAge = "Vui lòng xác nhận độ tuổi";
        if (!formData.acceptTerms)
          newErrors.acceptTerms = "Vui lòng đồng ý với điều khoản";
        break;
      case 2:
        if (!formData.imageAvatarUrl)
          newErrors.imageAvatar = "Vui lòng tải lên ảnh đại diện";
        if (!formData.cvFileUrl) newErrors.cvFile = "Vui lòng tải lên CV";
        break;
      case 5:
        if (!formData.headline) newErrors.headline = "Vui lòng nhập tiêu đề";
        if (!formData.bio) newErrors.bio = "Vui lòng nhập giới thiệu";
        if (!formData.experience)
          newErrors.experience = "Vui lòng nhập kinh nghiệm";
        if (formData.teachingAudiences.length === 0)
          newErrors.teachingAudiences = "Vui lòng chọn đối tượng học viên";
        break;
      case 7:
        if (formData.availableTimes.length === 0)
          newErrors.availableTimes = "Vui lòng chọn thời gian dạy";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(totalSteps, currentStep + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const goToStep = (step: number) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
    }
  };

  const saveDraft = async () => {
    setIsDraftSaving(true);
    try {
      console.log("💾 Saving draft data:", formData);

      const draftData: Partial<TutorApplicationData> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone,
        address: formData.province,
        timezone: formData.timezone,
        // imageAvatarUrl: formData.imageAvatarUrl, // Will be handled separately
        cvFileUrl: formData.cvFileUrl,
        cvFileName: formData.cvFileName,
        bio: formData.bio,
        headline: formData.headline,
        experience: formData.experience,
        videoIntro: formData.videoIntro,
        // availableTimes: formData.availableTimes, // Will be handled separately
        teachingAudiences: formData.teachingAudiences,
        // subjects: formData.subjects.map((subject) => ({
        //   name: subject.name,
        //   hourlyRate: parseFloat(subject.hourlyRate) || 0,
        // })),
        certificates: formData.certificates
          .filter((cert) => cert.name)
          .map((cert) => ({
            name: cert.name,
            description: cert.description,
            issuedBy: cert.issuedBy,
            certFileName: cert.imageFileName,
            certFileUrl: cert.imageUrl,
          })),
        educations: formData.educations
          .filter((edu) => edu.schoolName)
          .map((edu) => ({
            schoolName: edu.schoolName,
            degree: edu.degree,
            major: edu.major,
            fromTime: edu.fromTime,
            toTime: edu.toTime,
            degreeFileName: edu.degreeFileName,
            degreeFileUrl: edu.degreeFileUrl,
          })),
      };

      await TutorService.saveDraft(draftData as TutorApplicationData);
      console.log("✅ Draft saved successfully");
      alert("Lưu nháp thành công!");
    } catch (error) {
      console.error("❌ Error saving draft:", error);
      alert("Có lỗi khi lưu nháp!");
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!areAllStepsCompleted()) {
      alert("Vui lòng hoàn thành tất cả các bước trước khi gửi!");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("📤 Submitting application:", formData);

      const applicationData: Partial<TutorApplicationData> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone,
        address: formData.province,
        timezone: formData.timezone,
        // imageAvatarUrl: formData.imageAvatarUrl, // Will be handled separately
        cvFileUrl: formData.cvFileUrl,
        cvFileName: formData.cvFileName,
        bio: formData.bio,
        headline: formData.headline,
        experience: formData.experience,
        videoIntro: formData.videoIntro,
        // availableTimes: formData.availableTimes, // Will be handled separately
        teachingAudiences: formData.teachingAudiences,
        // subjects: formData.subjects.map((subject) => ({
        //   name: subject.name,
        //   hourlyRate: parseFloat(subject.hourlyRate) || 0,
        // })),
        certificates: formData.certificates
          .filter((cert) => cert.name)
          .map((cert) => ({
            name: cert.name,
            description: cert.description,
            issuedBy: cert.issuedBy,
            certFileName: cert.imageFileName,
            certFileUrl: cert.imageUrl,
          })),
        educations: formData.educations
          .filter((edu) => edu.schoolName)
          .map((edu) => ({
            schoolName: edu.schoolName,
            degree: edu.degree,
            major: edu.major,
            fromTime: edu.fromTime,
            toTime: edu.toTime,
            degreeFileName: edu.degreeFileName,
            degreeFileUrl: edu.degreeFileUrl,
          })),
      };

      const response = await TutorService.submitApplication(
        applicationData as TutorApplicationData
      );

      if (response.success) {
        console.log("✅ Application submitted successfully");
        alert("Cập nhật hồ sơ thành công! Hồ sơ của bạn đã được cập nhật.");
        // Navigate to profile or dashboard
        navigate("/tutor/profile");
      } else {
        throw new Error(response.message || "Submission failed");
      }
    } catch (error) {
      console.error("❌ Error submitting application:", error);
      alert("Có lỗi khi cập nhật hồ sơ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    handleInputChange("province", value);
    setShowProvinceDropdown(true);

    if (value) {
      const filtered = provinces.filter((province) =>
        province.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces(provinces);
    }
  };

  const selectProvince = (province: { id: number; name: string }) => {
    handleInputChange("province", province.name);
    setShowProvinceDropdown(false);
  };

  const handleUploadClick = (type: "avatar" | "cv") => {
    setUploadType(type);
    setShowUploadModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewFile(file);
    }
  };

  const handleConfirmUpload = async () => {
    if (!previewFile) return;

    setIsUploading(true);
    try {
      console.log("📤 Uploading file:", previewFile.name);

      // Mock upload - in real app, upload to server
      const mockUrl = URL.createObjectURL(previewFile);

      if (uploadType === "avatar") {
        handleInputChange("imageAvatarUrl", mockUrl);
        handleInputChange("imageAvatar", previewFile);
      } else {
        handleInputChange("cvFileUrl", mockUrl);
        handleInputChange("cvFile", previewFile);
        handleInputChange("cvFileName", previewFile.name);
      }

      setShowUploadModal(false);
      setPreviewFile(null);
      console.log("✅ File uploaded successfully");
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert("Có lỗi khi tải lên file!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setPreviewFile(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Thông tin cá nhân - Compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Nhập tên của bạn"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Nhập họ của bạn"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Thông tin liên hệ - Compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        handleInputChange("phone", value);
                      }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Nhập số điện thoại"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Địa chỉ - Compact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      onFocus={() => setShowProvinceDropdown(true)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Chọn tỉnh/thành phố"
                      autoComplete="off"
                    />
                    {showProvinceDropdown && filteredProvinces.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredProvinces.map((province) => (
                          <div
                            key={province.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              selectProvince(province);
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              selectProvince(province);
                            }}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                          >
                            {province.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.province && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.province}
                    </p>
                  )}
                </div>

                {/* Môn học giảng dạy - Compact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Môn học giảng dạy *
                  </label>
                  <select
                    onChange={(e) => {
                      if (
                        e.target.value &&
                        !formData.subjects.some(
                          (sub) => sub.name === e.target.value
                        )
                      ) {
                        handleInputChange("subjects", [
                          ...formData.subjects,
                          { name: e.target.value, hourlyRate: "" },
                        ]);
                      }
                      e.target.value = "";
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Chọn môn học</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  {/* Danh sách môn học đã chọn - Compact */}
                  {formData.subjects.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.subjects.map((subject, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {subject.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={subject.hourlyRate}
                              onChange={(e) => {
                                const newSubjects = [...formData.subjects];
                                newSubjects[index].hourlyRate = e.target.value;
                                handleInputChange("subjects", newSubjects);
                              }}
                              className="w-24 px-2 py-1 border border-gray-200 rounded text-sm"
                              placeholder="Học phí"
                              min="0"
                            />
                            <span className="text-xs text-gray-500">VNĐ/h</span>
                            <button
                              onClick={() => {
                                const newSubjects = formData.subjects.filter(
                                  (_, i) => i !== index
                                );
                                handleInputChange("subjects", newSubjects);
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.subjects && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.subjects}
                    </p>
                  )}
                </div>

                {/* Xác nhận tuổi và điều khoản */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.confirmAge}
                      onChange={(e) =>
                        handleInputChange("confirmAge", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Tôi xác nhận đã đủ 18 tuổi *
                    </span>
                  </label>
                  {errors.confirmAge && (
                    <p className="text-red-500 text-xs">{errors.confirmAge}</p>
                  )}

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) =>
                        handleInputChange("acceptTerms", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Tôi đồng ý với{" "}
                      <a href="#" className="text-blue-500 hover:underline">
                        điều khoản sử dụng
                      </a>{" "}
                      *
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-red-500 text-xs">{errors.acceptTerms}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Ảnh đại diện */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh đại diện *
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      {formData.imageAvatarUrl ? (
                        <img
                          src={formData.imageAvatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleUploadClick("avatar")}
                      className="px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      style={{ backgroundColor: "rgb(148, 204, 230)" }}
                    >
                      Tải lên ảnh
                    </button>
                  </div>
                  {errors.imageAvatar && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.imageAvatar}
                    </p>
                  )}
                </div>

                {/* CV */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CV/Bằng cấp *
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      {formData.cvFileUrl ? (
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">📄</div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {formData.cvFileName || "CV đã tải lên"}
                            </p>
                            <p className="text-sm text-gray-500">
                              CV đã tải lên
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Chưa có CV</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUploadClick("cv")}
                      className="px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      style={{ backgroundColor: "rgb(148, 204, 230)" }}
                    >
                      Tải lên CV
                    </button>
                  </div>
                  {errors.cvFile && (
                    <p className="text-red-500 text-xs mt-1">{errors.cvFile}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Chứng chỉ và bằng cấp
                  </h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.noCertificates}
                      onChange={(e) =>
                        handleInputChange("noCertificates", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      Tôi chưa có chứng chỉ nào
                    </span>
                  </label>
                </div>

                {!formData.noCertificates && (
                  <div className="space-y-4">
                    {formData.certificates.map((certificate, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tên chứng chỉ
                            </label>
                            <input
                              type="text"
                              value={certificate.name}
                              onChange={(e) => {
                                const newCertificates = [
                                  ...formData.certificates,
                                ];
                                newCertificates[index].name = e.target.value;
                                handleInputChange(
                                  "certificates",
                                  newCertificates
                                );
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ví dụ: IELTS 7.5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tổ chức cấp
                            </label>
                            <input
                              type="text"
                              value={certificate.issuedBy}
                              onChange={(e) => {
                                const newCertificates = [
                                  ...formData.certificates,
                                ];
                                newCertificates[index].issuedBy =
                                  e.target.value;
                                handleInputChange(
                                  "certificates",
                                  newCertificates
                                );
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ví dụ: British Council"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                          </label>
                          <textarea
                            value={certificate.description}
                            onChange={(e) => {
                              const newCertificates = [
                                ...formData.certificates,
                              ];
                              newCertificates[index].description =
                                e.target.value;
                              handleInputChange(
                                "certificates",
                                newCertificates
                              );
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="Mô tả ngắn về chứng chỉ"
                          />
                        </div>
                        {formData.certificates.length > 1 && (
                          <button
                            onClick={() => {
                              const newCertificates =
                                formData.certificates.filter(
                                  (_, i) => i !== index
                                );
                              handleInputChange(
                                "certificates",
                                newCertificates
                              );
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Xóa chứng chỉ
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        handleInputChange("certificates", [
                          ...formData.certificates,
                          {
                            name: "",
                            description: "",
                            issuedBy: "",
                            file: null,
                            imageUrl: "",
                            imageFileName: "",
                          },
                        ]);
                      }}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      + Thêm chứng chỉ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Học vấn</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.noEducation}
                      onChange={(e) =>
                        handleInputChange("noEducation", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      Tôi chưa có bằng cấp chính thức
                    </span>
                  </label>
                </div>

                {!formData.noEducation && (
                  <div className="space-y-4">
                    {formData.educations.map((education, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tên trường
                            </label>
                            <input
                              type="text"
                              value={education.schoolName}
                              onChange={(e) => {
                                const newEducations = [...formData.educations];
                                newEducations[index].schoolName =
                                  e.target.value;
                                handleInputChange("educations", newEducations);
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ví dụ: Đại học Bách Khoa Hà Nội"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bằng cấp
                            </label>
                            <input
                              type="text"
                              value={education.degree}
                              onChange={(e) => {
                                const newEducations = [...formData.educations];
                                newEducations[index].degree = e.target.value;
                                handleInputChange("educations", newEducations);
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ví dụ: Cử nhân"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chuyên ngành
                          </label>
                          <input
                            type="text"
                            value={education.major}
                            onChange={(e) => {
                              const newEducations = [...formData.educations];
                              newEducations[index].major = e.target.value;
                              handleInputChange("educations", newEducations);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ví dụ: Công nghệ thông tin"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Năm bắt đầu
                            </label>
                            <input
                              type="number"
                              value={education.fromTime || ""}
                              onChange={(e) => {
                                const newEducations = [...formData.educations];
                                newEducations[index].fromTime =
                                  parseInt(e.target.value) || 0;
                                handleInputChange("educations", newEducations);
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="2020"
                              min="1900"
                              max="2030"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Năm kết thúc
                            </label>
                            <input
                              type="number"
                              value={education.toTime || ""}
                              onChange={(e) => {
                                const newEducations = [...formData.educations];
                                newEducations[index].toTime =
                                  parseInt(e.target.value) || 0;
                                handleInputChange("educations", newEducations);
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="2024"
                              min="1900"
                              max="2030"
                            />
                          </div>
                        </div>
                        {formData.educations.length > 1 && (
                          <button
                            onClick={() => {
                              const newEducations = formData.educations.filter(
                                (_, i) => i !== index
                              );
                              handleInputChange("educations", newEducations);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Xóa học vấn
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        handleInputChange("educations", [
                          ...formData.educations,
                          {
                            schoolName: "",
                            degree: "",
                            major: "",
                            fromTime: 0,
                            toTime: 0,
                            degreeFileName: "",
                            degreeFileUrl: "",
                          },
                        ]);
                      }}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      + Thêm học vấn
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Tiêu đề chuyên môn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề chuyên môn *
                  </label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) =>
                      handleInputChange("headline", e.target.value)
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Ví dụ: Giảng viên Tiếng Anh với 5 năm kinh nghiệm"
                  />
                  {errors.headline && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.headline}
                    </p>
                  )}
                </div>

                {/* Giới thiệu bản thân */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới thiệu bản thân *
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Hãy giới thiệu về bản thân, phong cách giảng dạy và những gì bạn có thể mang lại cho học viên..."
                  />
                  {errors.bio && (
                    <p className="text-red-500 text-xs mt-1">{errors.bio}</p>
                  )}
                </div>

                {/* Kinh nghiệm giảng dạy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kinh nghiệm giảng dạy *
                  </label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) =>
                      handleInputChange("experience", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Mô tả kinh nghiệm giảng dạy của bạn, các thành tích đã đạt được..."
                  />
                  {errors.experience && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.experience}
                    </p>
                  )}
                </div>

                {/* Đối tượng học viên */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đối tượng học viên mong muốn *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {teachingAudiences.map((audience) => (
                      <label key={audience.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.teachingAudiences.includes(
                            audience.name
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange("teachingAudiences", [
                                ...formData.teachingAudiences,
                                audience.name,
                              ]);
                            } else {
                              handleInputChange(
                                "teachingAudiences",
                                formData.teachingAudiences.filter(
                                  (aud) => aud !== audience.name
                                )
                              );
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {audience.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.teachingAudiences && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.teachingAudiences}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video giới thiệu (tùy chọn)
                  </label>
                  <input
                    type="url"
                    value={formData.videoIntro}
                    onChange={(e) =>
                      handleInputChange("videoIntro", e.target.value)
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Nhập link YouTube hoặc video giới thiệu"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Video giới thiệu giúp học viên hiểu rõ hơn về bạn và phong
                    cách giảng dạy
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Thời gian có thể dạy *
                  </label>

                  {/* Available times list */}
                  <div className="space-y-3 mb-4">
                    {formData.availableTimes.map((time, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm">
                          {time.dayOfWeek}: {time.startTime} - {time.endTime}
                        </span>
                        <button
                          onClick={() => {
                            const newTimes = formData.availableTimes.filter(
                              (_, i) => i !== index
                            );
                            handleInputChange("availableTimes", newTimes);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add new time slot */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-lg">
                    <select
                      id="dayOfWeek"
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn ngày</option>
                      <option value="Thứ 2">Thứ 2</option>
                      <option value="Thứ 3">Thứ 3</option>
                      <option value="Thứ 4">Thứ 4</option>
                      <option value="Thứ 5">Thứ 5</option>
                      <option value="Thứ 6">Thứ 6</option>
                      <option value="Thứ 7">Thứ 7</option>
                      <option value="Chủ nhật">Chủ nhật</option>
                    </select>
                    <input
                      type="time"
                      id="startTime"
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="time"
                      id="endTime"
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const daySelect = document.getElementById(
                          "dayOfWeek"
                        ) as HTMLSelectElement;
                        const startInput = document.getElementById(
                          "startTime"
                        ) as HTMLInputElement;
                        const endInput = document.getElementById(
                          "endTime"
                        ) as HTMLInputElement;

                        if (
                          daySelect.value &&
                          startInput.value &&
                          endInput.value
                        ) {
                          const newTime = {
                            dayOfWeek: daySelect.value,
                            startTime: startInput.value,
                            endTime: endInput.value,
                          };

                          handleInputChange("availableTimes", [
                            ...formData.availableTimes,
                            newTime,
                          ]);

                          // Reset form
                          daySelect.value = "";
                          startInput.value = "";
                          endInput.value = "";
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Thêm
                    </button>
                  </div>

                  {errors.availableTimes && (
                    <p className="text-red-500 text-sm">
                      {errors.availableTimes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = (step: number) => {
    const titles = [
      "Thông tin cơ bản",
      "Ảnh đại diện & CV",
      "Chứng chỉ",
      "Học vấn",
      "Giới thiệu",
      "Video",
      "Thời gian dạy",
    ];
    return titles[step - 1] || "";
  };

  // Kiểm tra tất cả bước có hoàn thành không
  const areAllStepsCompleted = () => {
    for (let i = 1; i <= totalSteps; i++) {
      if (!isStepCompleted(i)) return false;
    }
    return true;
  };

  // Kiểm tra có thể navigate đến step này không
  const canNavigateToStep = (step: number) => {
    if (step === 1) return true; // Always allow step 1

    // Check if all previous steps are completed
    for (let i = 1; i < step; i++) {
      if (!completedSteps.has(i)) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section - Larger and more prominent */}
      <div
        className="shadow-2xl"
        style={{ backgroundColor: "rgb(148, 204, 230)" }}
      >
        <div className="container mx-auto px-4 py-6">
          {/* Progress Steps - Desktop */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-center space-x-4">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                (step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
                        step === currentStep
                          ? "bg-white cursor-pointer"
                          : completedSteps.has(step)
                          ? "text-white hover:opacity-80 cursor-pointer"
                          : canNavigateToStep(step)
                          ? "bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                          : "bg-gray-400/50 text-gray-500 cursor-not-allowed"
                      }`}
                      style={{
                        backgroundColor:
                          step === currentStep
                            ? "white"
                            : completedSteps.has(step)
                            ? "rgb(148, 204, 230)"
                            : canNavigateToStep(step)
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(156, 163, 175, 0.5)",
                        color:
                          step === currentStep
                            ? "rgb(31, 41, 55)" // Màu xám đậm để dễ đọc trên nền trắng
                            : completedSteps.has(step)
                            ? "white"
                            : canNavigateToStep(step)
                            ? "white"
                            : "rgb(107, 114, 128)",
                      }}
                      onClick={() => canNavigateToStep(step) && goToStep(step)}
                    >
                      {step} {getStepTitle(step)}
                    </div>
                    {step < totalSteps && (
                      <span className="text-gray-600 text-lg">&gt;</span>
                    )}
                  </React.Fragment>
                )
              )}
            </div>
          </div>

          {/* Progress Steps - Mobile */}
          <div className="lg:hidden">
            <div className="flex items-center justify-center space-x-2 overflow-x-auto">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                (step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                        step === currentStep
                          ? "bg-white cursor-pointer"
                          : completedSteps.has(step)
                          ? "text-white hover:opacity-80 cursor-pointer"
                          : canNavigateToStep(step)
                          ? "bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                          : "bg-gray-400/50 text-gray-500 cursor-not-allowed"
                      }`}
                      style={{
                        backgroundColor:
                          step === currentStep
                            ? "white"
                            : completedSteps.has(step)
                            ? "rgb(148, 204, 230)"
                            : canNavigateToStep(step)
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(156, 163, 175, 0.5)",
                        color:
                          step === currentStep
                            ? "rgb(31, 41, 55)" // Màu xám đậm để dễ đọc trên nền trắng
                            : completedSteps.has(step)
                            ? "white"
                            : canNavigateToStep(step)
                            ? "white"
                            : "rgb(107, 114, 128)",
                      }}
                      onClick={() => canNavigateToStep(step) && goToStep(step)}
                    >
                      {step} {getStepTitle(step)}
                    </div>
                    {step < totalSteps && (
                      <span className="text-gray-600 text-sm">&gt;</span>
                    )}
                  </React.Fragment>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Form Header */}
            <div
              className="px-8 py-6"
              style={{ backgroundColor: "rgb(148, 204, 230)" }}
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                {getStepTitle(currentStep)}
              </h3>
              <p className="text-white text-sm opacity-90">
                {currentStep === 1 &&
                  "Cập nhật thông tin cá nhân của bạn. Thông tin sẽ được lưu và có thể chỉnh sửa bất cứ lúc nào."}
                {currentStep === 2 &&
                  "Cập nhật ảnh đại diện chuyên nghiệp để tạo ấn tượng tốt với học viên."}
                {currentStep === 3 &&
                  "Cập nhật các chứng chỉ và bằng cấp của bạn để tăng độ tin cậy."}
                {currentStep === 4 &&
                  "Cập nhật thông tin học vấn và chuyên môn của bạn."}
                {currentStep === 5 &&
                  "Cập nhật giới thiệu bản thân và phương pháp giảng dạy độc đáo của bạn."}
                {currentStep === 6 &&
                  "Cập nhật video giới thiệu ngắn để học viên hiểu rõ hơn về bạn."}
                {currentStep === 7 &&
                  "Cập nhật lịch dạy phù hợp với thời gian rảnh của bạn."}
              </p>
            </div>

            {/* Form Body */}
            <div className="p-8">{renderStepContent()}</div>

            {/* Navigation Buttons */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                {/* Nhóm bên trái: Quay lại và Tiếp tục */}
                <div className="flex space-x-3">
                  {/* Nút Quay lại */}
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      className="flex items-center px-6 py-3 text-gray-700 bg-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium hover:bg-gray-300"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Quay lại
                    </button>
                  )}

                  {/* Nút Tiếp tục */}
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= totalSteps}
                    className="flex items-center px-8 py-3 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        currentStep >= totalSteps ? "#9ca3af" : "#94cce6",
                    }}
                  >
                    Tiếp tục
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Nhóm bên phải: Lưu nháp và Cập nhật hồ sơ */}
                <div className="flex space-x-3">
                  {/* Nút Lưu nháp */}
                  <button
                    onClick={saveDraft}
                    disabled={isDraftSaving}
                    className="flex items-center px-6 py-3 text-gray-700 bg-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium hover:bg-gray-300 disabled:opacity-50"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {isDraftSaving ? "Đang lưu..." : "Lưu nháp"}
                  </button>

                  {/* Nút Cập nhật hồ sơ */}
                  <button
                    onClick={handleSubmit}
                    disabled={!areAllStepsCompleted() || isSubmitting}
                    className="flex items-center px-8 py-3 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: areAllStepsCompleted()
                        ? "#10b981"
                        : "#9ca3af",
                    }}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {isSubmitting ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Preview Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tải lên {uploadType === "avatar" ? "ảnh đại diện" : "CV"}
            </h3>

            <div className="mb-4">
              <input
                type="file"
                accept={uploadType === "avatar" ? "image/*" : ".pdf,.doc,.docx"}
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              {!previewFile ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">📁</div>
                  <p>Chọn file để xem trước</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadType === "avatar" ? (
                    <div className="w-40 h-40 mx-auto border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(previewFile)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {previewFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setPreviewFile(null)}
                    className="px-3 py-1 text-sm text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Xoá
                  </button>
                </div>
              )}

              {/* Error message */}
              {(errors.imageAvatar || errors.cvFile) && (
                <div className="mt-2 text-sm text-red-600">
                  {errors.imageAvatar || errors.cvFile}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleCancelUpload}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Huỷ
              </button>
              {previewFile && (
                <button
                  onClick={handleConfirmUpload}
                  disabled={isUploading}
                  className="px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  {isUploading ? "Đang tải lên..." : "Áp dụng"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
