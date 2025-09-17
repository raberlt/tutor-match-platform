import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const BecomeTutor: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
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

  const [formData, setFormData] = useState({
    // Step 1: Thông tin cơ bản
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: "",
    subjects: [] as string[],
    email: user?.email || "",
    province: "",
    confirmAge: false,
    acceptTerms: false,

    // Step 2: Ảnh đại diện
    profileImage: null as File | null,

    // Step 3: Chứng chỉ
    certificates: [
      {
        name: "",
        description: "",
        issuedBy: "",
        file: null,
      },
    ] as Array<{
      name: string;
      description: string;
      issuedBy: string;
      file: File | null;
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
      },
    ] as Array<{
      id: string;
      university: string;
      education: string;
      major: string;
      startYear: string;
      endYear: string;
      file: File | null;
    }>,
    noDegree: false,

    // Step 5: Giới thiệu
    title: "",
    introduction: "",
    experience: "",
    teachingMethods: "",

    // Step 6: Video
    introductionVideo: null as File | null,
    videoUrl: "",

    // Step 7: Thời gian dạy
    availableDays: [] as string[],
    availableTimes: [] as string[],
    dayTimeSlots: {} as Record<string, Array<{ start: string; end: string }>>,

    // Step 8: Học phí
    hourlyRate: "",
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

  // Load dữ liệu mặc định
  useEffect(() => {
    // Danh sách môn học mặc định
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

    setSubjects(defaultSubjects);
    setProvinces(vietnamProvinces);
    setFilteredProvinces(vietnamProvinces);
  }, []);

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
            return { ...slot, start: value, end: calculateEndTime(value) };
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
      setFilteredProvinces(filtered);
      setShowProvinceDropdown(true);
    }
  };

  const selectProvince = (province: { id: number; name: string }) => {
    setFormData((prev) => ({
      ...prev,
      province: province.name,
    }));
    setShowProvinceDropdown(false);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.firstName) newErrors.firstName = "Vui lòng nhập tên";
        if (!formData.lastName) newErrors.lastName = "Vui lòng nhập họ";
        if (!formData.phone) newErrors.phone = "Vui lòng nhập số điện thoại";
        if (formData.phone && formData.phone.length < 10)
          newErrors.phone = "Số điện thoại phải có ít nhất 10 chữ số";
        if (formData.subjects.length === 0)
          newErrors.subjects = "Vui lòng chọn ít nhất 1 môn học";
        if (!formData.email) newErrors.email = "Vui lòng nhập email";
        if (!formData.province)
          newErrors.province = "Vui lòng chọn tỉnh/thành phố";
        if (!formData.confirmAge)
          newErrors.confirmAge = "Vui lòng xác nhận đủ 18 tuổi";
        if (!formData.acceptTerms)
          newErrors.acceptTerms = "Vui lòng đồng ý điều khoản sử dụng";
        break;

      case 2:
        if (!formData.profileImage)
          newErrors.profileImage = "Vui lòng tải lên ảnh đại diện";
        break;

      case 3: {
        // Nếu không có chứng chỉ thì bỏ qua validation
        if (formData.noCertificates) {
          break;
        }

        // Kiểm tra tất cả chứng chỉ phải có thông tin đầy đủ (trừ ảnh)
        const hasIncompleteCertificate = formData.certificates.some(
          (cert) =>
            (cert.name.trim() !== "" || cert.issuedBy.trim() !== "") && // Có ít nhất 1 trường được nhập
            (cert.name.trim() === "" || cert.issuedBy.trim() === "") // Nhưng chưa đầy đủ
        );

        if (hasIncompleteCertificate) {
          newErrors.certificates =
            "Vui lòng nhập đầy đủ thông tin chứng chỉ hoặc chọn 'Tôi không có chứng chỉ'";
        }
        break;
      }

      case 4: {
        // Nếu không có bằng cấp thì bỏ qua validation
        if (formData.noDegree) {
          break;
        }

        // Kiểm tra tất cả bằng cấp phải có thông tin đầy đủ (trừ ảnh)
        const hasIncompleteDegree = formData.degrees.some(
          (degree) =>
            (degree.university.trim() !== "" ||
              degree.education.trim() !== "" ||
              degree.major.trim() !== "") && // Có ít nhất 1 trường được nhập
            (degree.university.trim() === "" ||
              degree.education.trim() === "" ||
              degree.major.trim() === "") // Nhưng chưa đầy đủ
        );

        if (hasIncompleteDegree) {
          newErrors.degrees =
            "Vui lòng nhập đầy đủ thông tin học vấn hoặc chọn 'Tôi không có bằng cấp'";
        }

        // Kiểm tra năm học hợp lệ
        formData.degrees.forEach((degree, index) => {
          if (
            degree.startYear &&
            degree.endYear &&
            parseInt(degree.endYear) < parseInt(degree.startYear)
          ) {
            newErrors[`degree_${index}_year`] =
              "Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu";
          }
        });
        break;
      }

      case 5:
        if (!formData.title) newErrors.title = "Vui lòng nhập dòng tiêu đề";
        if (!formData.introduction)
          newErrors.introduction = "Vui lòng nhập giới thiệu bản thân";
        if (!formData.experience)
          newErrors.experience = "Vui lòng nhập kinh nghiệm";
        if (!formData.teachingMethods)
          newErrors.teachingMethods = "Vui lòng nhập trình độ nhận dạy";
        break;

      case 6:
        // Video không bắt buộc
        break;

      case 7: {
        if (formData.availableDays.length === 0)
          newErrors.availableDays = "Vui lòng chọn ít nhất 1 ngày";

        // Kiểm tra xem có ít nhất 1 ngày có khung giờ không
        const hasTimeSlots = formData.availableDays.some(
          (day) =>
            formData.dayTimeSlots[day] && formData.dayTimeSlots[day].length > 0
        );
        if (!hasTimeSlots)
          newErrors.availableTimes = "Vui lòng chọn ít nhất 1 khung giờ";
        break;
      }

      case 8:
        if (!formData.hourlyRate)
          newErrors.hourlyRate = "Vui lòng nhập mức phí";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      console.log("Submitting application:", formData);
      // Handle form submission
      alert(
        "Đơn đăng ký đã được gửi thành công! Chúng tôi sẽ xem xét và phản hồi trong 2-3 ngày."
      );
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tên *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 ${
                    errors.firstName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Nhập tên của bạn"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
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
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Họ *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 ${
                    errors.lastName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Nhập họ của bạn"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
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
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    // Chỉ cho phép nhập số
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleInputChange("phone", value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 ${
                    errors.phone
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Nhập số điện thoại của bạn (chỉ số)"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
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
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Môn học giảng dạy *
                </label>
                <div className="space-y-3">
                  {/* Dropdown chọn môn học */}
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !formData.subjects.includes(e.target.value)
                        ) {
                          handleInputChange("subjects", [
                            ...formData.subjects,
                            e.target.value,
                          ]);
                        }
                        e.target.value = ""; // Reset selection
                      }}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 border-gray-300 hover:border-gray-400"
                    >
                      <option value="">Chọn môn học từ danh sách</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.name}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hiển thị các môn học đã chọn dạng tags */}
                  {formData.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.subjects.map((subject, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          <span>{subject}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newSubjects = formData.subjects.filter(
                                (_, i) => i !== index
                              );
                              handleInputChange("subjects", newSubjects);
                            }}
                            className="text-blue-600 hover:text-blue-800 ml-1"
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
                      ))}
                    </div>
                  )}
                </div>
                {errors.subjects && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
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
                    {errors.subjects}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-3 border-2 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300"
                  placeholder="Email từ tài khoản đăng nhập"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email được lấy từ tài khoản đăng nhập, không thể chỉnh sửa
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tỉnh/Thành phố *
                </label>
                <div className="relative province-dropdown">
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    onFocus={() => setShowProvinceDropdown(true)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 ${
                      errors.province
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Nhập hoặc chọn tỉnh/thành phố"
                  />

                  {/* Dropdown tỉnh/TP */}
                  {showProvinceDropdown && filteredProvinces.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredProvinces.map((province) => (
                        <div
                          key={province.id}
                          onClick={() => selectProvince(province)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-gray-900">{province.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.province && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
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
                    {errors.province}
                  </p>
                )}
              </div>
            </div>

            {/* Checkbox xác nhận 18 tuổi */}
            <div className="mt-8">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="age-confirm"
                  checked={formData.confirmAge}
                  onChange={(e) =>
                    handleInputChange("confirmAge", e.target.checked)
                  }
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 ${
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
                <p className="text-red-500 text-sm mt-1">{errors.confirmAge}</p>
              )}
            </div>

            {/* Checkbox đồng ý điều khoản sử dụng */}
            <div className="mt-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms-confirm"
                  checked={formData.acceptTerms}
                  onChange={(e) =>
                    handleInputChange("acceptTerms", e.target.checked)
                  }
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 ${
                    errors.acceptTerms ? "border-red-500" : ""
                  }`}
                />
                <label
                  htmlFor="terms-confirm"
                  className="ml-3 block text-sm text-gray-700"
                >
                  Tôi đồng ý với{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    chính sách bảo mật
                  </a>{" "}
                  của TutorMatch
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.acceptTerms}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            

            <div className="flex flex-col items-center space-y-6">
              {/* Avatar Display */}
              <div className="w-40 h-40 border border-gray-300 rounded-lg flex items-center justify-center bg-white">
                {formData.profileImage ? (
                  <img
                    src={URL.createObjectURL(formData.profileImage)}
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
                  onChange={(e) =>
                    handleFileChange(
                      "profileImage",
                      e.target.files?.[0] || null
                    )
                  }
                  className="hidden"
                />
                <label
                  htmlFor="profile-image"
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Tải ảnh lên
                </label>
              </div>

              {/* Requirements */}
              <div className="max-w-md">
                <h4 className="font-medium text-gray-900 mb-3">
                  Bức ảnh tải lên cần phải
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Hiện rõ khuôn mặt và mắt
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Là người duy nhất trong bức ảnh
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Dùng ảnh có màu và không dùng filter
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Không có logo hoặc thông tin liên hệ
                  </li>
                </ul>
              </div>
            </div>

            {errors.profileImage && (
              <p className="text-red-500 text-sm text-center">
                {errors.profileImage}
              </p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Upload Instructions - Di chuyển lên trên checkbox */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                      className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors duration-200"
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
                          onChange={(e) => {
                            const newCerts = [...formData.certificates];
                            newCerts[index].file = e.target.files?.[0] || null;
                            handleInputChange("certificates", newCerts);
                          }}
                          className="hidden"
                          id={`cert-file-${index}`}
                        />
                        <label
                          htmlFor={`cert-file-${index}`}
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
                            {cert.file
                              ? cert.file.name
                              : "Chọn file hoặc kéo thả vào đây"}
                          </span>
                        </label>
                        {cert.file && (
                          <p className="text-xs text-green-600 mt-2 flex items-center">
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
                            File đã được chọn
                          </p>
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
                  className="flex items-center justify-center w-full px-6 py-3 border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-colors duration-200 font-medium"
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
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 relative"
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
                        onChange={(e) =>
                          updateDegree(
                            degree.id,
                            "file",
                            e.target.files?.[0] || null
                          )
                        }
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
                            : "Chọn file hoặc kéo thả vào đây"}
                        </span>
                      </label>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDegree}
                  className="flex items-center justify-center w-full px-6 py-3 border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-colors duration-200 font-medium"
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
              <div className="border border-gray-200 rounded-lg p-4">
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
              <div className="border border-gray-200 rounded-lg p-4">
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
              <div className="border border-gray-200 rounded-lg p-4">
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

              {/* 4. Trình độ nhận dạy */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    4. Trình độ nhận dạy
                  </h4>
                  <span className="text-green-500">✓</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Những trình độ bạn có thể nhận giảng dạy ở từng môn học. Ví
                  dụ:
                </p>
                <textarea
                  value={formData.teachingMethods}
                  onChange={(e) =>
                    handleInputChange("teachingMethods", e.target.value)
                  }
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.teachingMethods
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Học sinh THPT môn Toán, Sinh viên đại học môn Vật lý, Người đi làm môn Tiếng Anh..."
                />
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">
                    Cần trợ giúp?
                  </h5>
                  <p className="text-sm text-blue-700 mb-2">
                    Chưa biết cách tải video lên YouTube?
                  </p>
                  <a
                    href="https://support.google.com/youtube/answer/57407"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:text-blue-700 underline"
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
                  className={`border-2 rounded-xl transition-all duration-200 ${
                    formData.availableDays.includes(day)
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-4 p-6">
                    <input
                      type="checkbox"
                      id={`day-${index}`}
                      checked={formData.availableDays.includes(day)}
                      onChange={(e) => handleDayToggle(day, e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                        className="w-full py-3 px-4 text-blue-600 text-sm font-medium hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors duration-200 flex items-center justify-center space-x-2"
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

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Học phí 1 buổi học của bạn
              </h3>
              <p className="text-gray-600">
                Một buổi học kéo dài mặc định 90 phút. Hãy nhớ: Đừng cạnh tranh
                bằng học phí thấp mà hãy nâng cao chất lượng và kỹ năng giảng
                dạy của bản thân và đặt mức học phí bạn xứng đáng.
              </p>
            </div>

            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức phí cho 1 buổi học (90 phút)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    handleInputChange("hourlyRate", e.target.value)
                  }
                  className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.hourlyRate ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="100000"
                  min="50000"
                />
                <span className="ml-2 text-gray-600">đ/buổi</span>
              </div>
              {errors.hourlyRate && (
                <p className="text-red-500 text-sm mt-1">{errors.hourlyRate}</p>
              )}
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
      "Ảnh đại diện",
      "Chứng chỉ",
      "Học vấn",
      "Giới thiệu",
      "Video",
      "Thời gian dạy",
      "Học phí",
    ];
    return titles[step - 1] || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section - Larger and more prominent */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
        <div className="container mx-auto px-4 py-12">
          {/* Progress Steps - Desktop */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between relative">
              {/* Progress Line Background */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-white/30 -z-10 rounded-full"></div>

              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                (step) => (
                  <div
                    key={step}
                    className="flex flex-col items-center relative z-10"
                  >
                    {/* Step Circle */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 shadow-xl ${
                        step < currentStep
                          ? "bg-green-500 text-white shadow-green-500/50"
                          : step === currentStep
                          ? "bg-white text-blue-600 shadow-white/50 ring-4 ring-white/30"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {step < currentStep ? (
                        <svg
                          className="w-8 h-8"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>

                    {/* Step Title */}
                    <span
                      className={`mt-4 text-sm font-semibold text-center max-w-24 ${
                        step <= currentStep ? "text-white" : "text-blue-200"
                      }`}
                    >
                      {getStepTitle(step)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Progress Steps - Mobile */}
          <div className="lg:hidden">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-white mb-2">
                Bước {currentStep} / {totalSteps}
              </div>
              <div className="text-lg font-medium text-blue-100">
                {getStepTitle(currentStep)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/30 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-white to-blue-100 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {getStepTitle(currentStep)}
              </h3>
              <p className="text-blue-100 text-sm">
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
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
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

                <div className="flex space-x-3">
                  {currentStep < totalSteps ? (
                    <button
                      onClick={nextStep}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    >
                      Lưu và tiếp tục
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
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
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
                      Hoàn thành đăng ký
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
