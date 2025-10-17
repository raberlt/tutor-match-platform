import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "../../components/Calendar";
import {
  BookingTypeSelector,
  SubjectSelector,
  ScheduleTypeSelector,
  DateRangeSelector,
  DayOfWeekSelector,
  TimeSlotSelector,
  SessionList,
  TempChoicesList,
  TutorScheduleModal,
  ActionButton,
} from "../../components/booking";
import type {
  TutorPreviewProfile,
  TutorProfile,
  TutorProfileSubject,
} from "../../types";
import { bookingService } from "../../services/bookingService";
import type { BookingRequestCreateDTO } from "../../types";

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

interface TempChoice {
  day: string;
  timeSlot: string;
  subject: { id: number; name: string; fees: number };
  startDate: string;
  endDate: string;
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

  // Form data for single session
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
    tempChoices: [] as TempChoice[],
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
        packageFormData.tempChoices.map((_: TempChoice, i: number) => i)
      );
    } else {
      setSelectedTempChoiceIdxs([]);
    }
  };

  const deleteSelectedTempChoices = () => {
    if (!packageFormData.tempChoices?.length) return;
    const remainChoices = packageFormData.tempChoices.filter(
      (_, i: number) => !selectedTempChoiceIdxs.includes(i)
    );

    // Regenerate sessions from remaining choices using snapshot start/end
    const sessions: PackageSchedule[] = [];
    remainChoices.forEach((choice: TempChoice) => {
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
        packageFormData.selectedSessions.map(
          (_: PackageSchedule, i: number) => i
        )
      );
    } else {
      setSelectedSessionIdxs([]);
    }
  };

  const deleteSelectedSessions = () => {
    if (!packageFormData.selectedSessions?.length) return;
    const remain = packageFormData.selectedSessions.filter(
      (_, i: number) => !selectedSessionIdxs.includes(i)
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

  // Single session handlers
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
    if (type === "fixed") {
      setPackageFormData((prev) => ({
        ...prev,
        // giữ nguyên selectedSessions
      }));
    } else {
      setPackageFormData((prev) => ({
        ...prev,
        // giữ nguyên selectedSessions
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
    const startDate = new Date(packageFormData.startDate || minDate);
    const endDate = new Date(packageFormData.endDate || minDate);
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
          new Date(newSession.date || minDate).toLocaleDateString("vi-VN")
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
    const newChoice: TempChoice = {
      day: tempChoices.selectedDay,
      timeSlot: tempChoices.selectedTimeSlot,
      subject: tempChoices.selectedSubject,
      startDate: packageFormData.startDate,
      endDate: packageFormData.endDate,
    };

    // Kiểm tra trùng lặp trong tempChoices (dựa trên ngày + khung giờ + khoảng thời gian)
    const existingTempChoices = packageFormData.tempChoices || [];
    const updatedTempChoices = [...existingTempChoices];

    const duplicateTempIndex = existingTempChoices.findIndex(
      (existing: TempChoice) =>
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
    console.log("selectedTutor.user:", (selectedTutor as TutorProfile)?.user);
    console.log(
      "selectedTutor.id:",
      (selectedTutor as TutorPreviewProfile)?.id
    );
    console.log(
      "selectedTutor.userId:",
      (selectedTutor as TutorPreviewProfile)?.user?.id
    );
    console.log(
      "selectedTutor.ownerId:",
      (selectedTutor as TutorPreviewProfile)?.user?.id
    );

    // Determine tutorUserId safely
    let tutorUserId = null;

    if ((selectedTutor as TutorProfile)?.user?.id) {
      // This is TutorProfile with user object
      tutorUserId = (selectedTutor as TutorProfile).user.id;
      console.log("Using TutorProfile.user.id:", tutorUserId);
    } else if ((selectedTutor as TutorPreviewProfile)?.id) {
      // This is ProcessedTutor - we need to fetch the user ID from backend
      tutorUserId = (selectedTutor as TutorPreviewProfile).id;
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
        // Single session booking
        if (!formData.date || !formData.timeSlot || !formData.subjectId) {
          setError("Vui lòng điền đầy đủ thông tin");
          return;
        }

        const selectedSubject = tutorSubjects.find(
          (s) => s.id.toString() === formData.subjectId
        );

        const [fromTime, toTime] = formData.timeSlot.split("-");
        const bookingRequest: BookingRequestCreateDTO = {
          tutorId: Number(tutorUserId),
          subjectId: parseInt(formData.subjectId),
          date: formData.date,
          fromTime,
          toTime,
          bookingType: "SINGLE",
          note: formData.note,
          totalAmount: Number(selectedSubject?.fees || 0),
          paymentMethod: "CREDIT",
        };

        const result = await bookingService.createBooking({
          ...bookingRequest,
          sessions: packageFormData.selectedSessions.map((session) => {
            const [f, t] = (session.timeSlot || "-").split("-");
            return {
              date: session.date!,
              fromTime: f,
              toTime: t,
              subjectId: session.subjectId,
              fee: session.fee,
            };
          }),
        });

        if (result.success) {
          if (result.paymentCompleted) {
            navigate("/booking-success", {
              state: {
                bookingId: result.bookingId,
                message: result.message,
                paymentId: result.paymentId,
              },
            });
          } else if (result.paymentRequired) {
            navigate("/payment", {
              state: {
                bookingId: result.bookingId,
                bookingCode: result.bookingCode,
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

        // Calculate total amount
        const totalAmount = packageFormData.selectedSessions.reduce(
          (total, session) => total + (session.fee || 0),
          0
        );

        const first = packageFormData.selectedSessions[0];
        const [firstFrom, firstTo] = (first.timeSlot || "-").split("-");
        const bookingRequest: BookingRequestCreateDTO = {
          tutorId: Number(tutorUserId),
          subjectId: Number(first?.subjectId),
          date: first?.date || packageFormData.startDate,
          fromTime: firstFrom,
          toTime: firstTo,
          bookingType: "PACKAGE",
          note: packageFormData.note,
          totalSessions: packageFormData.selectedSessions.length,
          totalAmount: totalAmount,
          paymentMethod: "CREDIT",
        };

        const result = await bookingService.createBooking({
          ...bookingRequest,
          sessions: packageFormData.selectedSessions.map((session) => {
            const [f, t] = (session.timeSlot || "-").split("-");
            return {
              date: session.date!,
              fromTime: f,
              toTime: t,
              subjectId: session.subjectId,
              fee: session.fee,
            };
          }),
        });

        if (result.success) {
          // Gói học: luôn chuyển sang trang thành công + hướng dẫn chờ gia sư đồng ý
          navigate("/booking-success", {
            state: {
              bookingId: result.bookingId,
              message:
                result.message ||
                "Đặt gói học thành công! Vui lòng chờ gia sư đồng ý trước khi thanh toán.",
              bookingType: "PACKAGE",
              nextStep: "AWAITING_TUTOR_ACCEPT",
            },
          });
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
          <ActionButton
            onClick={() => navigate("/find-tutor")}
            variant="primary"
            className="px-6 py-2"
          >
            Quay lại tìm gia sư
          </ActionButton>
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
        <BookingTypeSelector
          bookingType={bookingType}
          onBookingTypeChange={setBookingType}
        />

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
              <SubjectSelector
                subjects={tutorSubjects}
                selectedSubjectId={formData.subjectId}
                onSubjectChange={(subjectId) =>
                  setFormData((prev) => ({ ...prev, subjectId }))
                }
                disabled={loading}
                required
              />
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
                <TimeSlotSelector
                  timeSlots={availableTimeSlots}
                  selectedTimeSlot={formData.timeSlot}
                  onTimeSlotChange={(timeSlot) =>
                    setFormData((prev) => ({ ...prev, timeSlot }))
                  }
                  disabled={loading || !formData.date}
                  required
                  label="Chọn khung giờ học"
                />

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
                <ScheduleTypeSelector
                  scheduleType={scheduleType}
                  onScheduleTypeChange={handleScheduleTypeChange}
                />

                {/* Fixed Schedule */}
                {scheduleType === "fixed" && (
                  <div className="space-y-4 border border-sky-300 rounded-lg p-4 bg-sky-50/30">
                    <DateRangeSelector
                      startDate={packageFormData.startDate}
                      endDate={packageFormData.endDate}
                      onStartDateChange={(date) =>
                        setPackageFormData((prev) => ({
                          ...prev,
                          startDate: date,
                        }))
                      }
                      onEndDateChange={(date) =>
                        setPackageFormData((prev) => ({
                          ...prev,
                          endDate: date,
                        }))
                      }
                      minDate={minDate}
                      disabled={loading}
                    />

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
                      <DayOfWeekSelector
                        availableDays={availableDays.map((d) => d.dayOfWeek)}
                        selectedDay={tempChoices.selectedDay}
                        onDayChange={handleDaySelection}
                        disabled={loading}
                      />
                    </div>

                    <TimeSlotSelector
                      timeSlots={getAvailableTimeSlotsForSelectedDays()}
                      selectedTimeSlot={tempChoices.selectedTimeSlot}
                      onTimeSlotChange={(timeSlot) =>
                        setTempChoices((prev) => ({
                          ...prev,
                          selectedTimeSlot: timeSlot,
                        }))
                      }
                      disabled={loading || !tempChoices.selectedDay}
                      required
                      label="Chọn khung giờ"
                    />

                    {/* Subject + Save in one row */}
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex-1">
                        <SubjectSelector
                          subjects={tutorSubjects}
                          selectedSubjectId={
                            tempChoices.selectedSubject?.id || ""
                          }
                          onSubjectChange={(subjectId) => {
                            const subject = tutorSubjects.find(
                              (s) => s.id === Number(subjectId)
                            );
                            setTempChoices((prev) => ({
                              ...prev,
                              selectedSubject: subject || null,
                            }));
                          }}
                          disabled={loading}
                        />
                      </div>
                      <ActionButton
                        onClick={addTempChoice}
                        disabled={
                          loading ||
                          !tempChoices.selectedDay ||
                          !tempChoices.selectedTimeSlot ||
                          !tempChoices.selectedSubject
                        }
                        variant="primary"
                      >
                        Lưu
                      </ActionButton>
                    </div>

                    {/* Temp Choices List */}
                    <TempChoicesList
                      tempChoices={packageFormData.tempChoices}
                      selectedTempChoiceIdxs={selectedTempChoiceIdxs}
                      onTempChoiceSelect={(index, checked) => {
                        setSelectedTempChoiceIdxs((prev) => {
                          if (checked)
                            return Array.from(new Set([...prev, index]));
                          return prev.filter((i) => i !== index);
                        });
                      }}
                      onSelectAll={toggleSelectAllTempChoices}
                      onDeleteSelected={deleteSelectedTempChoices}
                    />
                  </div>
                )}

                {/* Flexible Schedule */}
                {scheduleType === "flexible" && (
                  <div className="space-y-4 border border-sky-300 rounded-lg p-4 bg-sky-50/30">
                    {/* Subject */}
                    <SubjectSelector
                      subjects={tutorSubjects}
                      selectedSubjectId={flexibleForm.subjectId}
                      onSubjectChange={(subjectId) =>
                        setFlexibleForm((p) => ({ ...p, subjectId }))
                      }
                      disabled={loading}
                    />

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
                    <div className="flex items-end space-x-4">
                      <div className="flex-1">
                        <TimeSlotSelector
                          timeSlots={
                            flexibleForm.date
                              ? getAvailableTimeSlotsForDay(flexibleForm.date)
                              : []
                          }
                          selectedTimeSlot={packageFormData.timeSlot}
                          onTimeSlotChange={(timeSlot) =>
                            setPackageFormData((prev) => ({
                              ...prev,
                              timeSlot,
                            }))
                          }
                          disabled={loading || !flexibleForm.date}
                          placeholder="-- Chọn khung giờ --"
                        />
                      </div>
                      <ActionButton
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
                        variant="primary"
                      >
                        Lưu
                      </ActionButton>
                    </div>
                  </div>
                )}

                {/* Package Booking Form - Chỉ hiển thị khi đã có buổi học */}
                {packageFormData.selectedSessions.length > 0 && (
                  <div className="space-y-6">
                    {/* Package Info */}
                    <div className="bg-sky-100/50 border border-sky-300 rounded-lg p-4">
                      {/* Session List */}
                      <div className="space-y-4 mt-4">
                        <SessionList
                          sessions={packageFormData.selectedSessions}
                          selectedSessionIdxs={selectedSessionIdxs}
                          onSessionSelect={(index, checked) => {
                            setSelectedSessionIdxs((prev) => {
                              if (checked)
                                return Array.from(new Set([...prev, index]));
                              return prev.filter((i) => i !== index);
                            });
                          }}
                          onSelectAll={toggleSelectAllSessions}
                          onDeleteSelected={deleteSelectedSessions}
                        />
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

                {/* Ghi chú */}
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

            {/* Submit Button */}
            <div className="flex space-x-4">
              <ActionButton
                onClick={() => navigate(-1)}
                variant="secondary"
                className="flex-1"
                disabled={loading}
              >
                Quay lại
              </ActionButton>
              <ActionButton
                type="submit"
                variant="primary"
                className="flex-1"
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
              >
                {bookingType === "single" ? "Đặt lịch học" : "Đặt gói học"}
              </ActionButton>
            </div>
          </form>
        </div>

        {/* Tutor Schedule Modal */}
        <TutorScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          availableDays={availableDays}
        />
      </div>
    </div>
  );
};

export default UnifiedBookingNew;
