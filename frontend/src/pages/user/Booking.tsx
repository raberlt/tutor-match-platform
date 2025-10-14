import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "../../components/Calendar";
import type {
  TutorPreviewProfile,
  TutorProfile,
  TutorProfileSubject,
} from "../../types";

interface TutorSchedule {
  id: number;
  dayOfWeek: string;
  fromTime: string;
  toTime: string;
  enable: boolean;
}

interface PackageSchedule {
  dayOfWeek: string;
  timeSlot: string;
  date?: string;
  subjectId?: number;
  subjectName?: string;
  fee?: number;
}

const UnifiedBookingNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorSchedules, setTutorSchedules] = useState<TutorSchedule[]>([]);
  const [tutorSubjects, setTutorSubjects] = useState<TutorProfileSubject[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Get tutor info from navigation state
  const selectedTutor =
    (location.state?.selectedTutor as
      | TutorPreviewProfile
      | TutorProfile
      | null) || null;

  // Booking type selection
  const [bookingType, setBookingType] = useState<"single" | "package">(
    "single"
  );

  // Form data for single session (giữ nguyên như SingleBookingNew)
  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
    subjectId: "",
    note: "",
  });

  // Form data for package
  const [packageFormData, setPackageFormData] = useState({
    subjectId: "",
    totalSessions: 12,
    note: "",
    startDate: "",
    endDate: "",
    selectedDays: [] as string[],
    timeSlot: "",
    selectedSessions: [] as PackageSchedule[],
    selectedSubjects: [] as { id: number; name: string; fees: number }[],
    tempChoices: [] as any[],
  });

  // Temporary choices before adding to session list
  const [tempChoices, setTempChoices] = useState({
    selectedDay: "",
    selectedTimeSlot: "",
    selectedSubject: null as { id: number; name: string; fees: number } | null,
  });

  const [scheduleType, setScheduleType] = useState<"fixed" | "flexible">(
    "fixed"
  );
  const [showFixedInlineCalendar, setShowFixedInlineCalendar] = useState(false);
  const [selectedTempChoiceIdxs, setSelectedTempChoiceIdxs] = useState<
    number[]
  >([]);
  const [selectedSessionIdxs, setSelectedSessionIdxs] = useState<number[]>([]);

  const toggleSelectAllTempChoices = (checked: boolean) => {
    if (checked && packageFormData.tempChoices?.length) {
      setSelectedTempChoiceIdxs(
        packageFormData.tempChoices.map((_: any, i: number) => i)
      );
    } else {
      setSelectedTempChoiceIdxs([]);
    }
  };

  const deleteSelectedTempChoices = () => {
    if (!packageFormData.tempChoices?.length) return;
    const remainChoices = (packageFormData.tempChoices as any[]).filter(
      (_: any, i: number) => !selectedTempChoiceIdxs.includes(i)
    );

    // Regenerate sessions from remaining choices using snapshot start/end
    const sessions: PackageSchedule[] = [];
    remainChoices.forEach((choice: any) => {
      const startDate = new Date(choice.startDate);
      const endDate = new Date(choice.endDate);
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate
          .toLocaleDateString("en-US", { weekday: "long" })
          .toUpperCase();
        if (dayOfWeek === choice.day) {
          sessions.push({
            dayOfWeek: choice.day,
            timeSlot: choice.timeSlot,
            date: currentDate.toISOString().split("T")[0],
            subjectId: choice.subject.id,
            subjectName: choice.subject.name,
            fee: choice.subject.fees,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    setPackageFormData((prev) => ({
      ...prev,
      tempChoices: remainChoices,
      selectedSessions: sessions,
      totalSessions: sessions.length,
    }));
    setSelectedTempChoiceIdxs([]);
  };

  const toggleSelectAllSessions = (checked: boolean) => {
    if (checked && packageFormData.selectedSessions?.length) {
      setSelectedSessionIdxs(
        packageFormData.selectedSessions.map((_: any, i: number) => i)
      );
    } else {
      setSelectedSessionIdxs([]);
    }
  };

  const deleteSelectedSessions = () => {
    if (!packageFormData.selectedSessions?.length) return;
    const remain = packageFormData.selectedSessions.filter(
      (_: any, i: number) => !selectedSessionIdxs.includes(i)
    );
    setPackageFormData((prev) => ({
      ...prev,
      selectedSessions: remain,
      totalSessions: remain.length,
    }));
    setSelectedSessionIdxs([]);
  };

  // Modal hiển thị lịch dạy của gia sư
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form tạm cho lịch tự do
  const [flexibleForm, setFlexibleForm] = useState({ date: "", subjectId: "" });

  // Get tomorrow's date as minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    if (selectedTutor) {
      loadTutorData();
    }
  }, [selectedTutor]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTutorData = async () => {
    if (!selectedTutor) return;

    try {
      setLoading(true);

      // Load tutor detail để lấy subjects và schedules
      const response = await fetch(`/api/public/tutors/${selectedTutor.id}`);
      const tutorDetail = await response.json();

      console.log("Tutor detail:", tutorDetail);

      // Set subjects từ tutor detail
      if (
        tutorDetail.profileSubjects &&
        Array.isArray(tutorDetail.profileSubjects)
      ) {
        const subjects = tutorDetail.profileSubjects.map(
          (subject: { id: number; name: string; fees: number }) => ({
            id: subject.id,
            name: subject.name,
            fees: subject.fees,
          })
        );
        setTutorSubjects(subjects);
        console.log("Loaded subjects:", subjects);
      }

      // Set schedules từ tutor detail
      if (tutorDetail.schedules && Array.isArray(tutorDetail.schedules)) {
        setTutorSchedules(tutorDetail.schedules);
        console.log("Loaded schedules:", tutorDetail.schedules);
      }
    } catch (error) {
      console.error("Error loading tutor data:", error);
      setError("Không thể tải thông tin gia sư");
    } finally {
      setLoading(false);
    }
  };

  // Chuyển đổi dayOfWeek từ tiếng Anh sang tiếng Việt
  const getVietnameseDayOfWeek = (dayOfWeek: string) => {
    const dayMap: { [key: string]: string } = {
      MONDAY: "Thứ 2",
      TUESDAY: "Thứ 3",
      WEDNESDAY: "Thứ 4",
      THURSDAY: "Thứ 5",
      FRIDAY: "Thứ 6",
      SATURDAY: "Thứ 7",
      SUNDAY: "Chủ nhật",
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  // Lấy các ngày trong tuần mà gia sư có lịch (đã gộp theo ngày)
  const getAvailableDays = useCallback(() => {
    const dayGroups: { [key: string]: TutorSchedule[] } = {};

    tutorSchedules
      .filter((schedule) => schedule.enable)
      .forEach((schedule) => {
        if (!dayGroups[schedule.dayOfWeek]) {
          dayGroups[schedule.dayOfWeek] = [];
        }
        dayGroups[schedule.dayOfWeek].push(schedule);
      });

    return Object.keys(dayGroups).map((dayOfWeek) => ({
      dayOfWeek,
      vietnameseDay: getVietnameseDayOfWeek(dayOfWeek),
      schedules: dayGroups[dayOfWeek],
    }));
  }, [tutorSchedules]);

  // Lấy các khung giờ cho ngày đã chọn (single session)
  const getAvailableTimeSlotsForDay = useCallback(
    (selectedDate: string) => {
      if (!selectedDate) return [];

      const date = new Date(selectedDate + "T00:00:00.000Z");
      const dayOfWeek = date
        .toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: "UTC",
        })
        .toUpperCase();

      const daySchedules = tutorSchedules.filter(
        (schedule) => schedule.dayOfWeek === dayOfWeek && schedule.enable
      );

      return daySchedules.map((schedule) => {
        const fromTime = schedule.fromTime.substring(0, 5);
        const toTime = schedule.toTime.substring(0, 5);
        return `${fromTime}-${toTime}`;
      });
    },
    [tutorSchedules]
  );

  // Lấy các khung giờ cho package (tất cả)
  // const getAvailableTimeSlots = () => {
  //   return tutorSchedules
  //     .filter((schedule) => schedule.enable)
  //     .map((schedule) => `${schedule.fromTime}-${schedule.toTime}`);
  // };

  // Single session handlers (giữ nguyên như SingleBookingNew)
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user makes changes
    if (error) {
      setError(null);
    }
  };

  // Package handlers
  const handlePackageInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setPackageFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDaySelection = (day: string, checked: boolean) => {
    setTempChoices((prev) => ({
      ...prev,
      selectedDay: checked ? day : "",
      selectedTimeSlot: "", // Reset time slot when day changes
    }));
  };

  const handleScheduleTypeChange = (type: "fixed" | "flexible") => {
    setScheduleType(type);
    // Không xóa selectedSessions khi chuyển chế độ để giữ lại các buổi đã chọn
    // Chỉ nên dọn các input tạm của mỗi chế độ nếu cần (không đụng tới selectedSessions)
    if (type === "fixed") {
      setPackageFormData((prev) => ({
        ...prev,
        // giữ nguyên selectedSessions
        // có thể dọn trường tạm nếu muốn
      }));
    } else {
      setPackageFormData((prev) => ({
        ...prev,
        // giữ nguyên selectedSessions
        // có thể dọn trường tạm nếu muốn
      }));
    }
  };

  // Get available time slots for selected days
  const getAvailableTimeSlotsForSelectedDays = () => {
    if (!tempChoices.selectedDay) return [];

    const timeSlots = new Set<string>();
    const daySchedules = tutorSchedules.filter(
      (s) => s.dayOfWeek === tempChoices.selectedDay && s.enable
    );
    daySchedules.forEach((schedule) => {
      const from = schedule.fromTime.substring(0, 5);
      const to = schedule.toTime.substring(0, 5);
      timeSlots.add(`${from}-${to}`);
    });

    // Không còn loại bỏ khung giờ đã chọn - cho phép chọn tự do
    return Array.from(timeSlots);
  };

  const addTempChoice = () => {
    if (!tempChoices.selectedDay) {
      setError("Vui lòng chọn ngày trong tuần");
      return;
    }

    if (!tempChoices.selectedTimeSlot) {
      setError("Vui lòng chọn khung giờ");
      return;
    }

    if (!tempChoices.selectedSubject) {
      setError("Vui lòng chọn môn học");
      return;
    }

    if (!packageFormData.startDate || !packageFormData.endDate) {
      setError("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
      return;
    }

    // Tạo danh sách sessions mới từ lựa chọn hiện tại
    const newSessions: PackageSchedule[] = [];
    const startDate = new Date(packageFormData.startDate!);
    const endDate = new Date(packageFormData.endDate!);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase();

      if (dayOfWeek === tempChoices.selectedDay) {
        newSessions.push({
          dayOfWeek: tempChoices.selectedDay,
          timeSlot: tempChoices.selectedTimeSlot,
          date: currentDate.toISOString().split("T")[0],
          subjectId: tempChoices.selectedSubject.id,
          subjectName: tempChoices.selectedSubject.name,
          fee: tempChoices.selectedSubject.fees,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Gộp với danh sách cũ và loại bỏ trùng lặp (dựa trên ngày + khung giờ)
    const existingSessions = packageFormData.selectedSessions || [];
    const mergedSessions: PackageSchedule[] = [...existingSessions];
    const duplicateDates: string[] = [];

    newSessions.forEach((newSession) => {
      const existingIndex = mergedSessions.findIndex(
        (existing) =>
          existing.date === newSession.date &&
          existing.timeSlot === newSession.timeSlot
      );

      if (existingIndex >= 0) {
        // Trùng lặp - thay thế session cũ bằng session mới (cập nhật môn học)
        mergedSessions[existingIndex] = newSession;
        duplicateDates.push(
          new Date(newSession.date).toLocaleDateString("vi-VN")
        );
      } else {
        // Không trùng - thêm mới
        mergedSessions.push(newSession);
      }
    });

    // Hiển thị thông báo nếu có trùng lặp
    if (duplicateDates.length > 0) {
      setError(
        `Đã cập nhật môn học cho các ngày trùng lặp: ${duplicateDates.join(
          ", "
        )}`
      );
      setTimeout(() => setError(null), 3000); // Tự động ẩn thông báo sau 3 giây
    } else {
      setError(null);
    }

    // Cập nhật tempChoices để hiển thị trong danh sách
    const newChoice = {
      day: tempChoices.selectedDay,
      timeSlot: tempChoices.selectedTimeSlot,
      subject: tempChoices.selectedSubject,
      startDate: packageFormData.startDate,
      endDate: packageFormData.endDate,
    } as any;

    // Kiểm tra trùng lặp trong tempChoices (dựa trên ngày + khung giờ + khoảng thời gian)
    const existingTempChoices = packageFormData.tempChoices || [];
    const updatedTempChoices = [...existingTempChoices];

    const duplicateTempIndex = existingTempChoices.findIndex(
      (existing: any) =>
        existing.day === newChoice.day &&
        existing.timeSlot === newChoice.timeSlot &&
        existing.startDate === newChoice.startDate &&
        existing.endDate === newChoice.endDate
    );

    if (duplicateTempIndex >= 0) {
      // Thay thế lựa chọn cũ bằng lựa chọn mới
      updatedTempChoices[duplicateTempIndex] = newChoice;
    } else {
      // Thêm mới
      updatedTempChoices.push(newChoice);
    }

    setPackageFormData((prev) => ({
      ...prev,
      tempChoices: updatedTempChoices,
      selectedSessions: mergedSessions,
      totalSessions: mergedSessions.length,
    }));

    // Reset temp choices
    setTempChoices({
      selectedDay: "",
      selectedTimeSlot: "",
      selectedSubject: null,
    });
  };

  // const generateSessionsFromChoices = () => {
  //   if (!packageFormData.startDate || !packageFormData.endDate) {
  //     setError("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
  //     return;
  //   }

  //   const tempChoicesList = packageFormData.tempChoices || [];
  //   if (tempChoicesList.length === 0) {
  //     setError("Vui lòng thêm ít nhất một lựa chọn thứ/giờ/môn");
  //     return;
  //   }

  //   // Calculate sessions based on temp choices and date range
  //   const startDate = new Date(packageFormData.startDate);
  //   const endDate = new Date(packageFormData.endDate);
  //   const sessions: PackageSchedule[] = [];

  //   tempChoicesList.forEach((choice: any) => {
  //     const currentDate = new Date(startDate);

  //     while (currentDate <= endDate) {
  //       const dayOfWeek = currentDate
  //         .toLocaleDateString("en-US", { weekday: "long" })
  //         .toUpperCase();

  //       if (dayOfWeek === choice.day) {
  //         sessions.push({
  //           dayOfWeek: choice.day,
  //           timeSlot: choice.timeSlot,
  //           date: currentDate.toISOString().split("T")[0],
  //           subjectId: choice.subject.id,
  //           subjectName: choice.subject.name,
  //           fee: choice.subject.fees,
  //         });
  //       }

  //       currentDate.setDate(currentDate.getDate() + 1);
  //     }
  //   });

  //   setPackageFormData((prev) => ({
  //     ...prev,
  //     selectedSessions: sessions,
  //     totalSessions: sessions.length,
  //     tempChoices: [], // Clear temp choices after generating sessions
  //   }));
  // };

  // const addFlexibleSession = () => {
  //   if (!packageFormData.timeSlot) {
  //     setError("Vui lòng chọn khung giờ");
  //     return;
  //   }

  //   const newSession: PackageSchedule = {
  //     dayOfWeek: "",
  //     timeSlot: packageFormData.timeSlot,
  //   };

  //   setPackageFormData((prev) => ({
  //     ...prev,
  //     selectedSessions: [...prev.selectedSessions, newSession],
  //   }));
  // };

  // const updateFlexibleSession = (
  //   index: number,
  //   field: keyof PackageSchedule,
  //   value: string
  // ) => {
  //   setPackageFormData((prev) => ({
  //     ...prev,
  //     selectedSessions: prev.selectedSessions.map((session, i) =>
  //       i === index ? { ...session, [field]: value } : session
  //     ),
  //   }));
  // };

  // const removeSession = (index: number) => {
  //   // Find which temp choice this session belongs to
  //   const sessionToRemove = packageFormData.selectedSessions[index];

  //   // Remove the corresponding temp choice (by matching day/time/subjectId)
  //   const updatedTempChoices = packageFormData.tempChoices.filter(
  //     (choice: any) => {
  //       return !(
  //         choice.timeSlot === sessionToRemove.timeSlot &&
  //         choice.subject?.id === sessionToRemove.subjectId
  //       );
  //     }
  //   );

  //   // Regenerate sessions using each choice's start/end snapshot
  //   const sessions: PackageSchedule[] = [];

  //   updatedTempChoices.forEach((choice: any) => {
  //     const startDate = new Date(choice.startDate);
  //     const endDate = new Date(choice.endDate);
  //     const currentDate = new Date(startDate);

  //     while (currentDate <= endDate) {
  //       const dayOfWeek = currentDate
  //         .toLocaleDateString("en-US", { weekday: "long" })
  //         .toUpperCase();

  //       if (dayOfWeek === choice.day) {
  //         sessions.push({
  //           dayOfWeek: choice.day,
  //           timeSlot: choice.timeSlot,
  //           date: currentDate.toISOString().split("T")[0],
  //           subjectId: choice.subject.id,
  //           subjectName: choice.subject.name,
  //           fee: choice.subject.fees,
  //         });
  //       }

  //       currentDate.setDate(currentDate.getDate() + 1);
  //     }
  //   });

  //   setPackageFormData((prev) => ({
  //     ...prev,
  //     tempChoices: updatedTempChoices,
  //     selectedSessions: sessions,
  //     totalSessions: sessions.length,
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTutor) {
      setError("Không tìm thấy thông tin gia sư");
      return;
    }

    // Debug: Log selectedTutor structure
    console.log("=== DEBUG: selectedTutor structure ===");
    console.log("selectedTutor:", selectedTutor);
    console.log("selectedTutor keys:", Object.keys(selectedTutor));
    console.log("selectedTutor.user:", (selectedTutor as any)?.user);
    console.log("selectedTutor.id:", (selectedTutor as any)?.id);
    console.log("selectedTutor.userId:", (selectedTutor as any)?.userId);
    console.log("selectedTutor.ownerId:", (selectedTutor as any)?.ownerId);

    // Determine tutorUserId safely
    // For TutorProfile type: use user.id
    // For ProcessedTutor type: need to fetch user info or use a different approach
    let tutorUserId = null;

    if ((selectedTutor as any)?.user?.id) {
      // This is TutorProfile with user object
      tutorUserId = (selectedTutor as any).user.id;
      console.log("Using TutorProfile.user.id:", tutorUserId);
    } else if ((selectedTutor as any)?.id) {
      // This is ProcessedTutor - we need to fetch the user ID from backend
      // For now, let's try using the tutor profile ID and let backend handle it
      tutorUserId = (selectedTutor as any).id;
      console.log("Using ProcessedTutor.id (tutorProfileId):", tutorUserId);
    }

    console.log("=== Resolved tutorUserId:", tutorUserId);

    if (!tutorUserId) {
      console.error(
        "Cannot determine tutorUserId from selectedTutor:",
        selectedTutor
      );
      setError(
        "Không xác định được tài khoản gia sư. Vui lòng tải lại trang hoặc chọn gia sư khác."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (bookingType === "single") {
        // Single session booking - call API to create booking first
        if (!formData.date || !formData.timeSlot || !formData.subjectId) {
          setError("Vui lòng điền đầy đủ thông tin");
          return;
        }

        const selectedSubject = tutorSubjects.find(
          (s) => s.id.toString() === formData.subjectId
        );

        // Tạo booking request
        const bookingRequest = {
          tutorId: tutorUserId, // dùng User.id của gia sư
          subjectId: parseInt(formData.subjectId),
          date: formData.date,
          time: formData.timeSlot,
          bookingType: "SINGLE",
          note: formData.note,
          totalAmount: Number(selectedSubject?.fees || 0),
          paymentMethod: "CREDIT", // Default payment method
          couponId: null,
        };

        const token = localStorage.getItem("token");
        const response = await fetch("/api/booking/student/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingRequest),
        });

        const result = await response.json();

        if (result.success) {
          if (result.paymentCompleted) {
            // Thanh toán thành công, chuyển đến trang thành công
            navigate("/booking-success", {
              state: {
                bookingId: result.bookingId,
                message: result.message,
                paymentId: result.paymentId,
              },
            });
          } else if (result.paymentRequired) {
            // Cần thanh toán, chuyển đến trang thanh toán
            navigate("/payment", {
              state: {
                bookingId: result.bookingId,
                paymentId: result.paymentId,
                bookingType: "SINGLE_SESSION",
                totalAmount: selectedSubject?.fees || 0,
                tutor: {
                  id: selectedTutor.id,
                  name: `${selectedTutor.firstName} ${selectedTutor.lastName}`,
                  subject: selectedSubject?.name || "",
                  avatar: selectedTutor.imageAvatar || "/default-avatar.png",
                },
                session: {
                  date: formData.date,
                  time: formData.timeSlot,
                  subject: selectedSubject?.name || "",
                  fee: selectedSubject?.fees || 0,
                },
                note: formData.note,
              },
            });
          } else {
            // Booking thành công nhưng chưa cần thanh toán ngay
            navigate("/booking-success", {
              state: {
                bookingId: result.bookingId,
                message: result.message,
              },
            });
          }
        } else {
          setError(result.message || "Có lỗi xảy ra khi đặt lịch");
        }
      } else {
        // Package booking
        if (packageFormData.selectedSessions.length < 2) {
          setError("Vui lòng thêm ít nhất 2 buổi học để đặt gói");
          return;
        }

        if (!packageFormData.startDate || !packageFormData.endDate) {
          setError("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
          return;
        }

        // Không cần validate selectedSubjects nữa vì mỗi session đã mang subject riêng

        // Calculate total amount
        const totalAmount = packageFormData.selectedSessions.reduce(
          (total, session) => total + (session.fee || 0),
          0
        );

        // Create booking request with sessions
        const bookingRequest = {
          tutorId: tutorUserId,
          // Lấy subjectId từ session đầu tiên
          subjectId: packageFormData.selectedSessions[0]?.subjectId,
          date:
            packageFormData.selectedSessions[0].date ||
            packageFormData.startDate,
          time: packageFormData.selectedSessions[0].timeSlot,
          bookingType: "PACKAGE",
          note: packageFormData.note,
          totalAmount: totalAmount,
          paymentMethod: "CREDIT",
          couponId: null,
          sessions: packageFormData.selectedSessions.map((session) => ({
            date: session.date,
            timeSlot: session.timeSlot,
            subjectId: session.subjectId,
            fee: session.fee,
          })),
        };

        const token = localStorage.getItem("token");
        const response = await fetch("/api/booking/student/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingRequest),
        });

        const result = await response.json();

        if (result.success) {
          if (result.paymentRequired) {
            // Navigate to payment with session details
            navigate("/payment", {
              state: {
                bookingId: result.bookingId,
                paymentId: result.paymentId,
                bookingType: "PACKAGE",
                totalAmount: totalAmount,
                tutor: {
                  id: selectedTutor.id,
                  name: `${selectedTutor.firstName} ${selectedTutor.lastName}`,
                  avatar: selectedTutor.imageAvatar || "/default-avatar.png",
                },
                sessions: packageFormData.selectedSessions,
                note: packageFormData.note,
              },
            });
          } else {
            navigate("/booking-success", {
              state: {
                bookingId: result.bookingId,
                message: result.message,
              },
            });
          }
        } else {
          setError(result.message || "Có lỗi xảy ra khi đặt gói học");
        }
      }
    } catch (error: unknown) {
      setError((error as Error).message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy thông tin gia sư
          </h2>
          <button
            onClick={() => navigate("/find-tutor")}
            className="text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            style={{ backgroundColor: "#94cce6" }}
          >
            Quay lại tìm gia sư
          </button>
        </div>
      </div>
    );
  }

  const availableDays = getAvailableDays();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={selectedTutor.imageAvatar || "/default-avatar.png"}
              alt={selectedTutor.firstName}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Đặt lịch học với {selectedTutor.firstName}{" "}
                {selectedTutor.lastName}
              </h1>
              <p className="text-gray-600">{selectedTutor.headline}</p>
            </div>
          </div>
        </div>

        {/* Booking Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Chọn loại đặt lịch
          </h2> */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setBookingType("single")}
              className={`p-4 border-2 rounded-lg text-center ${
                bookingType === "single"
                  ? "border-sky-400 bg-sky-100 text-sky-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h3 className="font-semibold mb-2">Đặt lịch đơn</h3>
              <p className="text-sm text-gray-600">Đặt một buổi học đơn lẻ</p>
            </button>
            <button
              type="button"
              onClick={() => setBookingType("package")}
              className={`p-4 border-2 rounded-lg text-center ${
                bookingType === "package"
                  ? "border-sky-400 bg-sky-100 text-sky-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h3 className="font-semibold mb-2">Đặt theo gói</h3>
              <p className="text-sm text-gray-600">
                Đặt nhiều buổi học với giá ưu đãi
              </p>
            </button>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {bookingType === "single"
              ? "Thông tin đặt lịch đơn"
              : "Thông tin đặt theo gói"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Selection - Only for Single Booking */}
            {bookingType === "single" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn môn học
                </label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                  disabled={loading}
                >
                  <option value="">-- Chọn môn học --</option>
                  {tutorSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} - {subject.fees.toLocaleString()} VNĐ/buổi
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Single Session Form */}
            {bookingType === "single" && (
              <>
                {/* Date Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Chọn ngày học
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(true)}
                      className="inline-flex items-center px-2 py-1 text-xs text-sky-600 hover:text-sky-800 hover:underline"
                    >
                      Lịch dạy
                    </button>
                  </div>
                  <Calendar
                    selectedDate={formData.date}
                    onDateSelect={(date) => {
                      setFormData((prev) => ({ ...prev, date, timeSlot: "" }));
                      const timeSlots = getAvailableTimeSlotsForDay(date);
                      setAvailableTimeSlots(timeSlots);
                    }}
                    availableDays={availableDays.map((day) => day.dayOfWeek)}
                    getDayBlocks={(d) => {
                      const dayOfWeek = d
                        .toLocaleDateString("en-US", { weekday: "long" })
                        .toUpperCase();
                      const blocks: {
                        from?: string;
                        to?: string;
                        status: "AVAILABLE" | "BUSY" | "OFF" | "SELECTED";
                      }[] = [];
                      // Lịch trống từ gia sư
                      tutorSchedules
                        .filter((s) => s.enable && s.dayOfWeek === dayOfWeek)
                        .forEach((s) => {
                          blocks.push({
                            from: s.fromTime.substring(0, 5),
                            to: s.toTime.substring(0, 5),
                            status: "AVAILABLE",
                          });
                        });
                      // Đánh dấu các buổi đã chọn là SELECTED
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, "0");
                      const dd = String(d.getDate()).padStart(2, "0");
                      const iso = `${y}-${m}-${dd}`;
                      packageFormData.selectedSessions
                        .filter((s) => s.date === iso)
                        .forEach((s) => {
                          const [f, t] = (s.timeSlot || "-").split("-");
                          const idx = blocks.findIndex(
                            (b) => b.from === f && b.to === t
                          );
                          if (idx >= 0) {
                            blocks[idx].status = "SELECTED";
                          } else {
                            blocks.push({ from: f, to: t, status: "SELECTED" });
                          }
                        });
                      // Tô màu SELECTED cho slot đang chọn (single)
                      if (formData.date && formData.timeSlot) {
                        const [y2, m2, d2] = formData.date.split("-");
                        const isSameDay =
                          `${y}-${m}-${dd}` === `${y2}-${m2}-${d2}`;
                        if (isSameDay) {
                          const [sf, st] = formData.timeSlot.split("-");
                          const idx = blocks.findIndex(
                            (b) => b.from === sf && b.to === st
                          );
                          if (idx >= 0) {
                            blocks[idx].status = "SELECTED";
                          } else {
                            blocks.push({
                              from: sf,
                              to: st,
                              status: "SELECTED",
                            });
                          }
                        }
                      }
                      // Nếu không có block nào và cũng không thuộc availableDays -> OFF (để Calendar tự làm mờ ngày)
                      if (
                        blocks.length === 0 &&
                        !availableDays.some((x) => x.dayOfWeek === dayOfWeek)
                      ) {
                        blocks.push({ status: "OFF" });
                      }
                      return blocks;
                    }}
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Chọn từ ngày mai trở đi
                  </p>
                </div>

                {/* Time Slot Selection */}
                {formData.date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn khung giờ học
                    </label>
                    {availableTimeSlots.length > 0 ? (
                      <select
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                        disabled={loading}
                      >
                        <option value="">-- Chọn khung giờ --</option>
                        {availableTimeSlots.map((timeSlot) => (
                          <option key={timeSlot} value={timeSlot}>
                            {timeSlot}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-red-600">
                        Gia sư không có lịch dạy vào ngày này
                      </div>
                    )}
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                    placeholder="Nhập ghi chú cho buổi học..."
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Package Form */}
            {bookingType === "package" && (
              <>
                {/* Schedule Type Selection */}
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleScheduleTypeChange("fixed")}
                      className={`p-4 border-2 rounded-lg text-center ${
                        scheduleType === "fixed"
                          ? "border-sky-400 bg-sky-100 text-sky-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h3 className="font-semibold mb-2">
                        Lịch cố định hàng tuần
                      </h3>
                      <p className="text-sm text-gray-600">
                        Chọn các ngày trong tuần và khung giờ cố định
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScheduleTypeChange("flexible")}
                      className={`p-4 border-2 rounded-lg text-center ${
                        scheduleType === "flexible"
                          ? "border-sky-400 bg-sky-100 text-sky-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h3 className="font-semibold mb-2">Lịch tự do</h3>
                      <p className="text-sm text-gray-600">
                        Chọn từng buổi học cụ thể
                      </p>
                    </button>
                  </div>
                </div>

                {/* Fixed Schedule */}
                {scheduleType === "fixed" && (
                  <div className="space-y-4 border border-sky-300 rounded-lg p-4 bg-sky-50/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày bắt đầu
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={packageFormData.startDate}
                          onChange={handlePackageInputChange}
                          min={minDate}
                          required
                          className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày kết thúc
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={packageFormData.endDate}
                          onChange={handlePackageInputChange}
                          min={packageFormData.startDate || minDate}
                          required
                          className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Chọn ngày trong tuần
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setShowFixedInlineCalendar((v) => !v)
                            }
                            title="Xem lịch (chỉ xem)"
                            className="inline-flex items-center p-2 text-sky-600 hover:bg-sky-100 rounded-md"
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowScheduleModal(true)}
                            className="inline-flex items-center px-2 py-1 text-xs text-sky-600 hover:text-sky-800 hover:underline"
                          >
                            Lịch dạy
                          </button>
                        </div>
                      </div>
                      {showFixedInlineCalendar && (
                        <div className="mb-3">
                          <Calendar
                            selectedDate={packageFormData.startDate}
                            onDateSelect={() => {}}
                            availableDays={availableDays.map(
                              (d) => d.dayOfWeek
                            )}
                            readOnly
                            renderInline
                            getDayBlocks={(d) => {
                              const dayOfWeek = d
                                .toLocaleDateString("en-US", {
                                  weekday: "long",
                                })
                                .toUpperCase();
                              const blocks: {
                                from?: string;
                                to?: string;
                                status:
                                  | "AVAILABLE"
                                  | "BUSY"
                                  | "OFF"
                                  | "SELECTED";
                              }[] = [];
                              tutorSchedules
                                .filter(
                                  (s) => s.enable && s.dayOfWeek === dayOfWeek
                                )
                                .forEach((s) => {
                                  blocks.push({
                                    from: s.fromTime.substring(0, 5),
                                    to: s.toTime.substring(0, 5),
                                    status: "AVAILABLE",
                                  });
                                });
                              const y = d.getFullYear();
                              const m = String(d.getMonth() + 1).padStart(
                                2,
                                "0"
                              );
                              const dd = String(d.getDate()).padStart(2, "0");
                              const iso = `${y}-${m}-${dd}`;
                              // Hiển thị buổi đã chọn là SELECTED
                              packageFormData.selectedSessions
                                .filter((s) => s.date === iso)
                                .forEach((s) => {
                                  const [f, t] = (s.timeSlot || "-").split("-");
                                  const idx = blocks.findIndex(
                                    (b) => b.from === f && b.to === t
                                  );
                                  if (idx >= 0) {
                                    blocks[idx].status = "SELECTED";
                                  } else {
                                    blocks.push({
                                      from: f,
                                      to: t,
                                      status: "SELECTED",
                                    });
                                  }
                                });
                              if (
                                blocks.length === 0 &&
                                !availableDays.some(
                                  (x) => x.dayOfWeek === dayOfWeek
                                )
                              ) {
                                blocks.push({ status: "OFF" });
                              }
                              return blocks;
                            }}
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-7 gap-2">
                        {[
                          "MONDAY",
                          "TUESDAY",
                          "WEDNESDAY",
                          "THURSDAY",
                          "FRIDAY",
                          "SATURDAY",
                          "SUNDAY",
                        ].map((day) => {
                          const isAvailable = availableDays.some(
                            (d) => d.dayOfWeek === day
                          );
                          const isSelected = tempChoices.selectedDay === day;

                          return (
                            <label
                              key={day}
                              className={`p-2 text-center text-sm rounded-lg border-2 cursor-pointer ${
                                !isAvailable
                                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-sky-100 border-sky-400 text-sky-700"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="selectedDay"
                                checked={isSelected}
                                onChange={(e) =>
                                  handleDaySelection(day, e.target.checked)
                                }
                                disabled={!isAvailable || loading}
                                className="sr-only"
                              />
                              <div>
                                <div className="font-medium">
                                  {day === "MONDAY" && "T2"}
                                  {day === "TUESDAY" && "T3"}
                                  {day === "WEDNESDAY" && "T4"}
                                  {day === "THURSDAY" && "T5"}
                                  {day === "FRIDAY" && "T6"}
                                  {day === "SATURDAY" && "T7"}
                                  {day === "SUNDAY" && "CN"}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Chỉ có thể chọn 1 ngày trong tuần. Sau khi chọn xong,
                        bấm "Lưu" để thêm vào danh sách.
                      </p>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          !tempChoices.selectedDay
                            ? "text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        Chọn khung giờ
                      </label>
                      <select
                        name="timeSlot"
                        value={tempChoices.selectedTimeSlot}
                        onChange={(e) =>
                          setTempChoices((prev) => ({
                            ...prev,
                            selectedTimeSlot: e.target.value,
                          }))
                        }
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          !tempChoices.selectedDay
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 focus:ring-sky-300"
                        }`}
                        disabled={loading || !tempChoices.selectedDay}
                      >
                        <option value="">-- Chọn khung giờ --</option>
                        {getAvailableTimeSlotsForSelectedDays().map(
                          (timeSlot, idx) => (
                            <option key={`${timeSlot}-${idx}`} value={timeSlot}>
                              {timeSlot}
                            </option>
                          )
                        )}
                      </select>
                      {!tempChoices.selectedDay && (
                        <p className="text-sm text-gray-400 mt-1">
                          Vui lòng chọn ngày trong tuần trước
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn môn học
                      </label>
                      <select
                        name="selectedSubject"
                        value={tempChoices.selectedSubject?.id || ""}
                        onChange={(e) => {
                          const subjectId = e.target.value;
                          const subject = tutorSubjects.find(
                            (s) => s.id === Number(subjectId)
                          );
                          setTempChoices((prev) => ({
                            ...prev,
                            selectedSubject: subject || null,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                        disabled={loading}
                      >
                        <option value="">-- Chọn môn học --</option>
                        {tutorSubjects.map((s) => (
                          <option key={s.id} value={String(s.id)}>
                            {s.name} - {s.fees.toLocaleString("vi-VN")} VNĐ/buổi
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Add Choice Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Chọn ngày, khung giờ và môn học rồi nhấn Lưu để thêm vào
                        danh sách.
                      </p>
                      <button
                        type="button"
                        onClick={addTempChoice}
                        disabled={
                          loading ||
                          !tempChoices.selectedDay ||
                          !tempChoices.selectedTimeSlot ||
                          !tempChoices.selectedSubject
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        style={{ backgroundColor: "#94cce6" }}
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Lưu
                      </button>
                    </div>

                    {/* Tóm tắt các lựa chọn đã lưu (chưa phát sinh buổi theo ngày) */}
                    {packageFormData.tempChoices &&
                      packageFormData.tempChoices.length > 0 && (
                        <div className="mt-4 border border-gray-200 rounded-lg">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-700">
                              Lịch trong tuần đã chọn
                            </h5>
                            <div className="flex items-center gap-2">
                              {/* Select all */}
                              <label className="inline-flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedTempChoiceIdxs.length ===
                                    packageFormData.tempChoices.length
                                  }
                                  onChange={(e) =>
                                    toggleSelectAllTempChoices(e.target.checked)
                                  }
                                  className="w-4 h-4"
                                />
                              </label>
                              {/* Delete selected */}
                              <button
                                type="button"
                                onClick={deleteSelectedTempChoices}
                                disabled={selectedTempChoiceIdxs.length === 0}
                                className="inline-flex items-center p-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                                title="Xoá lựa chọn đã chọn"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {packageFormData.tempChoices.map(
                              (choice: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="px-4 py-3 flex items-center gap-4 text-sm"
                                >
                                  {/* Checkbox ở đầu hàng */}
                                  <div className="flex-shrink-0">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4"
                                      checked={selectedTempChoiceIdxs.includes(
                                        idx
                                      )}
                                      onChange={(e) => {
                                        setSelectedTempChoiceIdxs((prev) => {
                                          if (e.target.checked)
                                            return Array.from(
                                              new Set([...prev, idx])
                                            );
                                          return prev.filter((i) => i !== idx);
                                        });
                                      }}
                                    />
                                  </div>

                                  {/* Thông tin chi tiết */}
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <div>
                                      <div className="text-gray-500">Thứ</div>
                                      <div className="font-medium text-gray-900">
                                        {choice.day === "MONDAY" && "Thứ 2"}
                                        {choice.day === "TUESDAY" && "Thứ 3"}
                                        {choice.day === "WEDNESDAY" && "Thứ 4"}
                                        {choice.day === "THURSDAY" && "Thứ 5"}
                                        {choice.day === "FRIDAY" && "Thứ 6"}
                                        {choice.day === "SATURDAY" && "Thứ 7"}
                                        {choice.day === "SUNDAY" && "Chủ nhật"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">
                                        Môn học
                                      </div>
                                      <div className="font-medium text-gray-900">
                                        {choice.subject?.name}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">
                                        Khung giờ
                                      </div>
                                      <div className="font-medium text-gray-900">
                                        {choice.timeSlot}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">
                                        Ngày bắt đầu
                                      </div>
                                      <div className="font-medium text-gray-900">
                                        {choice.startDate
                                          ? new Date(
                                              choice.startDate
                                            ).toLocaleDateString("vi-VN")
                                          : "—"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">
                                        Ngày kết thúc
                                      </div>
                                      <div className="font-medium text-gray-900">
                                        {choice.endDate
                                          ? new Date(
                                              choice.endDate
                                            ).toLocaleDateString("vi-VN")
                                          : "—"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Flexible Schedule */}
                {scheduleType === "flexible" && (
                  <div className="space-y-4">
                    {/* Chọn môn học */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn môn học
                      </label>
                      <select
                        name="subjectId"
                        value={flexibleForm.subjectId}
                        onChange={(e) =>
                          setFlexibleForm((p) => ({
                            ...p,
                            subjectId: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                        disabled={loading}
                      >
                        <option value="">-- Chọn môn học --</option>
                        {tutorSubjects.map((s) => (
                          <option key={s.id} value={String(s.id)}>
                            {s.name} - {s.fees.toLocaleString("vi-VN")} VNĐ/buổi
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Chọn ngày và nút lịch dạy */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Chọn ngày học
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowScheduleModal(true)}
                          className="inline-flex items-center px-2 py-1 text-xs text-sky-600 hover:text-sky-800 hover:underline"
                        >
                          Lịch dạy
                        </button>
                      </div>
                      <Calendar
                        selectedDate={flexibleForm.date}
                        onDateSelect={(date) => {
                          setFlexibleForm((p) => ({ ...p, date }));
                        }}
                        availableDays={availableDays.map(
                          (day) => day.dayOfWeek
                        )}
                        getDayBlocks={(d) => {
                          const dayOfWeek = d
                            .toLocaleDateString("en-US", { weekday: "long" })
                            .toUpperCase();
                          const blocks: {
                            from?: string;
                            to?: string;
                            status: "AVAILABLE" | "BUSY" | "OFF" | "SELECTED";
                          }[] = [];
                          tutorSchedules
                            .filter(
                              (s) => s.enable && s.dayOfWeek === dayOfWeek
                            )
                            .forEach((s) => {
                              blocks.push({
                                from: s.fromTime.substring(0, 5),
                                to: s.toTime.substring(0, 5),
                                status: "AVAILABLE",
                              });
                            });
                          const y = d.getFullYear();
                          const m = String(d.getMonth() + 1).padStart(2, "0");
                          const dd = String(d.getDate()).padStart(2, "0");
                          const iso = `${y}-${m}-${dd}`;

                          // Đếm số ca đã chọn cho ngày này (chỉ ngày cụ thể)
                          const selectedSessionsForDay =
                            packageFormData.selectedSessions.filter(
                              (s) => s.date === iso
                            );

                          // Tô màu SELECTED cho các buổi đã chọn
                          selectedSessionsForDay.forEach((s) => {
                            const [f, t] = (s.timeSlot || "-").split("-");
                            const idxBusy = blocks.findIndex(
                              (b) => b.from === f && b.to === t
                            );
                            if (idxBusy >= 0) {
                              blocks[idxBusy].status = "SELECTED";
                            } else {
                              blocks.push({
                                from: f,
                                to: t,
                                status: "SELECTED",
                              });
                            }
                          });

                          // Tô màu SELECTED cho slot đang chọn (flexible)
                          if (flexibleForm.date && packageFormData.timeSlot) {
                            const [y2, m2, d2] = flexibleForm.date.split("-");
                            const isSameDay =
                              `${y}-${m}-${dd}` === `${y2}-${m2}-${d2}`;
                            if (isSameDay) {
                              const [sf, st] =
                                packageFormData.timeSlot.split("-");
                              const idxSel = blocks.findIndex(
                                (b) => b.from === sf && b.to === st
                              );
                              if (idxSel >= 0) {
                                blocks[idxSel].status = "SELECTED";
                              } else {
                                blocks.push({
                                  from: sf,
                                  to: st,
                                  status: "SELECTED",
                                });
                              }
                            }
                          }

                          // Không còn disable ngày - cho phép chọn tự do

                          if (
                            blocks.length === 0 &&
                            !availableDays.some(
                              (x) => x.dayOfWeek === dayOfWeek
                            )
                          ) {
                            blocks.push({ status: "OFF" });
                          }
                          return blocks;
                        }}
                        disabled={loading}
                      />
                    </div>

                    {/* Chọn khung giờ */}
                    <div className="flex items-center space-x-4">
                      <select
                        name="timeSlot"
                        value={packageFormData.timeSlot}
                        onChange={handlePackageInputChange}
                        className="flex-1 px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                        disabled={loading || !flexibleForm.date}
                      >
                        <option value="">-- Chọn khung giờ --</option>
                        {(flexibleForm.date
                          ? getAvailableTimeSlotsForDay(flexibleForm.date)
                          : []
                        ).map((timeSlot, idx) => (
                          <option key={`${timeSlot}-${idx}`} value={timeSlot}>
                            {timeSlot}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !flexibleForm.subjectId ||
                            !flexibleForm.date ||
                            !packageFormData.timeSlot
                          ) {
                            setError("Vui lòng chọn môn, ngày và khung giờ");
                            return;
                          }
                          const subject = tutorSubjects.find(
                            (s) => String(s.id) === flexibleForm.subjectId
                          );
                          const newSession: PackageSchedule = {
                            dayOfWeek: "",
                            date: flexibleForm.date,
                            timeSlot: packageFormData.timeSlot,
                            subjectId: subject?.id,
                            subjectName: subject?.name,
                            fee: subject?.fees,
                          };

                          // Kiểm tra trùng lặp và gộp danh sách
                          const existingSessions =
                            packageFormData.selectedSessions || [];
                          const existingIndex = existingSessions.findIndex(
                            (existing) =>
                              existing.date === newSession.date &&
                              existing.timeSlot === newSession.timeSlot &&
                              existing.subjectId === newSession.subjectId
                          );

                          if (existingIndex >= 0) {
                            // Trùng lặp - thay thế session cũ
                            const updatedSessions = [...existingSessions];
                            updatedSessions[existingIndex] = newSession;
                            setPackageFormData((prev) => ({
                              ...prev,
                              selectedSessions: updatedSessions,
                            }));
                            setError(
                              `Đã cập nhật buổi học ngày ${new Date(
                                flexibleForm.date
                              ).toLocaleDateString("vi-VN")}`
                            );
                            setTimeout(() => setError(null), 3000);
                          } else {
                            // Không trùng - thêm mới
                            setPackageFormData((prev) => ({
                              ...prev,
                              selectedSessions: [
                                ...prev.selectedSessions,
                                newSession,
                              ],
                            }));
                            setError(null);
                          }

                          setFlexibleForm((p) => ({ ...p, date: "" }));
                        }}
                        disabled={loading}
                        className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                        style={{ backgroundColor: "#94cce6" }}
                      >
                        Thêm buổi
                      </button>
                    </div>

                    {/* Bỏ danh sách buổi học riêng trong flexible để dùng danh sách chung phía dưới */}
                  </div>
                )}

                {/* Package Booking Form - Chỉ hiển thị khi đã có buổi học */}
                {bookingType === "package" &&
                  packageFormData.selectedSessions.length > 0 && (
                    <div className="space-y-6">
                      {/* Package Info */}
                      <div className="bg-sky-100/50 border border-sky-300 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-sky-800">
                            Tổng số buổi học:
                          </div>
                          <div className="text-lg font-bold text-sky-800">
                            {packageFormData.selectedSessions.length} buổi
                          </div>
                        </div>

                        {/* Danh sách buổi học đã chọn - Gộp vào form */}
                        <div className="space-y-4 mt-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Danh sách buổi học đã chọn (
                              {packageFormData.selectedSessions.length} buổi)
                            </h4>
                            {packageFormData.selectedSessions.length < 2 && (
                              <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                                Cần ít nhất 2 buổi học
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              <label className="inline-flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedSessionIdxs.length ===
                                    packageFormData.selectedSessions.length
                                  }
                                  onChange={(e) =>
                                    toggleSelectAllSessions(e.target.checked)
                                  }
                                  className="w-4 h-4"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={deleteSelectedSessions}
                                disabled={selectedSessionIdxs.length === 0}
                                className="inline-flex items-center p-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                                title="Xoá buổi học đã chọn"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="grid gap-3">
                            {packageFormData.selectedSessions.map(
                              (session, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-sky-100/30 rounded-lg border border-sky-300"
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4"
                                      checked={selectedSessionIdxs.includes(
                                        index
                                      )}
                                      onChange={(e) => {
                                        setSelectedSessionIdxs((prev) => {
                                          if (e.target.checked)
                                            return Array.from(
                                              new Set([...prev, index])
                                            );
                                          return prev.filter(
                                            (i) => i !== index
                                          );
                                        });
                                      }}
                                    />
                                    <div className="text-sm">
                                      <div className="font-medium text-gray-900">
                                        {session.subjectName}
                                      </div>
                                      <div className="text-gray-500">
                                        {session.date
                                          ? new Date(
                                              session.date
                                            ).toLocaleDateString("vi-VN")
                                          : "Chưa chọn ngày"}{" "}
                                        - {session.timeSlot}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {session.fee
                                      ? `${session.fee.toLocaleString(
                                          "vi-VN"
                                        )} VNĐ`
                                      : "Chưa xác định"}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="text-sm font-medium text-sky-800">
                            Tổng học phí:
                          </div>
                          <div className="text-2xl font-bold text-sky-800">
                            {packageFormData.selectedSessions
                              .reduce(
                                (total, session) => total + (session.fee || 0),
                                0
                              )
                              .toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Ghi chú - Tách ra ngoài form */}
                {/* Ghi chú - Tách ra ngoài form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    name="note"
                    value={packageFormData.note}
                    onChange={handlePackageInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                    placeholder="Nhập ghi chú cho gói học..."
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Tutor Schedule Info moved to modal */}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2 border border-sky-300 text-sky-600 rounded-md hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                disabled={loading}
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  !selectedTutor ||
                  (bookingType === "single" &&
                    (!formData.date ||
                      !formData.timeSlot ||
                      !formData.subjectId)) ||
                  (bookingType === "package" &&
                    (packageFormData.selectedSessions.length < 2 ||
                      !packageFormData.startDate ||
                      !packageFormData.endDate))
                }
                className="flex-1 px-4 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ backgroundColor: "#94cce6" }}
                onClick={() => {
                  console.log("Button clicked - Debug info:");
                  console.log("selectedTutor:", selectedTutor);
                  console.log(
                    "selectedTutor.user:",
                    (selectedTutor as any)?.user
                  );
                  console.log("formData:", formData);
                  console.log("bookingType:", bookingType);
                }}
              >
                {loading
                  ? "Đang xử lý..."
                  : bookingType === "single"
                  ? "Đặt lịch học"
                  : "Đặt gói học"}
              </button>
            </div>
          </form>
        </div>

        {/* Modal hiển thị lịch dạy của gia sư */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowScheduleModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowScheduleModal(false)}
                aria-label="Đóng"
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Lịch dạy của gia sư
              </h3>
              {availableDays.length === 0 ? (
                <div className="text-sm text-gray-600">Chưa có lịch dạy.</div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-auto pr-1">
                  {availableDays.map((dayGroup) => (
                    <div
                      key={dayGroup.dayOfWeek}
                      className="flex items-center space-x-2"
                    >
                      <span className="inline-block bg-sky-100 text-sky-800 px-3 py-1 rounded text-sm font-medium min-w-[80px]">
                        {dayGroup.vietnameseDay}
                      </span>
                      <span className="text-sm text-sky-800">
                        {dayGroup.schedules.map((schedule, index) => {
                          const fromTime = schedule.fromTime.substring(0, 5);
                          const toTime = schedule.toTime.substring(0, 5);
                          return (
                            <span key={index}>
                              {fromTime} - {toTime}
                              {index < dayGroup.schedules.length - 1 && " & "}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedBookingNew;
