import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
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
  date?: string; // For flexible schedule
}

const PackageBookingNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorSchedules, setTutorSchedules] = useState<TutorSchedule[]>([]);
  const [tutorSubjects, setTutorSubjects] = useState<TutorProfileSubject[]>([]);
  const [canTakeTrial, setCanTakeTrial] = useState(true);

  // Get tutor info from navigation state
  const selectedTutor =
    (location.state?.selectedTutor as
      | TutorPreviewProfile
      | TutorProfile
      | null) || null;

  const [bookingMode, setBookingMode] = useState<"trial" | "package">(
    "package"
  );
  const [scheduleType, setScheduleType] = useState<"fixed" | "flexible">(
    "fixed"
  );

  const [formData, setFormData] = useState({
    subjectId: "",
    totalSessions: 12,
    sessionsPerWeek: 2,
    note: "",
    // Fixed schedule
    startDate: "",
    selectedDays: [] as string[],
    timeSlot: "",
    // Flexible schedule
    selectedSessions: [] as PackageSchedule[],
  });

  // Get tomorrow's date as minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    if (selectedTutor) {
      loadTutorData();
      checkTrialEligibility();
    }
  }, [selectedTutor]);

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

  const checkTrialEligibility = async () => {
    if (!selectedTutor) return;

    try {
      // TODO: Implement trial eligibility check API
      setCanTakeTrial(true);
    } catch (error) {
      console.error("Error checking trial eligibility:", error);
      setCanTakeTrial(false);
    }
  };

  // Lấy các ngày trong tuần mà gia sư có lịch
  const getAvailableDays = () => {
    const days = tutorSchedules
      .filter((schedule) => schedule.enable)
      .map((schedule) => schedule.dayOfWeek);
    return [...new Set(days)]; // Remove duplicates
  };

  // Lấy các khung giờ cho ngày đã chọn
  const getAvailableTimeSlots = () => {
    return tutorSchedules
      .filter((schedule) => schedule.enable)
      .map((schedule) => `${schedule.fromTime}-${schedule.toTime}`);
  };

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
  };

  const handleDaySelection = (day: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: checked
        ? [...prev.selectedDays, day]
        : prev.selectedDays.filter((d) => d !== day),
    }));
  };

  const handleScheduleTypeChange = (type: "fixed" | "flexible") => {
    setScheduleType(type);
    // Clear selected sessions when switching to fixed
    if (type === "fixed") {
      setFormData((prev) => ({
        ...prev,
        selectedSessions: [],
      }));
    }
    // Clear selected days when switching to flexible
    else {
      setFormData((prev) => ({
        ...prev,
        selectedDays: [],
      }));
    }
  };

  // Add flexible session
  const addFlexibleSession = () => {
    if (!formData.timeSlot) {
      setError("Vui lòng chọn khung giờ");
      return;
    }

    const newSession: PackageSchedule = {
      dayOfWeek: "",
      timeSlot: formData.timeSlot,
    };

    setFormData((prev) => ({
      ...prev,
      selectedSessions: [...prev.selectedSessions, newSession],
    }));
  };

  // Update flexible session
  const updateFlexibleSession = (
    index: number,
    field: keyof PackageSchedule,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      selectedSessions: prev.selectedSessions.map((session, i) =>
        i === index ? { ...session, [field]: value } : session
      ),
    }));
  };

  // Remove flexible session
  const removeFlexibleSession = (index: number) => {
    setFormData((prev) => ({
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

    if (!formData.subjectId) {
      setError("Vui lòng chọn môn học");
      return;
    }

    if (
      scheduleType === "fixed" &&
      (!formData.startDate ||
        formData.selectedDays.length === 0 ||
        !formData.timeSlot)
    ) {
      setError("Vui lòng điền đầy đủ thông tin lịch cố định");
      return;
    }

    if (scheduleType === "flexible" && formData.selectedSessions.length === 0) {
      setError("Vui lòng thêm ít nhất một buổi học");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [fromTime, toTime] = (
        formData.timeSlot ||
        formData.selectedSessions[0]?.timeSlot ||
        "09:00-10:30"
      ).split("-");

      const bookingData: BookingRequestCreateDTO = {
        tutorId: selectedTutor.id,
        subjectId: parseInt(formData.subjectId),
        date: formData.startDate || new Date().toISOString().split("T")[0],
        fromTime: fromTime,
        toTime: toTime,
        bookingType: bookingMode === "trial" ? "TRIAL" : ("PACKAGE" as const),
        note: formData.note,
        sessionsPerWeek: formData.sessionsPerWeek,
        contractDuration: 3, // Default 3 months
      };

      await bookingService.createBooking(bookingData);
      navigate("/my-sessions", {
        state: { message: "Đặt gói học thành công!" },
      });
    } catch (error: unknown) {
      setError((error as Error).message || "Đặt gói học thất bại");
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
  const availableTimeSlots = getAvailableTimeSlots();

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
                Đặt gói học với {selectedTutor.firstName}{" "}
                {selectedTutor.lastName}
              </h1>
              <p className="text-gray-600">{selectedTutor.headline}</p>
            </div>
          </div>
        </div>

        {/* Booking Mode Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Chọn loại đặt gói
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setBookingMode("package")}
              className={`p-4 border-2 rounded-lg text-center ${
                bookingMode === "package"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h3 className="font-semibold mb-2">Đăng ký gói luôn</h3>
              <p className="text-sm text-gray-600">
                Mỗi 12+ buổi được giảm 50% giá 1 buổi học
              </p>
            </button>
            <button
              type="button"
              onClick={() => setBookingMode("trial")}
              disabled={!canTakeTrial}
              className={`p-4 border-2 rounded-lg text-center ${
                bookingMode === "trial"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : canTakeTrial
                  ? "border-gray-200 hover:border-gray-300"
                  : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <h3 className="font-semibold mb-2">Học thử trước</h3>
              <p className="text-sm text-gray-600">
                50% phí buổi học thử, nếu đăng ký gói 12+ sẽ được giảm thêm
              </p>
              {!canTakeTrial && (
                <p className="text-xs text-red-500 mt-2">
                  Bạn đã học thử với gia sư này rồi
                </p>
              )}
            </button>
          </div>
        </div>

        {/* Package Booking Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Thông tin gói học
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
                value={formData.subjectId}
                onChange={handleInputChange}
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

            {/* Package Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng số buổi học
                </label>
                <input
                  type="number"
                  name="totalSessions"
                  value={formData.totalSessions}
                  onChange={handleInputChange}
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
                  value={formData.sessionsPerWeek}
                  onChange={handleInputChange}
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
                  <h3 className="font-semibold mb-2">Lịch cố định hàng tuần</h3>
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
                    value={formData.startDate}
                    onChange={handleInputChange}
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
                      const isAvailable = availableDays.includes(day);
                      const isSelected = formData.selectedDays.includes(day);

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
                </div>
              </div>
            )}

            {/* Flexible Schedule */}
            {scheduleType === "flexible" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="">-- Chọn khung giờ --</option>
                    {availableTimeSlots.map((timeSlot) => (
                      <option key={timeSlot} value={timeSlot}>
                        {timeSlot}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addFlexibleSession}
                    disabled={!formData.timeSlot || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Thêm buổi
                  </button>
                </div>

                {/* Selected Sessions */}
                {formData.selectedSessions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                      Các buổi học đã chọn:
                    </h4>
                    {formData.selectedSessions.map((session, index) => (
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
                            <option key={day} value={day}>
                              {day === "MONDAY" && "Thứ 2"}
                              {day === "TUESDAY" && "Thứ 3"}
                              {day === "WEDNESDAY" && "Thứ 4"}
                              {day === "THURSDAY" && "Thứ 5"}
                              {day === "FRIDAY" && "Thứ 6"}
                              {day === "SATURDAY" && "Thứ 7"}
                              {day === "SUNDAY" && "Chủ nhật"}
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
                    ))}
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
                placeholder="Nhập ghi chú cho gói học..."
                disabled={loading}
              />
            </div>

            {/* Tutor Schedule Info */}
            {tutorSchedules.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Lịch dạy của gia sư:
                </h3>
                <div className="text-sm text-blue-800">
                  {availableDays.map((day) => (
                    <span
                      key={day}
                      className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-1"
                    >
                      {day === "MONDAY" && "Thứ 2"}
                      {day === "TUESDAY" && "Thứ 3"}
                      {day === "WEDNESDAY" && "Thứ 4"}
                      {day === "THURSDAY" && "Thứ 5"}
                      {day === "FRIDAY" && "Thứ 6"}
                      {day === "SATURDAY" && "Thứ 7"}
                      {day === "SUNDAY" && "Chủ nhật"}
                    </span>
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
                disabled={loading || !formData.subjectId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Đang xử lý..."
                  : bookingMode === "trial"
                  ? "Đặt học thử"
                  : "Đặt gói học"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PackageBookingNew;
