import React, { useState, useEffect, useCallback } from "react";
import {
  FileUploadService,
  type UploadResponse,
} from "../../services/fileUploadService";
import { TutorService } from "../../services/tutorService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const BecomeTutor: React.FC = () => {
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
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: "",
    subjects: [] as Array<{ name: string; hourlyRate: string }>,
    email: user?.email || "",
    province: "",
    confirmAge: false,
    acceptTerms: false,

    // Step 2: Ảnh đại diện và CV
    profileImage: null as File | null,
    cvFile: null as File | null,
    profileImageUrl: "",
    cvFileUrl: "",

    // Step 3: Chứng chỉ
    certificates: [
      {
        name: "",
        description: "",
        issuedBy: "",
        file: null,
        imageUrl: "",
      },
    ] as Array<{
      name: string;
      description: string;
      issuedBy: string;
      file: File | null;
      imageUrl: string;
    }>,
    noCertificates: false,

    // Step 4: Học vấn
    education: "",
    university: "",
    major: "",
    graduationYear: "",
    endYear: "",
    degrees: [
      {
        id: "1",
        university: "",
        education: "",
        major: "",
        startYear: "",
        endYear: "",
        file: null,
        imageUrl: "",
      },
    ] as Array<{
      id: string;
      university: string;
      education: string;
      major: string;
      startYear: string;
      endYear: string;
      file: File | null;
      imageUrl: string;
    }>,
    noDegree: false,

    // Step 5: Giới thiệu
    title: "",
    introduction: "",
    experience: "",
    teachingMethods: [] as string[],

    // Step 6: Video
    introductionVideo: null as File | null,
    videoUrl: "",

    // Step 7: Thời gian dạy
    availableDays: [] as string[],
    availableTimes: [] as string[],
    dayTimeSlots: {} as Record<string, Array<{ start: string; end: string }>>,

    teachingLocations: [] as string[],
  });

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: "/become-tutor" } },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate]);

  // Kiểm tra bước có hoàn thành không
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
            formData.subjects.every(
              (subject) =>
                subject.name &&
                subject.hourlyRate &&
                Number(subject.hourlyRate) > 0
            ) &&
            formData.confirmAge &&
            formData.acceptTerms
          );
        case 2:
          return (
            (formData.profileImage !== null || formData.profileImageUrl) &&
            (formData.cvFile !== null || formData.cvFileUrl)
          );
        case 3:
          return (
            formData.noCertificates ||
            (formData.certificates.length > 0 &&
              formData.certificates.every((cert) => cert.name && cert.issuedBy))
          );
        case 4:
          return (
            formData.noDegree ||
            (formData.degrees.length > 0 &&
              formData.degrees.every(
                (degree) =>
                  degree.university &&
                  degree.education &&
                  degree.major &&
                  degree.startYear &&
                  degree.endYear
              ))
          );
        case 5:
          return (
            formData.title &&
            formData.introduction &&
            formData.experience &&
            formData.teachingMethods.length > 0
          );
        case 6: {
          // Video không bắt buộc nhưng cần kiểm tra có video hoặc link YouTube hợp lệ không
          if (formData.introductionVideo !== null) return true;
          if (formData.videoUrl.trim() === "") return false;
          // Kiểm tra URL YouTube có hợp lệ không
          const videoId = extractYouTubeVideoId(formData.videoUrl);
          return videoId !== null;
        }
        case 7:
          return (
            formData.availableDays.length > 0 &&
            Object.keys(formData.dayTimeSlots).some(
              (day) =>
                formData.dayTimeSlots[day] &&
                formData.dayTimeSlots[day].length > 0
            )
          );
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

  // Load draft data đã lưu
  useEffect(() => {
    const loadDraftData = async () => {
      console.log("🔍 Debug: isAuthenticated =", isAuthenticated);
      console.log("🔍 Debug: user =", user);
      const token = localStorage.getItem("token");
      console.log("🔍 Debug: token =", token);

      // Check both isAuthenticated and token existence
      if (isAuthenticated && token) {
        try {
          console.log("✅ User is authenticated, loading draft data...");
          const draftData = await TutorService.getDraftData();

          if (draftData.success && draftData.hasDraft) {
            console.log("✅ Loading saved draft data:", draftData);
            console.log("📝 Current formData before update:", formData);
            console.log(
              "🔍 Raw draftData from backend:",
              JSON.stringify(draftData, null, 2)
            );
            console.log("🔍 Draft data fields:", {
              firstName: draftData.firstName,
              lastName: draftData.lastName,
              phoneNumber: draftData.phoneNumber,
              bio: draftData.bio,
              headline: draftData.headline,
              experience: draftData.experience,
            });
            console.log("🔍 Draft certificates:", draftData.certificates);
            console.log("🔍 Draft educations:", draftData.educations);
            console.log(
              "🔍 Draft certificates length:",
              draftData.certificates?.length
            );
            console.log(
              "🔍 Draft educations length:",
              draftData.educations?.length
            );

            // Điền dữ liệu vào form
            setFormData((prev) => {
              const updatedData = {
                ...prev,
                // Step 1: Thông tin cơ bản
                firstName: draftData.firstName || prev.firstName,
                lastName: draftData.lastName || prev.lastName,
                phone: draftData.phoneNumber || prev.phone,
                email: draftData.email || prev.email,
                province: draftData.address || prev.province, // Map address to province
                timezone: draftData.timezone || prev.timezone,

                // Step 2: Ảnh đại diện và CV
                profileImageUrl: draftData.imageAvatar || prev.profileImageUrl,
                cvFileUrl: draftData.cvUrl || prev.cvFileUrl,

                // Step 5: Giới thiệu
                title: draftData.headline || prev.title,
                introduction: draftData.bio || prev.introduction,
                experience: draftData.experience || prev.experience,
                teachingLevel: draftData.teachingLevel || prev.teachingLevel,
                videoUrl: draftData.videoIntro || prev.videoUrl, // Map videoIntro to videoUrl

                // Các mảng dữ liệu
                educations:
                  draftData.educations && draftData.educations.length > 0
                    ? draftData.educations
                    : prev.educations,
                // Map educations to degrees for display
                degrees:
                  draftData.educations && draftData.educations.length > 0
                    ? draftData.educations.map((edu: any) => ({
                        university: edu.schoolName || "",
                        education: edu.degree || "",
                        major: edu.major || "",
                        startYear: edu.fromTime ? edu.fromTime.toString() : "",
                        endYear: edu.toTime ? edu.toTime.toString() : "",
                        file: null, // Reset file object
                        imageUrl: edu.degreeImage || edu.url || "",
                      }))
                    : prev.degrees,
                certificates:
                  draftData.certificates && draftData.certificates.length > 0
                    ? draftData.certificates.map((cert: any) => ({
                        name: cert.name || "",
                        description: cert.description || "",
                        issuedBy: cert.issuedBy || "",
                        file: null, // Reset file object
                        imageUrl: cert.certImage || cert.url || "",
                      }))
                    : prev.certificates,
                schedules:
                  draftData.schedules && draftData.schedules.length > 0
                    ? draftData.schedules
                    : prev.schedules,
                // Map schedules to dayTimeSlots for display
                dayTimeSlots:
                  draftData.schedules && draftData.schedules.length > 0
                    ? draftData.schedules.reduce((acc: any, sched: any) => {
                        // Convert English enum to Vietnamese day names
                        const englishToVietnamese: { [key: string]: string } = {
                          MONDAY: "Thứ 2",
                          TUESDAY: "Thứ 3",
                          WEDNESDAY: "Thứ 4",
                          THURSDAY: "Thứ 5",
                          FRIDAY: "Thứ 6",
                          SATURDAY: "Thứ 7",
                          SUNDAY: "Chủ nhật",
                        };

                        const vietnameseDay =
                          englishToVietnamese[sched.dayOfWeek];
                        if (vietnameseDay) {
                          if (!acc[vietnameseDay]) acc[vietnameseDay] = [];
                          acc[vietnameseDay].push({
                            start: sched.fromTime || "09:00",
                            end: sched.toTime || "10:00",
                          });
                        }
                        return acc;
                      }, {})
                    : prev.dayTimeSlots,
                // Update availableDays based on dayTimeSlots
                availableDays:
                  draftData.schedules && draftData.schedules.length > 0
                    ? draftData.schedules
                        .map((sched: any) => {
                          const englishToVietnamese: { [key: string]: string } =
                            {
                              MONDAY: "Thứ 2",
                              TUESDAY: "Thứ 3",
                              WEDNESDAY: "Thứ 4",
                              THURSDAY: "Thứ 5",
                              FRIDAY: "Thứ 6",
                              SATURDAY: "Thứ 7",
                              SUNDAY: "Chủ nhật",
                            };
                          return englishToVietnamese[sched.dayOfWeek];
                        })
                        .filter((day: string) => day) // Remove undefined values
                    : prev.availableDays,
                // Map teachingMethods from JSON string (convert English to Vietnamese)
                teachingMethods: draftData.teachingMethods
                  ? JSON.parse(draftData.teachingMethods).map(
                      (method: string) => {
                        const englishToVietnamese: { [key: string]: string } = {
                          MIDDLE_SCHOOL: "Trung học cơ sở",
                          HIGH_SCHOOL: "Trung học phổ thông",
                          ELEMENTARY_SCHOOL: "Tiểu học",
                          UNIVERSITY: "Đại học",
                          GRADUATE: "Sau đại học",
                        };
                        return englishToVietnamese[method] || method;
                      }
                    )
                  : prev.teachingMethods,
                // Auto-check confirmations if draft data exists
                confirmAge: true,
                acceptTerms: true,
                subjectFees:
                  draftData.subjectFees && draftData.subjectFees.length > 0
                    ? draftData.subjectFees
                    : prev.subjectFees,
                // Map subjectFees to subjects for display
                subjects:
                  draftData.subjectFees && draftData.subjectFees.length > 0
                    ? draftData.subjectFees.map((fee: any) => ({
                        name:
                          getSubjectName(fee.subjectId) || "Unknown Subject",
                        hourlyRate: fee.fees ? fee.fees.toString() : "0",
                      }))
                    : prev.subjects,
              };

              console.log("🔄 Updated formData:", updatedData);
              console.log("🔄 Updated certificates:", updatedData.certificates);
              console.log("🔄 Updated degrees:", updatedData.degrees);
              return updatedData;
            });

            console.log("✅ Draft data loaded successfully");
            console.log("🎯 Final formData state:", formData);
          } else {
            const message = draftData.message || "No hasDraft flag";
            console.log("No draft data found:", message);

            // Kiểm tra nếu cần authentication
            if (
              message.includes("Authentication") ||
              message.includes("redirected")
            ) {
              console.warn("User authentication may be invalid or expired");
              // Có thể thêm logic để redirect user về login page hoặc refresh token
            }
          }
        } catch (error) {
          console.error("❌ Error loading draft data:", error);
        }
      } else if (token) {
        // Fallback: if we have token but isAuthenticated is false, try loading anyway
        console.log(
          "⚠️ isAuthenticated is false but token exists, trying to load draft data anyway..."
        );
        try {
          const draftData = await TutorService.getDraftData();
          if (draftData.success && draftData.hasDraft) {
            console.log("✅ Loading saved draft data (fallback):", draftData);
            // Same mapping logic as above
            setFormData((prev) => {
              const updatedData = {
                ...prev,
                // Step 1: Thông tin cơ bản
                firstName: draftData.firstName || prev.firstName,
                lastName: draftData.lastName || prev.lastName,
                phone: draftData.phoneNumber || prev.phone,
                email: draftData.email || prev.email,
                province: draftData.address || prev.province,
                timezone: draftData.timezone || prev.timezone,
                // Step 2: Ảnh đại diện và CV
                profileImageUrl: draftData.imageAvatar || prev.profileImageUrl,
                cvFileUrl: draftData.cvUrl || prev.cvFileUrl,
                // Step 5: Giới thiệu
                title: draftData.headline || prev.title,
                introduction: draftData.bio || prev.introduction,
                experience: draftData.experience || prev.experience,
                teachingLevel: draftData.teachingLevel || prev.teachingLevel,
                videoUrl: draftData.videoIntro || prev.videoUrl,
                // Map teachingMethods from JSON string (convert English to Vietnamese)
                teachingMethods: draftData.teachingMethods
                  ? JSON.parse(draftData.teachingMethods).map(
                      (method: string) => {
                        const englishToVietnamese: { [key: string]: string } = {
                          MIDDLE_SCHOOL: "Trung học cơ sở",
                          HIGH_SCHOOL: "Trung học phổ thông",
                          ELEMENTARY_SCHOOL: "Tiểu học",
                          UNIVERSITY: "Đại học",
                          GRADUATE: "Sau đại học",
                        };
                        return englishToVietnamese[method] || method;
                      }
                    )
                  : prev.teachingMethods,
                // Auto-check confirmations if draft data exists
                confirmAge: true,
                acceptTerms: true,
              };
              console.log("🔄 Updated formData (fallback):", updatedData);
              console.log(
                "🔄 Updated certificates (fallback):",
                updatedData.certificates
              );
              console.log(
                "🔄 Updated degrees (fallback):",
                updatedData.degrees
              );
              return updatedData;
            });
          }
        } catch (error) {
          console.error("❌ Error loading draft data (fallback):", error);
        }
      } else {
        console.log("❌ No token found, skipping draft data load");
        console.log("❌ Debug: isAuthenticated =", isAuthenticated);
        console.log("❌ Debug: user =", user);
      }
    };

    loadDraftData();
  }, [isAuthenticated]);

  // Load dữ liệu mặc định
  useEffect(() => {
    // Load subjects from API
    const loadSubjects = async () => {
      try {
        const subjectsData = await TutorService.getSubjects();
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error loading subjects:", error);
        // Fallback to default subjects if API fails
        const defaultSubjects = [
          { id: 1, name: "Tiếng Anh" },
          { id: 2, name: "Toán" },
          { id: 3, name: "Ngữ văn" },
          { id: 4, name: "IELTS" },
          { id: 5, name: "Tiếng Trung" },
          { id: 6, name: "Tiếng Hàn" },
          { id: 7, name: "Hóa học" },
          { id: 8, name: "Vật lý" },
          { id: 9, name: "Luyện thi ĐGNL" },
          { id: 10, name: "Tiếng Pháp" },
          { id: 11, name: "Tiếng Nhật" },
          { id: 12, name: "Tiếng Đức" },
          { id: 13, name: "TOEIC" },
          { id: 14, name: "HSK" },
          { id: 15, name: "DELF & TCF" },
          { id: 16, name: "JLPT" },
          { id: 17, name: "TOPIK" },
          { id: 18, name: "SAT" },
          { id: 19, name: "TOEFL iBT" },
          { id: 20, name: "Cambridge" },
          { id: 21, name: "PTE Academic" },
          { id: 22, name: "ACT" },
          { id: 23, name: "Địa Lý" },
          { id: 24, name: "MOS" },
          { id: 25, name: "Giáo dục công dân" },
          { id: 26, name: "Sinh học" },
          { id: 27, name: "Lịch sử" },
        ];
        setSubjects(defaultSubjects);
      }
    };

    loadSubjects();

    // Danh sách tỉnh/thành phố Việt Nam
    const vietnamProvinces = [
      { id: 1, name: "Hà Nội" },
      { id: 2, name: "TP. Hồ Chí Minh" },
      { id: 3, name: "Đà Nẵng" },
      { id: 4, name: "Hải Phòng" },
      { id: 5, name: "Cần Thơ" },
      { id: 6, name: "An Giang" },
      { id: 7, name: "Bà Rịa - Vũng Tàu" },
      { id: 8, name: "Bắc Giang" },
      { id: 9, name: "Bắc Kạn" },
      { id: 10, name: "Bạc Liêu" },
      { id: 11, name: "Bắc Ninh" },
      { id: 12, name: "Bến Tre" },
      { id: 13, name: "Bình Định" },
      { id: 14, name: "Bình Dương" },
      { id: 15, name: "Bình Phước" },
      { id: 16, name: "Bình Thuận" },
      { id: 17, name: "Cà Mau" },
      { id: 18, name: "Cao Bằng" },
      { id: 19, name: "Đắk Lắk" },
      { id: 20, name: "Đắk Nông" },
      { id: 21, name: "Điện Biên" },
      { id: 22, name: "Đồng Nai" },
      { id: 23, name: "Đồng Tháp" },
      { id: 24, name: "Gia Lai" },
      { id: 25, name: "Hà Giang" },
      { id: 26, name: "Hà Nam" },
      { id: 27, name: "Hà Tĩnh" },
      { id: 28, name: "Hải Dương" },
      { id: 29, name: "Hậu Giang" },
      { id: 30, name: "Hòa Bình" },
      { id: 31, name: "Hưng Yên" },
      { id: 32, name: "Khánh Hòa" },
      { id: 33, name: "Kiên Giang" },
      { id: 34, name: "Kon Tum" },
      { id: 35, name: "Lai Châu" },
      { id: 36, name: "Lâm Đồng" },
      { id: 37, name: "Lạng Sơn" },
      { id: 38, name: "Lào Cai" },
      { id: 39, name: "Long An" },
      { id: 40, name: "Nam Định" },
      { id: 41, name: "Nghệ An" },
      { id: 42, name: "Ninh Bình" },
      { id: 43, name: "Ninh Thuận" },
      { id: 44, name: "Phú Thọ" },
      { id: 45, name: "Phú Yên" },
      { id: 46, name: "Quảng Bình" },
      { id: 47, name: "Quảng Nam" },
      { id: 48, name: "Quảng Ngãi" },
      { id: 49, name: "Quảng Ninh" },
      { id: 50, name: "Quảng Trị" },
      { id: 51, name: "Sóc Trăng" },
      { id: 52, name: "Sơn La" },
      { id: 53, name: "Tây Ninh" },
      { id: 54, name: "Thái Bình" },
      { id: 55, name: "Thái Nguyên" },
      { id: 56, name: "Thanh Hóa" },
      { id: 57, name: "Thừa Thiên Huế" },
      { id: 58, name: "Tiền Giang" },
      { id: 59, name: "Trà Vinh" },
      { id: 60, name: "Tuyên Quang" },
      { id: 61, name: "Vĩnh Long" },
      { id: 62, name: "Vĩnh Phúc" },
      { id: 63, name: "Yên Bái" },
    ];

    setProvinces(vietnamProvinces);
    setFilteredProvinces(vietnamProvinces);
  }, []);

  // Danh sách đối tượng nhận dạy
  const teachingLevels = [
    "Trung học cơ sở",
    "Trung học phổ thông",
    "Trung cấp nghề",
    "Cao đẳng / Đại học",
    "Sau đại học",
    "Người đi làm",
    "Học tự do",
  ];

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".province-dropdown")) {
        setShowProvinceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hiển thị loading nếu chưa xác định trạng thái đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  const availableDays = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  const handleInputChange = (
    field: string,
    value:
      | string
      | number
      | boolean
      | string[]
      | File
      | null
      | Array<{
          name: string;
          description: string;
          issuedBy: string;
          file: File | null;
        }>
      | Array<{
          name: string;
          hourlyRate: string;
        }>
      | File
      | Record<string, Array<{ start: string; end: string }>>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const addTimeSlot = (day: string) => {
    const newTimeSlot = { start: "09:00", end: "10:30" };
    setFormData((prev) => ({
      ...prev,
      dayTimeSlots: {
        ...prev.dayTimeSlots,
        [day]: [...(prev.dayTimeSlots[day] || []), newTimeSlot],
      },
    }));
  };

  // Upload modal handlers
  const handleFileSelect = (file: File, type: "avatar" | "cv") => {
    // Validate file size
    const maxSize = type === "avatar" ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for avatar, 10MB for CV
    if (file.size > maxSize) {
      const maxSizeMB = type === "avatar" ? 5 : 10;
      setErrors((prev) => ({
        ...prev,
        [type === "avatar"
          ? "profileImage"
          : "cvFile"]: `File quá lớn! Kích thước tối đa là ${maxSizeMB}MB`,
      }));
      return;
    }

    // Validate file type
    if (type === "avatar" && !file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Vui lòng chọn file ảnh hợp lệ",
      }));
      return;
    }

    if (
      type === "cv" &&
      !(
        file.type === "application/pdf" ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx")
      )
    ) {
      setErrors((prev) => ({
        ...prev,
        cvFile: "Vui lòng chọn file PDF, DOC hoặc DOCX",
      }));
      return;
    }

    // Clear errors and set file
    setErrors((prev) => ({
      ...prev,
      [type === "avatar" ? "profileImage" : "cvFile"]: "",
    }));

    setPreviewFile(file);
    setUploadType(type);
  };

  const handleOpenUploadModal = (type: "avatar" | "cv") => {
    setUploadType(type);
    setPreviewFile(null);
    setShowUploadModal(true);
  };

  const handleConfirmUpload = async () => {
    if (!previewFile) return;

    setIsUploading(true);
    setShowUploadModal(false);

    try {
      if (uploadType === "avatar") {
        handleFileChange("profileImage", previewFile);

        // Upload via backend
        const formData = new FormData();
        formData.append("file", previewFile);

        const response = await fetch(
          "http://localhost:8080/api/files/upload/avatar",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Backend upload error:", errorData);
          throw new Error(
            `Upload failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          profileImageUrl: data.url,
        }));
      } else {
        handleFileChange("cvFile", previewFile);

        // Upload via backend
        const formData = new FormData();
        formData.append("file", previewFile);

        const response = await fetch(
          "http://localhost:8080/api/public/upload/image?folder=tutormatch/cvs",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Backend upload error:", errorData);
          throw new Error(
            `Upload failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          cvFileUrl: data.url,
        }));
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setErrors((prev) => ({
        ...prev,
        [uploadType === "avatar" ? "profileImage" : "cvFile"]:
          "Upload thất bại. Vui lòng thử lại.",
      }));
    } finally {
      setIsUploading(false);
      setPreviewFile(null);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setPreviewFile(null);
  };

  // Hàm xử lý khi chọn ngày - tự động thêm khung giờ mặc định
  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      // Khi chọn ngày, thêm khung giờ mặc định 9h-10h30
      const newTimeSlot = { start: "09:00", end: "10:30" };
      setFormData((prev) => ({
        ...prev,
        availableDays: [...prev.availableDays, day],
        dayTimeSlots: {
          ...prev.dayTimeSlots,
          [day]: [newTimeSlot],
        },
      }));
    } else {
      // Khi bỏ chọn ngày, xóa tất cả khung giờ
      setFormData((prev) => ({
        ...prev,
        availableDays: prev.availableDays.filter((d) => d !== day),
        dayTimeSlots: {
          ...prev.dayTimeSlots,
          [day]: [],
        },
      }));
    }
  };

  const removeTimeSlot = (day: string, slotIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      dayTimeSlots: {
        ...prev.dayTimeSlots,
        [day]:
          prev.dayTimeSlots[day]?.filter((_, index) => index !== slotIndex) ||
          [],
      },
    }));
  };

  // Hàm xử lý bằng cấp
  const addDegree = () => {
    const newDegree = {
      id: Date.now().toString(),
      university: "",
      education: "",
      major: "",
      startYear: "",
      endYear: "",
      file: null,
      imageUrl: "",
    };
    setFormData((prev) => ({
      ...prev,
      degrees: [...prev.degrees, newDegree],
    }));
  };

  const removeDegree = (degreeId: string) => {
    setFormData((prev) => ({
      ...prev,
      degrees: prev.degrees.filter((degree) => degree.id !== degreeId),
    }));
  };

  const updateDegree = (
    degreeId: string,
    field: string,
    value: string | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      degrees: prev.degrees.map((degree) =>
        degree.id === degreeId ? { ...degree, [field]: value } : degree
      ),
    }));
  };

  const handleNoDegreeChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      noDegree: checked,
      // Không xóa dữ liệu degrees, chỉ thay đổi trạng thái hiển thị
    }));
  };

  const handleNoCertificatesChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      noCertificates: checked,
      // Không xóa dữ liệu certificates, chỉ thay đổi trạng thái hiển thị
    }));
  };

  // Hàm extract video ID từ YouTube URL
  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Hàm tạo embed URL từ video ID
  const getYouTubeEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Tạo danh sách giờ từ 0h đến 23h30 (mỗi 30 phút)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  // Tính giờ kết thúc (giờ bắt đầu + 1.5h)
  const calculateEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + 90; // +1.5h = 90 phút
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Chuyển đổi thời gian thành phút để dễ so sánh
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Kiểm tra lịch trùng nhau
  const hasOverlappingSchedule = (
    day: string,
    slotIndex: number,
    newSlot: { start: string; end: string }
  ): boolean => {
    const currentSlots = formData.dayTimeSlots[day] || [];

    for (let i = 0; i < currentSlots.length; i++) {
      if (i === slotIndex) continue; // Bỏ qua slot hiện tại đang edit

      const existingSlot = currentSlots[i];
      const existingStart = timeToMinutes(existingSlot.start);
      const existingEnd = timeToMinutes(existingSlot.end);
      const newStart = timeToMinutes(newSlot.start);
      const newEnd = timeToMinutes(newSlot.end);

      // Kiểm tra overlap: (newStart < existingEnd) && (newEnd > existingStart)
      if (newStart < existingEnd && newEnd > existingStart) {
        return true;
      }
    }

    return false;
  };

  const updateTimeSlot = (
    day: string,
    slotIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    setFormData((prev) => {
      const currentSlots = prev.dayTimeSlots[day] || [];
      const updatedSlots = currentSlots.map((slot, index) => {
        if (index === slotIndex) {
          if (field === "start") {
            // Khi thay đổi giờ bắt đầu, tự động tính giờ kết thúc
            const newSlot = {
              ...slot,
              start: value,
              end: calculateEndTime(value),
            };

            // Kiểm tra lịch trùng nhau
            if (hasOverlappingSchedule(day, slotIndex, newSlot)) {
              alert("Lịch dạy này trùng với lịch khác trong cùng ngày!");
              return slot; // Giữ nguyên giá trị cũ
            }

            return newSlot;
          } else {
            // Không cho phép thay đổi giờ kết thúc thủ công
            return slot;
          }
        }
        return slot;
      });

      return {
        ...prev,
        dayTimeSlots: {
          ...prev.dayTimeSlots,
          [day]: updatedSlots,
        },
      };
    });
  };

  // Xử lý autocomplete tỉnh/TP
  const handleProvinceChange = (value: string) => {
    console.log("Province input changed:", value);
    setFormData((prev) => ({
      ...prev,
      province: value,
    }));

    if (value.trim() === "") {
      setFilteredProvinces(provinces);
      setShowProvinceDropdown(false);
    } else {
      const filtered = provinces.filter((province) =>
        province.name.toLowerCase().includes(value.toLowerCase())
      );
      console.log("Filtered provinces:", filtered.length);
      setFilteredProvinces(filtered);
      setShowProvinceDropdown(true);
    }
  };

  const selectProvince = (province: { id: number; name: string }) => {
    console.log("Selecting province:", province.name);
    setFormData((prev) => ({
      ...prev,
      province: province.name,
    }));
    setShowProvinceDropdown(false);
    setFilteredProvinces(provinces);
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (isStepCompleted(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      let errorMessage =
        "Vui lòng hoàn thành tất cả thông tin bắt buộc trước khi tiếp tục.";

      // Thông báo lỗi cụ thể cho từng step
      if (currentStep === 6) {
        if (
          formData.videoUrl.trim() !== "" &&
          extractYouTubeVideoId(formData.videoUrl) === null
        ) {
          errorMessage =
            "Vui lòng nhập đúng định dạng URL YouTube (youtube.com/watch?v=, youtu.be/, youtube.com/embed/)";
        } else {
          errorMessage =
            "Vui lòng thêm video giới thiệu hoặc nhập link YouTube hợp lệ.";
        }
      }

      alert(errorMessage);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step < 1 || step > totalSteps) return;

    // Allow going to step 1 always
    if (step === 1) {
      setCurrentStep(step);
      return;
    }

    // For other steps, check if all previous steps are completed
    let canNavigate = true;
    for (let i = 1; i < step; i++) {
      if (!completedSteps.has(i)) {
        canNavigate = false;
        break;
      }
    }

    if (canNavigate) {
      setCurrentStep(step);
    }
  };

  // Helper functions
  const getSubjectId = (subjectName: string): number => {
    const subjectMap: { [key: string]: number } = {
      Toán: 1,
      "Vật lý": 2,
      "Hóa học": 3,
      "Sinh học": 4,
      "Tiếng Anh": 5,
      "Văn học": 6,
      "Lịch sử": 7,
      "Địa lý": 8,
      "Tin học": 9,
      "Âm nhạc": 10,
      "Mỹ thuật": 11,
      "Thể dục": 12,
    };
    return subjectMap[subjectName] || 1;
  };

  const getSubjectName = (subjectId: number): string => {
    const subjectMap: { [key: number]: string } = {
      1: "Toán",
      2: "Vật lý",
      3: "Hóa học",
      4: "Sinh học",
      5: "Tiếng Anh",
      6: "Văn học",
      7: "Lịch sử",
      8: "Địa lý",
      9: "Tin học",
      10: "Âm nhạc",
      11: "Mỹ thuật",
      12: "Thể dục",
    };
    return subjectMap[subjectId] || "Unknown Subject";
  };

  const mapDayToEnum = (day: string): string => {
    const dayMap: { [key: string]: string } = {
      "Thứ 2": "MONDAY",
      "Thứ 3": "TUESDAY",
      "Thứ 4": "WEDNESDAY",
      "Thứ 5": "THURSDAY",
      "Thứ 6": "FRIDAY",
      "Thứ 7": "SATURDAY",
      "Chủ nhật": "SUNDAY",
      // Fallback for English keys
      monday: "MONDAY",
      tuesday: "TUESDAY",
      wednesday: "WEDNESDAY",
      thursday: "THURSDAY",
      friday: "FRIDAY",
      saturday: "SATURDAY",
      sunday: "SUNDAY",
    };
    return dayMap[day] || "MONDAY";
  };

  const convertFormDataToTutorData = () => {
    // Convert Vietnamese teaching methods to English
    const vietnameseToEnglish: { [key: string]: string } = {
      "Trung học cơ sở": "MIDDLE_SCHOOL",
      "Trung học phổ thông": "HIGH_SCHOOL",
      "Tiểu học": "ELEMENTARY_SCHOOL",
      "Đại học": "UNIVERSITY",
      "Sau đại học": "GRADUATE",
    };

    const englishTeachingMethods = (formData.teachingMethods || []).map(
      (method) => vietnameseToEnglish[method] || method
    );

    return {
      // Thông tin cơ bản
      bio: formData.introduction || "",
      headline: formData.title || "",
      experience: formData.experience || "",
      teachingLevel: "MIDDLE_SCHOOL", // TODO: Map từ formData.teachingMethods
      teachingMethods: JSON.stringify(englishTeachingMethods),

      // Thông tin cá nhân
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      dateOfBirth: null, // TODO: Thêm vào form nếu cần
      gender: null, // TODO: Thêm vào form nếu cần
      phoneNumber: formData.phone || "",
      address: formData.province || "",
      timezone: "Asia/Ho_Chi_Minh",

      // Avatar và CV
      avatar: formData.profileImageUrl || "",
      cvUrl: formData.cvFileUrl || "",

      // Video giới thiệu
      videoIntro: formData.videoUrl || "",

      // Môn học với học phí
      subjectFees: formData.subjects
        ? formData.subjects.map((subject) => ({
            subjectId: getSubjectId(subject.name),
            fees:
              subject.hourlyRate &&
              !isNaN(parseInt(subject.hourlyRate.replace(/\D/g, "")))
                ? parseInt(subject.hourlyRate.replace(/\D/g, ""))
                : 100000,
          }))
        : [],

      // Lịch dạy
      schedules: formData.dayTimeSlots
        ? Object.entries(formData.dayTimeSlots).flatMap(([day, slots]) =>
            slots.map((slot) => ({
              dayOfWeek: mapDayToEnum(day),
              fromTime: slot.start || "09:00",
              toTime: slot.end || "10:00",
              enable: true,
            }))
          )
        : [],

      // Học vấn - Chuyển đổi thành Array
      educations:
        formData.noDegree || !formData.degrees
          ? []
          : formData.degrees.map((degree) => ({
              schoolName: degree.university || "",
              degree: degree.education || "",
              major: degree.major || "",
              fromTime:
                degree.startYear && !isNaN(parseInt(degree.startYear))
                  ? parseInt(degree.startYear)
                  : 2020,
              toTime:
                degree.endYear && !isNaN(parseInt(degree.endYear))
                  ? parseInt(degree.endYear)
                  : 2024,
              degreeImage: degree.imageUrl || "",
            })),

      // Chứng chỉ - Chuyển đổi thành Array
      certificates:
        formData.noCertificates || !formData.certificates
          ? []
          : formData.certificates.map((cert) => ({
              name: cert.name || "",
              issuedBy: cert.issuedBy || "",
              description: cert.description || "",
              certImage: cert.imageUrl || "",
            })),
    };
  };

  const saveDraft = async () => {
    setIsDraftSaving(true);
    try {
      const tutorData = convertFormDataToTutorData();
      console.log(
        "🔍 Data being sent to backend:",
        JSON.stringify(tutorData, null, 2)
      );
      console.log("🔍 Educations structure:", tutorData.educations);
      console.log("🔍 Certificates structure:", tutorData.certificates);
      console.log("🔍 FormData noDegree:", formData.noDegree);
      console.log("🔍 FormData noCertificates:", formData.noCertificates);
      console.log("🔍 FormData degrees:", formData.degrees);
      console.log("🔍 FormData certificates:", formData.certificates);
      const response = await TutorService.saveDraft(tutorData);
      if (response.success) {
        alert("Đã lưu nháp thành công!");
      } else {
        alert(`Lỗi khi lưu nháp: ${response.error}`);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Có lỗi khi lưu nháp!");
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (areAllStepsCompleted()) {
      setIsSubmitting(true);
      try {
        const tutorData = convertFormDataToTutorData();
        const response = await TutorService.submitApplication(tutorData);
        if (response.success) {
          alert(
            "Đơn đăng ký đã được gửi thành công! Chúng tôi sẽ xem xét và phản hồi trong 2-3 ngày."
          );
          navigate("/");
        } else {
          alert(`Lỗi khi gửi đăng ký: ${response.error}`);
        }
      } catch (error) {
        console.error("Error submitting application:", error);
        alert("Có lỗi khi gửi đăng ký!");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                  Thông tin cơ bản
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Điền thông tin cá nhân và liên hệ của bạn
                </p>
              </div>

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
                              className="w-20 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="100k"
                              min="50000"
                            />
                            <span className="text-xs text-gray-500">
                              đ/buổi
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newSubjects = formData.subjects.filter(
                                  (_, i) => i !== index
                                );
                                handleInputChange("subjects", newSubjects);
                              }}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
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

                {/* Xác nhận - Compact */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="age-confirm"
                      checked={formData.confirmAge}
                      onChange={(e) =>
                        handleInputChange("confirmAge", e.target.checked)
                      }
                      className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded mt-0.5 ${
                        errors.confirmAge ? "border-red-500" : ""
                      }`}
                    />
                    <label
                      htmlFor="age-confirm"
                      className="ml-3 block text-sm text-gray-700"
                    >
                      Tôi xác nhận đã đủ 18 tuổi
                    </label>
                  </div>
                  {errors.confirmAge && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmAge}
                    </p>
                  )}

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms-confirm"
                      checked={formData.acceptTerms}
                      onChange={(e) =>
                        handleInputChange("acceptTerms", e.target.checked)
                      }
                      className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded mt-0.5 ${
                        errors.acceptTerms ? "border-red-500" : ""
                      }`}
                    />
                    <label
                      htmlFor="terms-confirm"
                      className="ml-3 block text-sm text-gray-700"
                    >
                      Tôi đồng ý với{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        điều khoản sử dụng
                      </a>{" "}
                      và{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        chính sách bảo mật
                      </a>{" "}
                      của TutorMatch
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Grid Layout cho 2 phần upload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ảnh đại diện */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 text-center">
                  Ảnh đại diện
                </h3>

                <div className="flex flex-col items-center space-y-6">
                  {/* Avatar Display */}
                  <div className="w-40 h-40 border border-gray-300 rounded-lg flex items-center justify-center bg-white">
                    {formData.profileImage ? (
                      <img
                        src={URL.createObjectURL(formData.profileImage)}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : formData.profileImageUrl ? (
                      <img
                        src={formData.profileImageUrl}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">👤</div>
                        <p className="text-sm">Chưa có ảnh</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          handleFileSelect(file, "avatar");
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => handleOpenUploadModal("avatar")}
                      disabled={isUploading}
                      className={`inline-flex items-center px-6 py-3 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium cursor-pointer ${
                        isUploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      style={{ backgroundColor: "#94cce6" }}
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Tải ảnh lên
                    </button>
                  </div>

                  {/* Requirements */}
                  <div
                    className="w-full p-4 rounded-lg"
                    style={{ backgroundColor: "oklch(0.97 0.01 0)" }}
                  >
                    <h4 className="font-medium text-gray-900 mb-3">
                      Yêu cầu ảnh đại diện
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Hiện rõ khuôn mặt và mắt
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Chất lượng tốt, không bị mờ
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Định dạng JPG, PNG
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Kích thước tối đa 10MB
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* File CV */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 text-center">
                  CV/Resume
                </h3>

                <div className="flex flex-col items-center space-y-6">
                  {/* CV Display */}
                  <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white min-h-[160px]">
                    {formData.cvFile ? (
                      <div className="text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {formData.cvFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.cvFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : formData.cvFileUrl ? (
                      <div className="text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          CV đã tải lên
                        </p>
                        <a
                          href={formData.cvFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Xem CV
                        </a>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-sm">Chưa có CV</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      id="cv-file"
                      accept=".pdf,.doc,.docx"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          handleFileSelect(file, "cv");
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => handleOpenUploadModal("cv")}
                      disabled={isUploading}
                      className={`inline-flex items-center px-6 py-3 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium cursor-pointer ${
                        isUploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      style={{ backgroundColor: "#94cce6" }}
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Tải CV lên
                    </button>
                  </div>

                  {/* Requirements */}
                  <div
                    className="w-full p-4 rounded-lg"
                    style={{ backgroundColor: "oklch(0.97 0.01 0)" }}
                  >
                    <h4 className="font-medium text-gray-900 mb-3">
                      Yêu cầu file CV
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Định dạng PDF, DOC, DOCX
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Kích thước tối đa 10MB
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Nội dung rõ ràng, dễ đọc
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Cập nhật thông tin mới nhất
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            {isUploading && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-sm text-gray-600">
                  Đang tải lên {uploadType === "avatar" ? "ảnh đại diện" : "CV"}
                  ...
                </p>
              </div>
            )}

            {/* Error Messages */}
            {!isUploading && (errors.profileImage || errors.cvFile) && (
              <div className="text-center space-y-2">
                {errors.profileImage && (
                  <p className="text-red-500 text-sm">{errors.profileImage}</p>
                )}
                {errors.cvFile && (
                  <p className="text-red-500 text-sm">{errors.cvFile}</p>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Upload Instructions - Di chuyển lên trên checkbox */}
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: "#f0f8ff",
                border: "1px solid #94cce6",
              }}
            >
              <h4
                className="font-semibold mb-2 flex items-center"
                style={{ color: "#94cce6" }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Nhận "Tích xanh" cho Chứng chỉ của bạn (có thể thêm sau)
              </h4>
              <p className="text-sm text-blue-700">
                Đăng tải bản chụp/scan Chứng chỉ của bạn để tăng độ tin cậy. JPG
                or PNG format; kích cỡ lớn nhất 4MB.
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="no-certificates"
                checked={formData.noCertificates}
                onChange={(e) => handleNoCertificatesChange(e.target.checked)}
                className="h-4 w-4 focus:ring-[#94cce6] border-gray-300 rounded"
              />
              <label
                htmlFor="no-certificates"
                className="ml-2 block text-sm text-gray-900"
              >
                Tôi không có chứng chỉ
              </label>
            </div>

            {!formData.noCertificates && (
              <div className="space-y-6">
                {/* Hiển thị lỗi validation */}
                {errors.certificates && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.certificates}
                    </p>
                  </div>
                )}

                {/* Certificates List */}
                <div className="space-y-4">
                  {formData.certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="rounded-xl p-6 hover:bg-gray-50 transition-colors duration-200"
                      style={{ backgroundColor: "oklch(0.97 0.01 0)" }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-semibold text-gray-800">
                          Chứng chỉ #{index + 1}
                        </h5>
                        {/* Chỉ hiển thị nút xóa khi có nhiều hơn 1 chứng chỉ hoặc đã có thông tin */}
                        {(formData.certificates.length > 1 ||
                          cert.name.trim() !== "" ||
                          cert.issuedBy.trim() !== "") && (
                          <button
                            type="button"
                            onClick={() => {
                              const newCerts = formData.certificates.filter(
                                (_, i) => i !== index
                              );
                              handleInputChange("certificates", newCerts);
                            }}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tên chứng chỉ *
                          </label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => {
                              const newCerts = [...formData.certificates];
                              newCerts[index].name = e.target.value;
                              handleInputChange("certificates", newCerts);
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                            placeholder="Ví dụ: IELTS, TOEIC, Chứng chỉ sư phạm..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mô tả
                          </label>
                          <input
                            type="text"
                            value={cert.description}
                            onChange={(e) => {
                              const newCerts = [...formData.certificates];
                              newCerts[index].description = e.target.value;
                              handleInputChange("certificates", newCerts);
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                            placeholder="Mô tả ngắn gọn về chứng chỉ"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Được cấp bởi *
                          </label>
                          <input
                            type="text"
                            value={cert.issuedBy}
                            onChange={(e) => {
                              const newCerts = [...formData.certificates];
                              newCerts[index].issuedBy = e.target.value;
                              handleInputChange("certificates", newCerts);
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                            placeholder="Tổ chức cấp chứng chỉ"
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tải lên chứng chỉ
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0] || null;
                            console.log("Certificate file selected:", file);
                            if (file) {
                              console.log("File details:", {
                                name: file.name,
                                type: file.type,
                                size: file.size,
                              });

                              // Upload to backend
                              try {
                                const uploadFormData = new FormData();
                                uploadFormData.append("file", file);

                                console.log(
                                  "Uploading certificate to backend..."
                                );
                                const response = await fetch(
                                  "http://localhost:8080/api/files/upload/certificate",
                                  {
                                    method: "POST",
                                    body: uploadFormData,
                                  }
                                );

                                console.log(
                                  "Certificate upload response:",
                                  response.status,
                                  response.statusText
                                );

                                if (response.ok) {
                                  const data = await response.json();
                                  console.log(
                                    "Certificate upload success:",
                                    data
                                  );
                                  console.log("🔍 Certificate URL:", data.url);
                                  const newCerts = [...formData.certificates];
                                  newCerts[index].file = file;
                                  newCerts[index].url = data.url; // Store the uploaded URL
                                  newCerts[index].imageUrl = data.url; // Also store in imageUrl
                                  handleInputChange("certificates", newCerts);
                                } else {
                                  const errorData = await response.text();
                                  console.error(
                                    "Certificate upload failed:",
                                    response.status,
                                    errorData
                                  );
                                  console.error(
                                    "🔍 Certificate upload error details:",
                                    errorData
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "Certificate upload error:",
                                  error
                                );
                              }
                            } else {
                              console.log("No file selected for certificate");
                            }
                          }}
                          className="hidden"
                          id={`cert-file-${index}`}
                        />
                        <label
                          htmlFor={`cert-file-${index}`}
                          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-colors duration-200"
                          style={
                            {
                              "--hover-border": "#94cce6",
                              "--hover-bg": "#f0f8ff",
                            } as React.CSSProperties
                          }
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#94cce6";
                            e.currentTarget.style.backgroundColor = "#f0f8ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#d1d5db";
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <svg
                            className="w-5 h-5 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <span className="text-sm font-medium text-gray-600">
                            {cert.file
                              ? cert.file.name
                              : cert.imageUrl
                              ? "File đã tải lên từ trước"
                              : "Chọn file hoặc kéo thả vào đây"}
                          </span>
                        </label>
                        {(cert.file || cert.imageUrl) && (
                          <div className="mt-2">
                            <p className="text-xs text-green-600 flex items-center mb-1">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {cert.file
                                ? cert.file.name
                                : "Chứng chỉ đã tải lên"}
                            </p>
                            {cert.imageUrl && (
                              <a
                                href={cert.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Xem chứng chỉ
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newCerts = [
                      ...formData.certificates,
                      {
                        name: "",
                        description: "",
                        issuedBy: "",
                        file: null,
                      },
                    ];
                    handleInputChange("certificates", newCerts);
                  }}
                  className="flex items-center justify-center w-full px-6 py-3 border-2 border-dashed rounded-xl transition-colors duration-200 font-medium"
                  style={{
                    borderColor: "#94cce6",
                    color: "#94cce6",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#94cce6";
                    e.currentTarget.style.backgroundColor = "#f0f8ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#94cce6";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Thêm chứng chỉ khác
                </button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Upload Instructions - Only show once */}
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: "#f0f8ff",
                border: "1px solid #94cce6",
              }}
            >
              <h4
                className="font-semibold mb-2 flex items-center"
                style={{ color: "#94cce6" }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Nhận "Tích xanh" cho Bằng cấp của bạn (có thể thêm sau)
              </h4>
              <p className="text-sm text-blue-700">
                Đăng tải bản chụp/scan Bằng Đại học/Cao đẳng của bạn để tăng độ
                tin cậy. JPG or PNG format; kích cỡ lớn nhất 4MB.
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="no-degree"
                checked={formData.noDegree}
                onChange={(e) => handleNoDegreeChange(e.target.checked)}
                className="h-4 w-4 focus:ring-[#94cce6] border-gray-300 rounded"
              />
              <label
                htmlFor="no-degree"
                className="ml-2 block text-sm text-gray-900"
              >
                Tôi không có Bằng Đại học/Cao đẳng
              </label>
            </div>

            {!formData.noDegree && (
              <div className="space-y-6">
                {errors.degrees && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.degrees}
                    </p>
                  </div>
                )}

                {/* Không hiển thị thông báo "chưa có bằng cấp" vì đã có 1 bằng cấp mặc định */}

                {formData.degrees.map((degree, index) => (
                  <div
                    key={degree.id}
                    className="rounded-xl p-6 relative"
                    style={{ backgroundColor: "oklch(0.97 0.01 0)" }}
                  >
                    {/* Chỉ hiển thị nút xóa khi có nhiều hơn 1 bằng cấp hoặc đã có thông tin */}
                    {(formData.degrees.length > 1 ||
                      degree.university.trim() !== "" ||
                      degree.education.trim() !== "" ||
                      degree.major.trim() !== "") && (
                      <button
                        type="button"
                        onClick={() => removeDegree(degree.id)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}

                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Bằng cấp {index + 1}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Trường *
                        </label>
                        <input
                          type="text"
                          value={degree.university}
                          onChange={(e) =>
                            updateDegree(
                              degree.id,
                              "university",
                              e.target.value
                            )
                          }
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 ${
                            errors[`degree_${index}_university`]
                              ? "border-red-400 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Nhập tên trường đại học/cao đẳng"
                        />
                        {errors[`degree_${index}_university`] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors[`degree_${index}_university`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bằng cấp *
                        </label>
                        <select
                          value={degree.education}
                          onChange={(e) =>
                            updateDegree(degree.id, "education", e.target.value)
                          }
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 ${
                            errors[`degree_${index}_education`]
                              ? "border-red-400 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Chọn bằng cấp</option>
                          <option value="Cử nhân">Cử nhân</option>
                          <option value="Thạc sĩ">Thạc sĩ</option>
                          <option value="Tiến sĩ">Tiến sĩ</option>
                          <option value="Cao đẳng">Cao đẳng</option>
                          <option value="Trung cấp">Trung cấp</option>
                        </select>
                        {errors[`degree_${index}_education`] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors[`degree_${index}_education`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Chuyên ngành *
                        </label>
                        <input
                          type="text"
                          value={degree.major}
                          onChange={(e) =>
                            updateDegree(degree.id, "major", e.target.value)
                          }
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 ${
                            errors[`degree_${index}_major`]
                              ? "border-red-400 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Nhập chuyên ngành học"
                        />
                        {errors[`degree_${index}_major`] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors[`degree_${index}_major`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Thời gian học
                        </label>
                        <div className="flex space-x-3">
                          <select
                            value={degree.startYear}
                            onChange={(e) =>
                              updateDegree(
                                degree.id,
                                "startYear",
                                e.target.value
                              )
                            }
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                          >
                            <option value="">Bắt đầu</option>
                            {Array.from(
                              { length: new Date().getFullYear() - 1900 },
                              (_, i) => new Date().getFullYear() - 1 - i
                            ).map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <span className="flex items-center text-gray-500 text-lg font-medium">
                            -
                          </span>
                          <select
                            value={degree.endYear}
                            onChange={(e) =>
                              updateDegree(degree.id, "endYear", e.target.value)
                            }
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                          >
                            <option value="">Kết thúc</option>
                            <option value="hiện tại">
                              Hiện tại (đang học)
                            </option>
                            {Array.from(
                              { length: new Date().getFullYear() - 1899 },
                              (_, i) => new Date().getFullYear() - i
                            ).map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors[`degree_${index}_year`] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors[`degree_${index}_year`]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tải lên bằng cấp
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        id={`degree-file-${degree.id}`}
                        onChange={async (e) => {
                          const file = e.target.files?.[0] || null;
                          console.log("Degree file selected:", file);
                          if (file) {
                            console.log("File details:", {
                              name: file.name,
                              type: file.type,
                              size: file.size,
                            });

                            // Upload to backend
                            try {
                              const uploadFormData = new FormData();
                              uploadFormData.append("file", file);

                              console.log("Uploading degree to backend...");
                              const response = await fetch(
                                "http://localhost:8080/api/files/upload/degree",
                                {
                                  method: "POST",
                                  body: uploadFormData,
                                }
                              );

                              console.log(
                                "Degree upload response:",
                                response.status,
                                response.statusText
                              );

                              if (response.ok) {
                                const data = await response.json();
                                console.log("Degree upload success:", data);
                                console.log("🔍 Degree URL:", data.url);
                                updateDegree(degree.id, "file", file);
                                updateDegree(degree.id, "url", data.url); // Store the uploaded URL
                                updateDegree(degree.id, "imageUrl", data.url); // Also store in imageUrl
                              } else {
                                const errorData = await response.text();
                                console.error(
                                  "Degree upload failed:",
                                  response.status,
                                  errorData
                                );
                                console.error(
                                  "🔍 Degree upload error details:",
                                  errorData
                                );
                              }
                            } catch (error) {
                              console.error("Degree upload error:", error);
                            }
                          } else {
                            console.log("No file selected for degree");
                          }
                        }}
                      />
                      <label
                        htmlFor={`degree-file-${degree.id}`}
                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">
                          {degree.file
                            ? degree.file.name
                            : degree.imageUrl
                            ? "File đã tải lên từ trước"
                            : "Chọn file hoặc kéo thả vào đây"}
                        </span>
                      </label>
                      {(degree.file || degree.imageUrl) && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600 flex items-center mb-1">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {degree.file
                              ? degree.file.name
                              : "Bằng cấp đã tải lên"}
                          </p>
                          {degree.imageUrl && (
                            <a
                              href={degree.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Xem bằng cấp
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDegree}
                  className="flex items-center justify-center w-full px-6 py-3 border-2 border-dashed rounded-xl transition-colors duration-200 font-medium"
                  style={{
                    borderColor: "#94cce6",
                    color: "#94cce6",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#94cce6";
                    e.currentTarget.style.backgroundColor = "#f0f8ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#94cce6";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Thêm bằng cấp khác
                </button>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              {/* <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Giới thiệu bản thân
              </h3>
              <p className="text-gray-600 mb-4">
                Hãy viết vài dòng giới thiệu bạn với tất cả mọi người. Thông tin
                này sẽ hiện trên trang cá nhân của bạn và có thể được chỉnh sửa
                sau khi đăng ký thành công.
              </p> */}
              <p className="text-red-600 text-sm">
                Lưu ý: Tuyệt đối không ghi thông tin liên hệ như số điện
                thoại/email, mạng xã hội, ...
              </p>
            </div>

            <div className="space-y-6">
              {/* 1. Dòng tiêu đề */}
              <div className="rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">1. Dòng tiêu đề</h4>
                  <span className="text-green-500">✓</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Viết một dòng tiêu đề lôi cuốn, bắt mắt để gây ấn tượng với
                  học viên.
                </p>
                <textarea
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Gia sư tiếng Hàn chuyên ngành Công nghệ Thông tin, đồng hành học tập cùng bạn từ con số 0"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* 2. Giới thiệu về bạn */}
              <div className="rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    2. Giới thiệu về bạn
                  </h4>
                  <span className="text-green-500">✓</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Thêm một vài dòng giới thiệu về kinh nghiệm giảng dạy/làm
                  việc, học vấn liên quan. Có thể thêm các Chứng chỉ, bằng cấp,
                  thành tích của bạn.
                </p>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Mình là Nguyễn Đại Phát, hiện là sinh viên ngành Công nghệ Thông tin tại Đại học Phenikaa..."
                  value={formData.introduction}
                  onChange={(e) =>
                    handleInputChange("introduction", e.target.value)
                  }
                />
                {errors.introduction && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.introduction}
                  </p>
                )}
              </div>

              {/* 3. Kinh nghiệm giảng dạy */}
              <div className="rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    3. Kinh nghiệm giảng dạy
                  </h4>
                  <span className="text-green-500">✓</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Chi tiết hơn về kinh nghiệm giảng dạy của bạn. Có thể thêm vào
                  phương thức giảng dạy, chứng chỉ liên quan.
                </p>
                <textarea
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange("experience", e.target.value)
                  }
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.experience ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Với hơn 1 năm kinh nghiệm gia sư tiếng Hàn, mình đã giúp đỡ nhiều bạn..."
                />
                {errors.experience && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.experience}
                  </p>
                )}
              </div>

              {/* 4. Đối tượng nhận dạy */}
              <div className="rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    4. Đối tượng nhận dạy
                  </h4>
                  <span className="text-green-500">✓</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Chọn đối tượng học viên mà bạn có thể nhận dạy
                </p>

                {/* Dropdown cho đối tượng nhận dạy */}
                <div className="relative mb-4">
                  <select
                    value=""
                    onChange={(e) => {
                      const selectedLevel = e.target.value;
                      if (
                        selectedLevel &&
                        !formData.teachingMethods.includes(selectedLevel)
                      ) {
                        handleInputChange("teachingMethods", [
                          ...formData.teachingMethods,
                          selectedLevel,
                        ]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#94cce6] focus:ring-1 focus:ring-[#94cce6]"
                  >
                    <option value="">Chọn đối tượng nhận dạy</option>
                    {teachingLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags hiển thị đối tượng đã chọn */}
                {formData.teachingMethods.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.teachingMethods.map((level, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: "#94cce6" }}
                      >
                        {level}
                        <button
                          type="button"
                          onClick={() => {
                            const newLevels = formData.teachingMethods.filter(
                              (_, i) => i !== index
                            );
                            handleInputChange("teachingMethods", newLevels);
                          }}
                          className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {errors.teachingMethods && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.teachingMethods}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              {/* <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Video giới thiệu bản thân
              </h3> */}
              <p className="text-gray-600 mb-2">
                Giới thiệu bản thân bằng video khoảng 1 - 2 phút
              </p>
              <p className="text-gray-600">
                Video này sẽ được hiển thị trên trang cá nhân của bạn. Thông tin
                này có thể được chỉnh sửa sau khi đăng ký thành công.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Video Upload */}
              <div className="space-y-6">
                {/* Video Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Xem trước video
                  </h4>
                  <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                    {(() => {
                      const videoId = formData.videoUrl
                        ? extractYouTubeVideoId(formData.videoUrl)
                        : null;
                      const embedUrl = videoId
                        ? getYouTubeEmbedUrl(videoId)
                        : null;

                      return embedUrl ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={embedUrl}
                          title="Video giới thiệu"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl mb-2">▶️</div>
                          <p className="text-sm text-gray-600">
                            {formData.videoUrl
                              ? "URL không hợp lệ"
                              : "Chưa có video"}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Video Link Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập đường dẫn video YouTube của bạn
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      handleInputChange("videoUrl", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="https://youtu.be/KEhNoguTOJ4?si=qsu3PdSBF9Y7mH1w"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Hỗ trợ các định dạng: youtube.com/watch?v=, youtu.be/,
                    youtube.com/embed/
                  </p>
                </div>
              </div>

              {/* Right Column - Video Requirements */}
              <div className="space-y-6">
                <h4 className="font-medium text-gray-900">Yêu cầu video</h4>
                <p className="text-sm text-gray-600">
                  Hãy đảm bảo video đăng tải tuân theo những quy định sau
                </p>

                {/* Should Do */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Nên
                  </h5>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Video dài khoảng 30s - 2'</li>
                    <li>• Video được quay theo chiều ngang</li>
                    <li>• Đảm bảo video được quay đủ sáng và nền trung tính</li>
                    <li>• Không rung lắc</li>
                    <li>• Không khí vui vẻ, thân thiện</li>
                    <li>• Là người duy nhất xuất hiện trong video</li>
                  </ul>
                </div>

                {/* Should Not Do */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="text-red-500 mr-2">✗</span>
                    Không nên
                  </h5>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Không chèn thông tin liên hệ</li>
                    <li>• Không chèn logo hoặc link</li>
                    <li>• Không dùng trình chiếu hoặc slide</li>
                    <li>• Không rung lắc</li>
                  </ul>
                </div>

                {/* Help Link */}
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: "#f0f8ff",
                    border: "1px solid #94cce6",
                  }}
                >
                  <h5 className="font-medium mb-2" style={{ color: "#94cce6" }}>
                    Cần trợ giúp?
                  </h5>
                  <p className="text-sm text-blue-700 mb-2">
                    Chưa biết cách tải video lên YouTube?
                  </p>
                  <a
                    href="https://support.google.com/youtube/answer/57407"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#94cce6] text-sm hover:text-blue-700 underline"
                  >
                    Hướng dẫn tải video lên YouTube →
                  </a>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Thời gian giảng dạy trong tuần
              </h3>
              <p className="text-gray-600">
                Hãy để lịch trống cố định của bạn hàng tuần, bạn có thể thay đổi
                thông tin này bất cứ khi nào.
              </p>
            </div>

            <div className="space-y-6">
              {availableDays.map((day, index) => (
                <div
                  key={day}
                  className="border-2 rounded-xl transition-all duration-200"
                  style={{
                    borderColor: formData.availableDays.includes(day)
                      ? "#94cce6"
                      : "#e5e7eb",
                    backgroundColor: formData.availableDays.includes(day)
                      ? "#f0f8ff"
                      : "white",
                  }}
                >
                  <div className="flex items-center space-x-4 p-6">
                    <input
                      type="checkbox"
                      id={`day-${index}`}
                      checked={formData.availableDays.includes(day)}
                      onChange={(e) => handleDayToggle(day, e.target.checked)}
                      className="h-5 w-5 focus:ring-[#94cce6] border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`day-${index}`}
                      className="flex-1 text-lg font-semibold text-gray-900 cursor-pointer"
                    >
                      {day}
                    </label>
                    {formData.availableDays.includes(day) && (
                      <div className="flex items-center text-green-600">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium">Đã chọn</span>
                      </div>
                    )}
                  </div>

                  {formData.availableDays.includes(day) && (
                    <div className="px-6 pb-6 space-y-3">
                      {(formData.dayTimeSlots[day] || []).map(
                        (slot, slotIndex) => (
                          <div
                            key={slotIndex}
                            className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                          >
                            <select
                              value={slot.start}
                              onChange={(e) =>
                                updateTimeSlot(
                                  day,
                                  slotIndex,
                                  "start",
                                  e.target.value
                                )
                              }
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 font-medium"
                            >
                              {generateTimeSlots().map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                            <span className="text-gray-400 font-medium">-</span>
                            <select
                              value={slot.end}
                              onChange={(e) =>
                                updateTimeSlot(
                                  day,
                                  slotIndex,
                                  "end",
                                  e.target.value
                                )
                              }
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 font-medium"
                            >
                              {generateTimeSlots().map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(day, slotIndex)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Xóa khung giờ"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                                  clipRule="evenodd"
                                />
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() => addTimeSlot(day)}
                        className="w-full py-3 px-4 text-sm font-medium rounded-lg border transition-colors duration-200 flex items-center justify-center space-x-2"
                        style={{
                          color: "#94cce6",
                          borderColor: "#94cce6",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#94cce6";
                          e.currentTarget.style.backgroundColor = "#f0f8ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#94cce6";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span>Thêm khung giờ khác trong ngày</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {errors.availableDays && (
              <p className="text-red-500 text-sm">{errors.availableDays}</p>
            )}
            {errors.availableTimes && (
              <p className="text-red-500 text-sm">{errors.availableTimes}</p>
            )}
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
        // style={{ backgroundColor: "rgb(148, 204, 230)" }}
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
                  "Bắt đầu đăng ký hồ sơ ngay. Thông tin của bạn sẽ được lưu và có thể chỉnh sửa lại bất cứ khi nào sau khi đăng ký."}
                {currentStep === 2 &&
                  "Tải lên ảnh đại diện chuyên nghiệp để tạo ấn tượng tốt với học viên."}
                {currentStep === 3 &&
                  "Chia sẻ các chứng chỉ và bằng cấp của bạn để tăng độ tin cậy."}
                {currentStep === 4 &&
                  "Cung cấp thông tin học vấn và chuyên môn của bạn."}
                {currentStep === 5 &&
                  "Giới thiệu bản thân và phương pháp giảng dạy độc đáo của bạn."}
                {currentStep === 6 &&
                  "Tạo video giới thiệu ngắn để học viên hiểu rõ hơn về bạn."}
                {currentStep === 7 &&
                  "Thiết lập lịch dạy phù hợp với thời gian rảnh của bạn."}
                {currentStep === 8 &&
                  "Đặt mức học phí phù hợp với kinh nghiệm và chuyên môn của bạn."}
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

                {/* Nhóm bên phải: Lưu nháp và Gửi đăng ký */}
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

                  {/* Nút Gửi đăng ký */}
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
                    {isSubmitting ? "Đang gửi..." : "Gửi đăng ký"}
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tải lên</h3>
              <button
                onClick={handleCancelUpload}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="text-center mb-6">
              {!previewFile ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Chọn hoặc kéo thả file
                  </p>

                  <div
                    className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 min-h-[200px] cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      const input = document.getElementById(
                        uploadType === "avatar" ? "profile-image" : "cv-file"
                      );
                      input?.click();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        const file = files[0];
                        if (
                          uploadType === "avatar" &&
                          file.type.startsWith("image/")
                        ) {
                          handleFileSelect(file, "avatar");
                        } else if (
                          uploadType === "cv" &&
                          (file.type === "application/pdf" ||
                            file.name.endsWith(".doc") ||
                            file.name.endsWith(".docx"))
                        ) {
                          handleFileSelect(file, "cv");
                        }
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 mb-4">
                        Chọn file hoặc kéo thả tại đây
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const input = document.getElementById(
                            uploadType === "avatar"
                              ? "profile-image"
                              : "cv-file"
                          );
                          input?.click();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse File
                      </button>
                    </div>
                  </div>
                </>
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
              {(errors.profileImage || errors.cvFile) && (
                <div className="mt-2 text-sm text-red-600">
                  {errors.profileImage || errors.cvFile}
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
                  className="px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  style={{ backgroundColor: "#94cce6" }}
                >
                  Áp dụng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
