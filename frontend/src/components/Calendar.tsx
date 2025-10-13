import React, { useState } from "react";

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  availableDays: string[]; // Danh sách các ngày trong tuần có lịch (MONDAY, TUESDAY, etc.)
  disabled?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  availableDays,
  disabled = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

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

  // Kiểm tra xem ngày có nằm trong lịch dạy của gia sư không
  const isDateInTutorSchedule = (date: Date) => {
    const dayOfWeek = date
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toUpperCase();

    return availableDays.includes(dayOfWeek);
  };

  // Kiểm tra xem ngày có hợp lệ không (từ ngày mai trở đi)
  const isDateValid = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  // Lấy tên tháng bằng tiếng Việt
  const getVietnameseMonth = (date: Date) => {
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    return months[date.getMonth()];
  };

  // Chuyển tháng trước
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  // Chuyển tháng sau
  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  // Tạo lịch cho tháng hiện tại
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Ngày đầu tiên của tháng
    const firstDay = new Date(year, month, 1);
    // Ngày đầu tiên của tuần (có thể là tháng trước)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];

    // Tạo 42 ngày (6 tuần)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isAvailable = isDateInTutorSchedule(date);
      const isValid = isDateValid(date);
      // Sử dụng local timezone để so sánh ngày đã chọn
      const year = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, "0");
      const dayStr = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${monthStr}-${dayStr}`;
      const isSelected = selectedDate === dateString;
      const isToday = date.toDateString() === new Date().toDateString();

      const canSelect = isCurrentMonth && isAvailable && isValid;

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isAvailable,
        isValid,
        isSelected,
        isToday,
        canSelect,
      });
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    if (isDateInTutorSchedule(date) && isDateValid(date)) {
      // Sử dụng local timezone để tránh lỗi timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      onDateSelect(dateString);
      setIsOpen(false);
    }
  };

  const formatSelectedDate = (dateString: string) => {
    if (!dateString) return "Chọn ngày học";

    // Parse date string thành local date để tránh timezone issues
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed

    const dayOfWeek = getVietnameseDayOfWeek(
      date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()
    );

    return `${dayOfWeek}, ${day}/${month}/${year}`;
  };

  const days = generateCalendarDays();

  return (
    <div className="relative">
      {/* Date Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white hover:border-gray-400"
        }`}
      >
        <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
          {formatSelectedDate(selectedDate)}
        </span>
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-5 h-5 text-gray-400"
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
        </span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar */}
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4 min-w-[320px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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

              <h3 className="text-lg font-semibold text-gray-900">
                {getVietnameseMonth(currentMonth)} {currentMonth.getFullYear()}
              </h3>

              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day.date)}
                  disabled={!day.canSelect}
                  className={`
                    text-center py-2 text-sm rounded-md transition-colors
                    ${
                      !day.isCurrentMonth
                        ? "text-gray-300 cursor-not-allowed"
                        : !day.canSelect
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : day.isSelected
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : day.isToday
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  {day.day}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>
                    <span>Đã chọn</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 rounded-full mr-1"></div>
                    <span>Hôm nay</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
