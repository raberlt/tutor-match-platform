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

const SingleBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorSchedules, setTutorSchedules] = useState<TutorSchedule[]>([]);
  const [tutorSubjects, setTutorSubjects] = useState<TutorSubject[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Get tutor info from navigation state
  const selectedTutor =
    (location.state?.selectedTutor as
      | TutorPreviewProfile
      | TutorProfile
      | null) || null;

  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
    subjectId: "",
    learningGoals: "",
  });

  // Get tomorrow's date as minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    if (selectedTutor) {
      loadTutorData();
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getSelectedSubjectFee = (): number => {
    const subject = tutorSubjects.find(
      (s) => s.id.toString() === formData.subjectId
    );
    return subject ? subject.fees : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const [fromTime, toTime] = formData.timeSlot.split(" - ");

      const bookingData: BookingRequestCreateDTO = {
        bookingType: "TRIAL",
        tutorId: selectedTutor?.id || 0,
        subjectId: parseInt(formData.subjectId),
        date: formData.date,
        fromTime: fromTime,
        toTime: toTime,
        note: formData.learningGoals,
        sessionsPerWeek: 1,
        contractDuration: 1,
      };

      await bookingService.createBooking(bookingData);
      navigate("/user/my-sessions");
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Đặt lịch học thử
            </h1>
            <p className="text-gray-600 mt-1">
              Với {selectedTutor.firstName} {selectedTutor.lastName}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Thời gian học mong muốn */}
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

            {/* Môn học */}
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
                    <span className="font-medium">Phí học:</span>{" "}
                    {getSelectedSubjectFee().toLocaleString("vi-VN")} VNĐ/buổi
                  </p>
                </div>
              )}
            </div>

            {/* Mục tiêu, mong muốn học tập */}
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
                placeholder="Mô tả mục tiêu học tập và những gì bạn mong muốn đạt được trong buổi học này..."
              />
            </div>

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
                  !formData.date ||
                  !formData.timeSlot ||
                  !formData.subjectId
                }
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Đang đặt lịch..." : "Đặt lịch học thử"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SingleBooking;
