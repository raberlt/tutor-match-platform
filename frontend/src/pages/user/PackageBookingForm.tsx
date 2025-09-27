import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import { TutorService } from "../../services/tutorService";
import type {
  BookingRequestCreateDTO,
  TutorPreviewProfile,
  TutorProfile,
  Subject,
} from "../../types";

interface PackageSchedule {
  date: string;
  fromTime: string;
  toTime: string;
}

interface PackageInfo {
  totalDays: number;
  packageType: string;
  pricePerSession: number;
  totalPrice: number;
  discount: number;
  finalPrice: number;
}

const PackageBookingForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scheduleType, setScheduleType] = useState<"fixed" | "flexible" | null>(
    null
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<PackageSchedule[]>(
    []
  );
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);

  // Get tutor info from navigation state
  const selectedTutor =
    (location.state?.selectedTutor as
      | TutorPreviewProfile
      | TutorProfile
      | null) || null;

  // Fixed schedule form data
  const [fixedFormData, setFixedFormData] = useState({
    totalDays: 12,
    startDate: "",
    dayOfWeek: "",
    fromTime: "",
    toTime: "",
    subjectId: "",
    note: "",
  });

  // Calendar form data
  const [calendarFormData, setCalendarFormData] = useState({
    subjectId: "",
    note: "",
  });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const timeSlots = [
    "07:00-08:00",
    "08:00-09:00",
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
    "17:00-18:00",
    "18:00-19:00",
    "19:00-20:00",
    "20:00-21:00",
    "21:00-22:00",
  ];

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedTutor?.fees) {
      calculatePackageInfo();
    }
  }, [fixedFormData.totalDays, selectedSessions.length, selectedTutor?.fees]);

  const loadSubjects = async () => {
    try {
      const subjectsData = await TutorService.getSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  const calculatePackageInfo = () => {
    if (!selectedTutor?.fees) return;

    const totalDays =
      scheduleType === "fixed"
        ? fixedFormData.totalDays
        : selectedSessions.length;
    const pricePerSession = selectedTutor.fees;
    const totalPrice = totalDays * pricePerSession;

    let packageType = "";
    let discount = 0;

    if (totalDays >= 25) {
      packageType = "Gói 24+";
      discount = totalPrice * 0.15; // 15% discount
    } else if (totalDays >= 13) {
      packageType = "Gói 12+";
      discount = totalPrice * 0.1; // 10% discount
    } else if (totalDays >= 7) {
      packageType = "Gói 6+";
      discount = totalPrice * 0.05; // 5% discount
    } else {
      packageType = "Gói cơ bản";
      discount = 0;
    }

    const finalPrice = totalPrice - discount;

    setPackageInfo({
      totalDays,
      packageType,
      pricePerSession,
      totalPrice,
      discount,
      finalPrice,
    });
  };

  const handleFixedFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFixedFormData((prev) => ({
      ...prev,
      [name]: name === "totalDays" ? parseInt(value) || 0 : value,
    }));
  };

  const handleCalendarFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCalendarFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateFixedSchedule = () => {
    if (
      !fixedFormData.startDate ||
      !fixedFormData.dayOfWeek ||
      !fixedFormData.fromTime ||
      !fixedFormData.toTime
    ) {
      setError("Vui lòng điền đầy đủ thông tin lịch học cố định");
      return;
    }

    const sessions: PackageSchedule[] = [];
    const startDate = new Date(fixedFormData.startDate);
    const dayOfWeekMap: { [key: string]: number } = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0,
    };
    const targetDay = dayOfWeekMap[fixedFormData.dayOfWeek];

    let currentDate = new Date(startDate);
    let sessionCount = 0;

    while (sessionCount < fixedFormData.totalDays) {
      if (currentDate.getDay() === targetDay) {
        sessions.push({
          date: currentDate.toISOString().split("T")[0],
          fromTime: fixedFormData.fromTime,
          toTime: fixedFormData.toTime,
        });
        sessionCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setSelectedSessions(sessions);
    setShowCalendar(false);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const addSession = () => {
    if (!selectedDate || !selectedTimeSlot) {
      setError("Vui lòng chọn ngày và giờ học");
      return;
    }

    const [fromTime, toTime] = selectedTimeSlot.split("-");
    const newSession: PackageSchedule = {
      date: selectedDate,
      fromTime,
      toTime,
    };

    // Check if session already exists
    const exists = selectedSessions.some(
      (session) =>
        session.date === selectedDate && session.fromTime === fromTime
    );

    if (exists) {
      setError("Buổi học này đã được chọn");
      return;
    }

    setSelectedSessions((prev) => [...prev, newSession]);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setError(null);
  };

  const removeSession = (index: number) => {
    setSelectedSessions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (scheduleType === "fixed" && selectedSessions.length === 0) {
        setError("Vui lòng tạo lịch học cố định");
        return;
      }

      if (scheduleType === "flexible" && selectedSessions.length === 0) {
        setError("Vui lòng chọn ít nhất một buổi học");
        return;
      }

      const subjectId =
        scheduleType === "fixed"
          ? fixedFormData.subjectId
          : calendarFormData.subjectId;
      const note =
        scheduleType === "fixed" ? fixedFormData.note : calendarFormData.note;

      if (!subjectId) {
        setError("Vui lòng chọn môn học");
        return;
      }

      // Navigate to payment page with booking data
      navigate("/package-payment", {
        state: {
          tutor: selectedTutor,
          subjectId: parseInt(subjectId),
          sessions: selectedSessions,
          packageInfo,
          note,
        },
      });
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const isSelected = selectedDate === dateStr;
      const isPast = new Date(dateStr) < new Date();
      const hasSession = selectedSessions.some(
        (session) => session.date === dateStr
      );

      days.push(
        <div
          key={day}
          className={`h-10 flex items-center justify-center cursor-pointer rounded-md transition-colors ${
            isPast
              ? "text-gray-300 cursor-not-allowed"
              : isSelected
              ? "bg-blue-500 text-white"
              : hasSession
              ? "bg-green-100 text-green-800"
              : "hover:bg-gray-100"
          }`}
          onClick={() => !isPast && handleDateSelect(dateStr)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Đặt Lịch Học Theo Gói
            </h1>

            {/* Tutor Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Gia sư đã chọn
              </h3>
              <div className="flex items-center space-x-4">
                {selectedTutor.imageAvatar ? (
                  <img
                    src={selectedTutor.imageAvatar}
                    alt={`${selectedTutor.firstName || ""} ${
                      selectedTutor.lastName || ""
                    }`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {(selectedTutor.firstName || "").charAt(0)}
                      {(selectedTutor.lastName || "").charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {selectedTutor.firstName || ""}{" "}
                    {selectedTutor.lastName || ""}
                  </h4>
                  {selectedTutor.headline && (
                    <p className="text-sm text-gray-600">
                      {selectedTutor.headline}
                    </p>
                  )}
                  {selectedTutor.fees && (
                    <p className="text-sm text-blue-600 font-medium">
                      {selectedTutor.fees.toLocaleString("vi-VN")} VNĐ/buổi
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Type Selection */}
            {!scheduleType && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Chọn cách đặt lịch
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fixed Schedule */}
                  <div
                    className="border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                    onClick={() => setScheduleType("fixed")}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-blue-600"
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
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Lịch cố định hàng tuần
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Chọn ngày bắt đầu, thứ trong tuần và giờ học cố định
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>• Lịch học đều đặn</p>
                        <p>• Tự động tính ngày kết thúc</p>
                        <p>• Phù hợp học dài hạn</p>
                      </div>
                    </div>
                  </div>

                  {/* Flexible Schedule */}
                  <div
                    className="border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-green-300 hover:shadow-lg transition-all duration-200"
                    onClick={() => setScheduleType("flexible")}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Chọn lịch tự do
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Chọn từng ngày và giờ học cụ thể trên lịch
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>• Linh hoạt thời gian</p>
                        <p>• Chọn ngày cụ thể</p>
                        <p>• Phù hợp lịch bận</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back Button */}
            {scheduleType && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setScheduleType(null)}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
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
                  Quay lại chọn cách đặt lịch
                </button>
              </div>
            )}

            {/* Fixed Schedule Form */}
            {scheduleType === "fixed" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  generateFixedSchedule();
                }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Lịch học cố định hàng tuần
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số ngày học *
                    </label>
                    <input
                      type="number"
                      name="totalDays"
                      value={fixedFormData.totalDays}
                      onChange={handleFixedFormChange}
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      12+ ngày: Gói 12+ (giảm 10%), 25+ ngày: Gói 24+ (giảm 15%)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày bắt đầu *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={fixedFormData.startDate}
                      onChange={handleFixedFormChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thứ trong tuần *
                    </label>
                    <select
                      name="dayOfWeek"
                      value={fixedFormData.dayOfWeek}
                      onChange={handleFixedFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Chọn thứ</option>
                      <option value="monday">Thứ 2</option>
                      <option value="tuesday">Thứ 3</option>
                      <option value="wednesday">Thứ 4</option>
                      <option value="thursday">Thứ 5</option>
                      <option value="friday">Thứ 6</option>
                      <option value="saturday">Thứ 7</option>
                      <option value="sunday">Chủ nhật</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ học *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        name="fromTime"
                        value={fixedFormData.fromTime}
                        onChange={handleFixedFormChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="time"
                        name="toTime"
                        value={fixedFormData.toTime}
                        onChange={handleFixedFormChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Môn học *
                    </label>
                    <select
                      name="subjectId"
                      value={fixedFormData.subjectId}
                      onChange={handleFixedFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Chọn môn học</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      name="note"
                      value={fixedFormData.note}
                      onChange={handleFixedFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập ghi chú cho gói học..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Tạo lịch học
                </button>
              </form>
            )}

            {/* Flexible Schedule Form */}
            {scheduleType === "flexible" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Chọn lịch học tự do
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-md"
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <h3 className="text-lg font-semibold">
                        {currentMonth.toLocaleDateString("vi-VN", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-md"
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                        <div
                          key={day}
                          className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendar()}
                    </div>

                    {/* Time Slot Selection */}
                    {selectedDate && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Chọn giờ học cho{" "}
                          {new Date(selectedDate).toLocaleDateString("vi-VN")}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleTimeSlotSelect(slot)}
                              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                selectedTimeSlot === slot
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={addSession}
                          disabled={!selectedTimeSlot}
                          className="mt-3 w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Thêm buổi học
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Selected Sessions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Buổi học đã chọn ({selectedSessions.length})
                    </h4>

                    {selectedSessions.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        Chưa có buổi học nào được chọn
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedSessions.map((session, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(session.date).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {session.fromTime} - {session.toTime}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSession(index)}
                              className="p-1 text-red-600 hover:text-red-800"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Môn học *
                      </label>
                      <select
                        name="subjectId"
                        value={calendarFormData.subjectId}
                        onChange={handleCalendarFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Chọn môn học</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        name="note"
                        value={calendarFormData.note}
                        onChange={handleCalendarFormChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập ghi chú cho gói học..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Package Info */}
            {packageInfo && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  Thông tin gói học
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tổng số buổi:</p>
                    <p className="font-semibold text-gray-900">
                      {packageInfo.totalDays}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Loại gói:</p>
                    <p className="font-semibold text-gray-900">
                      {packageInfo.packageType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Giá gốc:</p>
                    <p className="font-semibold text-gray-900">
                      {packageInfo.totalPrice.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Giảm giá:</p>
                    <p className="font-semibold text-green-600">
                      -{packageInfo.discount.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-blue-900">
                      Tổng thanh toán:
                    </span>
                    <span className="text-xl font-bold text-blue-900">
                      {packageInfo.finalPrice.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Sessions List */}
            {selectedSessions.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Chi tiết lịch học ({selectedSessions.length} buổi)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedSessions.map((session, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border">
                      <p className="text-sm font-medium text-gray-900">
                        Buổi {index + 1}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(session.date).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.fromTime} - {session.toTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            {selectedSessions.length > 0 && (
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/find-tutor")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang xử lý..." : "Tiếp tục thanh toán"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageBookingForm;
