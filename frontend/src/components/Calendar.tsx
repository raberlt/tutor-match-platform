import React, { useState } from "react";

interface DayBlock {
  from?: string; // HH:mm
  to?: string; // HH:mm
  status: "AVAILABLE" | "BUSY" | "OFF" | "SELECTED";
}

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  availableDays: string[]; // Danh sách các ngày trong tuần có lịch (MONDAY, TUESDAY, etc.)
  disabled?: boolean;
  // Tùy chọn: trả về các block thời gian cho mỗi ngày để hiển thị màu trạng thái
  getDayBlocks?: (date: Date) => DayBlock[];
  // Hiển thị lịch inline (không cần dropdown)
  renderInline?: boolean;
  // Chế độ chỉ xem (không chọn ngày)
  readOnly?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  availableDays,
  disabled = false,
  getDayBlocks,
  renderInline = false,
  readOnly = false,
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

    const days = [] as Array<{
      date: Date;
      day: number;
      isCurrentMonth: boolean;
      isAvailable: boolean;
      isValid: boolean;
      isSelected: boolean;
      isToday: boolean;
      canSelect: boolean;
      blocks?: DayBlock[];
    }>;

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

      // Lấy blocks trước để quyết định canSelect theo slot
      const blocks = getDayBlocks ? getDayBlocks(date) : [];
      const hasSelectableSlot = blocks.some((b) => b.status === "AVAILABLE");

      const canSelect =
        !readOnly &&
        isCurrentMonth &&
        isAvailable &&
        isValid &&
        hasSelectableSlot;

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isAvailable,
        isValid,
        isSelected,
        isToday,
        canSelect,
        blocks,
      });
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    if (readOnly) return; // chỉ xem
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

  const renderBlockRow = (b: DayBlock, i: number) => {
    if (b.status === "OFF") return null; // không render OFF trong ô ngày
    const color =
      b.status === "BUSY"
        ? "bg-red-50 text-red-700 border border-red-200"
        : b.status === "AVAILABLE"
        ? "bg-green-50 text-green-700 border border-green-200"
        : b.status === "SELECTED"
        ? "bg-blue-50 text-blue-700 border border-blue-200"
        : "bg-gray-50 text-gray-600 border border-gray-200";
    const label = b.from && b.to ? `${b.from}-${b.to}` : "";
    return (
      <div
        key={i}
        className={`px-1 rounded text-[10px] leading-4 truncate ${color}`}
      >
        {label}
      </div>
    );
  };

  const calendarBody = (
    <>
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
              text-left py-2 px-1 text-sm rounded-md transition-colors min-h-[64px]
              ${
                !day.isCurrentMonth
                  ? "text-gray-300 cursor-not-allowed"
                  : !day.canSelect
                  ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                  : day.isSelected
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200 cursor-pointer"
                  : day.isToday
                  ? "bg-blue-50/60 text-blue-700 cursor-pointer"
                  : "text-gray-700 hover:bg-gray-50 cursor-pointer"
              }
            `}
          >
            <div className="font-medium mb-0.5">{day.day}</div>
            {Array.isArray((day as any).blocks) &&
              (day as any).blocks.length > 0 && (
                <div className="space-y-0.5">
                  {((day as any).blocks as DayBlock[])
                    .filter((b) => b.status !== "OFF")
                    .slice(0, 3)
                    .map((b, i) => renderBlockRow(b, i))}
                  {((day as any).blocks as DayBlock[]).filter(
                    (b) => b.status !== "OFF"
                  ).length > 3 && (
                    <div className="text-[10px] text-gray-500">
                      +
                      {((day as any).blocks as DayBlock[]).filter(
                        (b) => b.status !== "OFF"
                      ).length - 3}{" "}
                      nữa
                    </div>
                  )}
                </div>
              )}
          </button>
        ))}
      </div>
      {/* Footer legend */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>
              <span>Ngày đã chọn</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 rounded-full mr-1"></div>
              <span>Hôm nay</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Trống</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>Đã kín</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (renderInline) {
    return <div className="bg-white">{calendarBody}</div>;
  }

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
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4 min-w-[320px]">
            {calendarBody}
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
