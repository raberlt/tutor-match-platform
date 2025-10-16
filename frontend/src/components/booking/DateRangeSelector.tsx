import React from "react";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate: string;
  disabled?: boolean;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngày bắt đầu
        </label>
        <input
          type="date"
          name="startDate"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          min={minDate}
          required
          className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngày kết thúc
        </label>
        <input
          type="date"
          name="endDate"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate || minDate}
          required
          className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;
