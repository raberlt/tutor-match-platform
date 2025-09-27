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

const SingleBookingNew: React.FC = () => {
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

  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
    subjectId: "",
    note: "",
  });

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

  // Lấy các ngày trong tuần mà gia sư có lịch
  const getAvailableDays = () => {
    const days = tutorSchedules
      .filter((schedule) => schedule.enable)
      .map((schedule) => schedule.dayOfWeek);
    return [...new Set(days)]; // Remove duplicates
  };

  // Lấy các khung giờ cho ngày đã chọn
  const getAvailableTimeSlotsForDay = (selectedDate: string) => {
    if (!selectedDate) return [];

    const dayOfWeek = new Date(selectedDate)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
    return tutorSchedules
      .filter((schedule) => schedule.dayOfWeek === dayOfWeek && schedule.enable)
      .map((schedule) => `${schedule.fromTime}-${schedule.toTime}`);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "date") {
      // Reset time slot when date changes
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        timeSlot: "",
      }));

      // Update available time slots
      const timeSlots = getAvailableTimeSlotsForDay(value);
      setAvailableTimeSlots(timeSlots);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTutor) {
      setError("Không tìm thấy thông tin gia sư");
      return;
    }

    if (!formData.date || !formData.timeSlot || !formData.subjectId) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [fromTime, toTime] = formData.timeSlot.split("-");

      const bookingData: BookingRequestCreateDTO = {
        tutorId: selectedTutor.id,
        subjectId: parseInt(formData.subjectId),
        date: formData.date,
        fromTime: fromTime,
        toTime: toTime,
        bookingType: "SINGLE_SESSION" as const,
        note: formData.note,
      };

      await bookingService.createBooking(bookingData);
      navigate("/my-sessions", {
        state: { message: "Đặt lịch học thành công!" },
      });
    } catch (error: unknown) {
      setError((error as Error).message || "Đặt lịch thất bại");
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
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

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Thông tin đặt lịch
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
              <p className="text-sm text-gray-500 mt-1">
                Chỉ có thể chọn các môn mà gia sư đã đăng ký dạy
              </p>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn ngày học
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={minDate}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="text-sm text-gray-500 mt-1">
                  Chỉ hiển thị các khung giờ mà gia sư có lịch dạy
                </p>
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
                      {day}
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
                disabled={
                  loading ||
                  !formData.date ||
                  !formData.timeSlot ||
                  !formData.subjectId
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Đặt lịch học"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SingleBookingNew;
