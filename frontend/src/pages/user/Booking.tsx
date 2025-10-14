import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import Calendar from "../../components/Calendar";
import type {
  BookingRequestCreateDTO,
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
    sessionsPerWeek: 2,
    note: "",
    startDate: "",
    selectedDays: [] as string[],
    timeSlot: "",
    selectedSessions: [] as PackageSchedule[],
  });

  const [scheduleType, setScheduleType] = useState<"fixed" | "flexible">(
    "fixed"
  );

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
  const getAvailableTimeSlots = () => {
    return tutorSchedules
      .filter((schedule) => schedule.enable)
      .map((schedule) => `${schedule.fromTime}-${schedule.toTime}`);
  };

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
    setPackageFormData((prev) => ({
      ...prev,
      selectedDays: checked
        ? [...prev.selectedDays, day]
        : prev.selectedDays.filter((d) => d !== day),
    }));
  };

  const handleScheduleTypeChange = (type: "fixed" | "flexible") => {
    setScheduleType(type);
    if (type === "fixed") {
      setPackageFormData((prev) => ({
        ...prev,
        selectedSessions: [],
      }));
    } else {
      setPackageFormData((prev) => ({
        ...prev,
        selectedDays: [],
      }));
    }
  };

  const addFlexibleSession = () => {
    if (!packageFormData.timeSlot) {
      setError("Vui lòng chọn khung giờ");
      return;
    }

    const newSession: PackageSchedule = {
      dayOfWeek: "",
      timeSlot: packageFormData.timeSlot,
    };

    setPackageFormData((prev) => ({
      ...prev,
      selectedSessions: [...prev.selectedSessions, newSession],
    }));
  };

  const updateFlexibleSession = (
    index: number,
    field: keyof PackageSchedule,
    value: string
  ) => {
    setPackageFormData((prev) => ({
      ...prev,
      selectedSessions: prev.selectedSessions.map((session, i) =>
        i === index ? { ...session, [field]: value } : session
      ),
    }));
  };

  const removeFlexibleSession = (index: number) => {
    setPackageFormData((prev) => ({
      ...prev,
      selectedSessions: prev.selectedSessions.filter((_, i) => i !== index),
    }));
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
        if (!packageFormData.subjectId) {
          setError("Vui lòng chọn môn học");
          return;
        }

        if (
          scheduleType === "fixed" &&
          (!packageFormData.startDate ||
            packageFormData.selectedDays.length === 0 ||
            !packageFormData.timeSlot)
        ) {
          setError("Vui lòng điền đầy đủ thông tin lịch cố định");
          return;
        }

        if (
          scheduleType === "flexible" &&
          packageFormData.selectedSessions.length === 0
        ) {
          setError("Vui lòng thêm ít nhất một buổi học");
          return;
        }

        const [fromTime, toTime] = (
          packageFormData.timeSlot ||
          packageFormData.selectedSessions[0]?.timeSlot ||
          "09:00-10:30"
        ).split("-");

        const bookingData: BookingRequestCreateDTO = {
          tutorId: tutorUserId,
          subjectId: parseInt(packageFormData.subjectId),
          date:
            packageFormData.startDate || new Date().toISOString().split("T")[0],
          fromTime: fromTime,
          toTime: toTime,
          bookingType: "PACKAGE",
          note: packageFormData.note,
          sessionsPerWeek: packageFormData.sessionsPerWeek,
          contractDuration: 3,
        };

        await bookingService.createBooking(bookingData);
        navigate("/my-sessions", {
          state: { message: "Đặt gói học thành công!" },
        });
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại tìm gia sư
          </button>
        </div>
      </div>
    );
  }

  const availableDays = getAvailableDays();
  const availableTimeSlotsPackage = getAvailableTimeSlots();

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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Chọn loại đặt lịch
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setBookingType("single")}
              className={`p-4 border-2 rounded-lg text-center ${
                bookingType === "single"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
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
                  ? "border-blue-500 bg-blue-50 text-blue-700"
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
              : "Thông tin gói học"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn môn học
              </label>
              <select
                name="subjectId"
                value={
                  bookingType === "single"
                    ? formData.subjectId
                    : packageFormData.subjectId
                }
                onChange={
                  bookingType === "single"
                    ? handleInputChange
                    : handlePackageInputChange
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Single Session Form */}
            {bookingType === "single" && (
              <>
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ngày học
                  </label>
                  <Calendar
                    selectedDate={formData.date}
                    onDateSelect={(date) => {
                      setFormData((prev) => ({ ...prev, date, timeSlot: "" }));
                      const timeSlots = getAvailableTimeSlotsForDay(date);
                      setAvailableTimeSlots(timeSlots);
                    }}
                    availableDays={availableDays.map((day) => day.dayOfWeek)}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập ghi chú cho buổi học..."
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Package Form */}
            {bookingType === "package" && (
              <>
                {/* Package Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tổng số buổi học
                    </label>
                    <input
                      type="number"
                      name="totalSessions"
                      value={packageFormData.totalSessions}
                      onChange={handlePackageInputChange}
                      min="12"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số buổi/tuần
                    </label>
                    <input
                      type="number"
                      name="sessionsPerWeek"
                      value={packageFormData.sessionsPerWeek}
                      onChange={handlePackageInputChange}
                      min="1"
                      max="7"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Schedule Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Chọn loại lịch học
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleScheduleTypeChange("fixed")}
                      className={`p-4 border-2 rounded-lg text-center ${
                        scheduleType === "fixed"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
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
                          ? "border-blue-500 bg-blue-50 text-blue-700"
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
                  <div className="space-y-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn các ngày trong tuần
                      </label>
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
                          const isSelected =
                            packageFormData.selectedDays.includes(day);

                          return (
                            <label
                              key={day}
                              className={`p-2 text-center text-sm rounded-lg border-2 cursor-pointer ${
                                !isAvailable
                                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-blue-50 border-blue-500 text-blue-700"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn khung giờ
                      </label>
                      <select
                        name="timeSlot"
                        value={packageFormData.timeSlot}
                        onChange={handlePackageInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      >
                        <option value="">-- Chọn khung giờ --</option>
                        {availableTimeSlotsPackage.map((timeSlot, idx) => (
                          <option key={`${timeSlot}-${idx}`} value={timeSlot}>
                            {timeSlot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Flexible Schedule */}
                {scheduleType === "flexible" && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <select
                        name="timeSlot"
                        value={packageFormData.timeSlot}
                        onChange={handlePackageInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      >
                        <option value="">-- Chọn khung giờ --</option>
                        {availableTimeSlotsPackage.map((timeSlot, idx) => (
                          <option key={`${timeSlot}-${idx}`} value={timeSlot}>
                            {timeSlot}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addFlexibleSession}
                        disabled={!packageFormData.timeSlot || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Thêm buổi
                      </button>
                    </div>

                    {/* Selected Sessions */}
                    {packageFormData.selectedSessions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">
                          Các buổi học đã chọn:
                        </h4>
                        {packageFormData.selectedSessions.map(
                          (session, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                            >
                              <select
                                value={session.dayOfWeek}
                                onChange={(e) =>
                                  updateFlexibleSession(
                                    index,
                                    "dayOfWeek",
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">-- Chọn ngày --</option>
                                {availableDays.map((day) => (
                                  <option
                                    key={day.dayOfWeek}
                                    value={day.dayOfWeek}
                                  >
                                    {day.vietnameseDay}
                                  </option>
                                ))}
                              </select>
                              <span className="text-gray-600">
                                {session.timeSlot}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFlexibleSession(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Xóa
                              </button>
                            </div>
                          )
                        )}
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
                    value={packageFormData.note}
                    onChange={handlePackageInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập ghi chú cho gói học..."
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Tutor Schedule Info */}
            {tutorSchedules.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-3">
                  Lịch dạy của gia sư:
                </h3>
                <div className="space-y-2">
                  {availableDays.map((dayGroup) => (
                    <div
                      key={dayGroup.dayOfWeek}
                      className="flex items-center space-x-2"
                    >
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium min-w-[80px]">
                        {dayGroup.vietnameseDay}
                      </span>
                      <span className="text-sm text-blue-800">
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
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  (bookingType === "package" && !packageFormData.subjectId)
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};

export default UnifiedBookingNew;
