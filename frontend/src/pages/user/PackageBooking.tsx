import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import { tutorScheduleService } from "../../services/tutorScheduleService";
import type { TutorSubject } from "../../services/tutorScheduleService";
import type {
  BookingRequestCreateDTO,
  TutorPreviewProfile,
  TutorProfile,
  TutorSchedule,
} from "../../types";

const PackageBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorSchedules, setTutorSchedules] = useState<TutorSchedule[]>([]);
  const [tutorSubjects, setTutorSubjects] = useState<TutorSubject[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [canTakeTrial, setCanTakeTrial] = useState(true);

  // Get tutor info from navigation state
  const selectedTutor =
    (location.state?.selectedTutor as
      | TutorPreviewProfile
      | TutorProfile
      | null) || null;

  const [formData, setFormData] = useState({
    bookingMode: "", // "trial" hoặc "package"
    date: "",
    timeSlot: "",
    subjectId: "",
    learningGoals: "",
    // Package specific
    totalSessions: 12,
    sessionsPerWeek: 2,
    contractDuration: 3, // tháng
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

      // Load tutor schedules and subjects from API
      const [schedules, subjects] = await Promise.all([
        tutorScheduleService.getTutorSchedules(selectedTutor.id),
        tutorScheduleService.getTutorSubjects(selectedTutor.id),
      ]);

      setTutorSchedules(schedules);
      setTutorSubjects(subjects);
    } catch (error) {
      console.error("Error loading tutor data:", error);

      // Fallback to mock data if API fails
      const mockSchedules: TutorSchedule[] = [
        { dayOfWeek: "MONDAY", fromTime: "08:00", toTime: "12:00" },
        { dayOfWeek: "MONDAY", fromTime: "14:00", toTime: "18:00" },
        { dayOfWeek: "TUESDAY", fromTime: "08:00", toTime: "12:00" },
        { dayOfWeek: "TUESDAY", fromTime: "14:00", toTime: "18:00" },
        { dayOfWeek: "WEDNESDAY", fromTime: "08:00", toTime: "12:00" },
        { dayOfWeek: "WEDNESDAY", fromTime: "14:00", toTime: "18:00" },
        { dayOfWeek: "THURSDAY", fromTime: "08:00", toTime: "12:00" },
        { dayOfWeek: "THURSDAY", fromTime: "14:00", toTime: "18:00" },
        { dayOfWeek: "FRIDAY", fromTime: "08:00", toTime: "12:00" },
        { dayOfWeek: "FRIDAY", fromTime: "14:00", toTime: "18:00" },
        { dayOfWeek: "SATURDAY", fromTime: "08:00", toTime: "12:00" },
        { dayOfWeek: "SATURDAY", fromTime: "14:00", toTime: "18:00" },
        { dayOfWeek: "SUNDAY", fromTime: "08:00", toTime: "12:00" },
        { dayOfWeek: "SUNDAY", fromTime: "14:00", toTime: "18:00" },
      ];

      const mockSubjects: TutorSubject[] = [
        { id: 1, name: "Toán học", fees: 200000 },
        { id: 2, name: "Vật lý", fees: 180000 },
        { id: 3, name: "Hóa học", fees: 190000 },
        { id: 4, name: "Tiếng Anh", fees: 250000 },
      ];

      setTutorSchedules(mockSchedules);
      setTutorSubjects(mockSubjects);
    } finally {
      setLoading(false);
    }
  };

  const checkTrialEligibility = async () => {
    if (!selectedTutor) return;

    try {
      // TODO: Lấy studentId từ context/auth
      // Tạm thời sử dụng mock data
      const studentId = 1; // Mock student ID
      const canTake = await tutorScheduleService.checkTrialEligibility(
        studentId,
        selectedTutor.id
      );
      setCanTakeTrial(canTake);
    } catch (error) {
      console.error("Error checking trial eligibility:", error);
      setCanTakeTrial(true); // Fallback to true
    }
  };

  const getDayOfWeek = (dateString: string): string => {
    const date = new Date(dateString);
    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    return days[date.getDay()];
  };

  const generateTimeSlots = (
    schedules: TutorSchedule[],
    dayOfWeek: string
  ): string[] => {
    const daySchedules = schedules.filter(
      (schedule) => schedule.dayOfWeek === dayOfWeek
    );
    const timeSlots: string[] = [];

    daySchedules.forEach((schedule) => {
      const start = new Date(`2000-01-01T${schedule.fromTime}`);
      const end = new Date(`2000-01-01T${schedule.toTime}`);

      // Generate 1-hour slots
      let current = new Date(start);
      while (current < end) {
        const next = new Date(current.getTime() + 60 * 60 * 1000); // Add 1 hour
        if (next <= end) {
          const timeSlot = `${current.toTimeString().slice(0, 5)} - ${next
            .toTimeString()
            .slice(0, 5)}`;
          timeSlots.push(timeSlot);
        }
        current = next;
      }
    });

    return timeSlots;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({ ...prev, date: selectedDate, timeSlot: "" }));

    if (selectedDate) {
      const dayOfWeek = getDayOfWeek(selectedDate);
      const timeSlots = generateTimeSlots(tutorSchedules, dayOfWeek);
      setAvailableTimeSlots(timeSlots);
    } else {
      setAvailableTimeSlots([]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "totalSessions" ||
        name === "sessionsPerWeek" ||
        name === "contractDuration"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const getSelectedSubjectFee = (): number => {
    const subject = tutorSubjects.find(
      (s) => s.id.toString() === formData.subjectId
    );
    return subject ? subject.fees : 0;
  };

  const calculateTrialFee = (): number => {
    const originalFee = getSelectedSubjectFee();
    return originalFee * 0.5; // 50% giá gốc
  };

  const calculatePackageFee = (): number => {
    const originalFee = getSelectedSubjectFee();
    const totalSessions = formData.totalSessions;
    const discountSessions = Math.floor(totalSessions / 12); // Mỗi 12 buổi được giảm 1 buổi
    const totalFee = originalFee * totalSessions;
    const discountAmount = originalFee * 0.5 * discountSessions; // 50% mỗi buổi được giảm
    return totalFee - discountAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const [fromTime, toTime] = formData.timeSlot.split(" - ");

      const bookingData: BookingRequestCreateDTO = {
        bookingType: formData.bookingMode === "trial" ? "TRIAL" : "PACKAGE",
        tutorId: selectedTutor?.id || 0,
        subjectId: parseInt(formData.subjectId),
        date: formData.date,
        fromTime: fromTime,
        toTime: toTime,
        note: formData.learningGoals,
        sessionsPerWeek: formData.sessionsPerWeek,
        contractDuration: formData.contractDuration,
        totalAmount:
          formData.bookingMode === "trial"
            ? calculateTrialFee()
            : calculatePackageFee(),
      };

      await bookingService.createBooking(bookingData);
      navigate("/my-sessions");
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy thông tin gia sư
          </h1>
          <button
            onClick={() => navigate("/find-tutor")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại tìm gia sư
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Đặt lịch theo gói
            </h1>
            <p className="text-gray-600 mt-1">
              Với {selectedTutor.firstName} {selectedTutor.lastName}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Chọn loại đặt lịch */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chọn loại đặt lịch:
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Học thử */}
                <div
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    formData.bookingMode === "trial"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  } ${!canTakeTrial ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() =>
                    canTakeTrial &&
                    setFormData((prev) => ({ ...prev, bookingMode: "trial" }))
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        formData.bookingMode === "trial"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.bookingMode === "trial" && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Học thử</h3>
                      <p className="text-sm text-gray-600">
                        {canTakeTrial
                          ? "Chỉ trả 50% phí học"
                          : "Đã học thử với gia sư này"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Đăng ký gói */}
                <div
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    formData.bookingMode === "package"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, bookingMode: "package" }))
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        formData.bookingMode === "package"
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.bookingMode === "package" && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Đăng ký gói
                      </h3>
                      <p className="text-sm text-gray-600">
                        Ưu đãi giảm giá theo số buổi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thời gian học mong muốn */}
            {formData.bookingMode && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Thời gian học mong muốn:
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Chọn ngày */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn ngày
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleDateChange}
                        min={minDate}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Chọn khung giờ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn khung giờ
                    </label>
                    <div className="relative">
                      <select
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleInputChange}
                        disabled={
                          !formData.date || availableTimeSlots.length === 0
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">
                          {!formData.date
                            ? "Chọn ngày trước"
                            : availableTimeSlots.length === 0
                            ? "Không có khung giờ trống"
                            : "Chọn khung giờ"}
                        </option>
                        {availableTimeSlots.map((slot, index) => (
                          <option key={index} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Môn học */}
            {formData.bookingMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Môn học
                </label>
                <div className="relative">
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Chọn môn học</option>
                    {tutorSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Hiển thị phí môn học */}
                {formData.subjectId && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Phí học gốc:</span>{" "}
                      {getSelectedSubjectFee().toLocaleString("vi-VN")} VNĐ/buổi
                    </p>
                    {formData.bookingMode === "trial" && (
                      <p className="text-sm text-green-800 mt-1">
                        <span className="font-medium">Phí học thử:</span>{" "}
                        {calculateTrialFee().toLocaleString("vi-VN")} VNĐ/buổi
                        (50% giá gốc)
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Package specific fields */}
            {formData.bookingMode === "package" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Thông tin gói học:
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tổng số buổi
                    </label>
                    <select
                      name="totalSessions"
                      value={formData.totalSessions}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={12}>12 buổi</option>
                      <option value={24}>24 buổi</option>
                      <option value={36}>36 buổi</option>
                      <option value={48}>48 buổi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số buổi/tuần
                    </label>
                    <select
                      name="sessionsPerWeek"
                      value={formData.sessionsPerWeek}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1 buổi/tuần</option>
                      <option value={2}>2 buổi/tuần</option>
                      <option value={3}>3 buổi/tuần</option>
                      <option value={4}>4 buổi/tuần</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian hợp đồng
                    </label>
                    <select
                      name="contractDuration"
                      value={formData.contractDuration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={3}>3 tháng</option>
                      <option value={6}>6 tháng</option>
                      <option value={12}>12 tháng</option>
                    </select>
                  </div>
                </div>

                {/* Hiển thị tính toán phí */}
                {formData.subjectId && formData.totalSessions > 0 && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">
                      Tính toán phí:
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Tổng số buổi:</span>{" "}
                        {formData.totalSessions} buổi
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Phí gốc:</span>{" "}
                        {getSelectedSubjectFee().toLocaleString("vi-VN")}{" "}
                        VNĐ/buổi
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Tổng phí gốc:</span>{" "}
                        {(
                          getSelectedSubjectFee() * formData.totalSessions
                        ).toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </p>
                      <p className="text-green-700">
                        <span className="font-medium">Số buổi được giảm:</span>{" "}
                        {Math.floor(formData.totalSessions / 12)} buổi (mỗi 12
                        buổi giảm 1 buổi)
                      </p>
                      <p className="text-green-700">
                        <span className="font-medium">Số tiền giảm:</span>{" "}
                        {(
                          getSelectedSubjectFee() *
                          0.5 *
                          Math.floor(formData.totalSessions / 12)
                        ).toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </p>
                      <p className="text-lg font-bold text-green-800">
                        <span className="font-medium">Tổng phí sau giảm:</span>{" "}
                        {calculatePackageFee().toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mục tiêu, mong muốn học tập */}
            {formData.bookingMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mục tiêu, mong muốn học tập:
                </label>
                <textarea
                  name="learningGoals"
                  value={formData.learningGoals}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Mô tả mục tiêu học tập và những gì bạn mong muốn đạt được..."
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/find-tutor")}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.bookingMode ||
                  !formData.date ||
                  !formData.timeSlot ||
                  !formData.subjectId
                }
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? "Đang đặt lịch..."
                  : formData.bookingMode === "trial"
                  ? "Đặt học thử"
                  : "Đăng ký gói học"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PackageBooking;
