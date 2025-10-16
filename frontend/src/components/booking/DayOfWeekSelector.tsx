import React from "react";

interface DayOfWeekSelectorProps {
  availableDays: string[];
  selectedDay: string;
  onDayChange: (day: string, checked: boolean) => void;
  disabled?: boolean;
}

const DayOfWeekSelector: React.FC<DayOfWeekSelectorProps> = ({
  availableDays,
  selectedDay,
  onDayChange,
  disabled = false,
}) => {
  const dayLabels = {
    MONDAY: "T2",
    TUESDAY: "T3",
    WEDNESDAY: "T4",
    THURSDAY: "T5",
    FRIDAY: "T6",
    SATURDAY: "T7",
    SUNDAY: "CN",
  };

  const dayNames = {
    MONDAY: "Thứ 2",
    TUESDAY: "Thứ 3",
    WEDNESDAY: "Thứ 4",
    THURSDAY: "Thứ 5",
    FRIDAY: "Thứ 6",
    SATURDAY: "Thứ 7",
    SUNDAY: "Chủ nhật",
  };

  return (
    <div>
      
      <div className="grid grid-cols-7 gap-2">
        {Object.keys(dayLabels).map((day) => {
          const isAvailable = availableDays.includes(day);
          const isSelected = selectedDay === day;

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
                onChange={(e) => onDayChange(day, e.target.checked)}
                disabled={!isAvailable || disabled}
                className="sr-only"
              />
              <div>
                <div className="font-medium">
                  {dayLabels[day as keyof typeof dayLabels]}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Chỉ có thể chọn 1 ngày trong tuần. Sau khi chọn xong, bấm "Lưu" để thêm
        vào danh sách.
      </p>
    </div>
  );
};

export default DayOfWeekSelector;
