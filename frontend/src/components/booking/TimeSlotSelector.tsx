import React from "react";

interface TimeSlotSelectorProps {
  timeSlots: string[];
  selectedTimeSlot: string;
  onTimeSlotChange: (timeSlot: string) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  timeSlots,
  selectedTimeSlot,
  onTimeSlotChange,
  disabled = false,
  required = false,
  label = "Chọn khung giờ",
  placeholder = "-- Chọn khung giờ --",
  className = "",
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name="timeSlot"
        value={selectedTimeSlot}
        onChange={(e) => onTimeSlotChange(e.target.value)}
        required={required}
        className={`w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300 ${
          timeSlots.length === 0 ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
        disabled={disabled || timeSlots.length === 0}
      >
        <option value="">
          {timeSlots.length === 0
            ? "-- Vui lòng chọn ngày trước --"
            : placeholder}
        </option>
        {timeSlots.map((timeSlot, idx) => (
          <option key={`${timeSlot}-${idx}`} value={timeSlot}>
            {timeSlot}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSlotSelector;
