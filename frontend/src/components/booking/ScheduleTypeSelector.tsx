import React from "react";

interface ScheduleTypeSelectorProps {
  scheduleType: "fixed" | "flexible";
  onScheduleTypeChange: (type: "fixed" | "flexible") => void;
}

const ScheduleTypeSelector: React.FC<ScheduleTypeSelectorProps> = ({
  scheduleType,
  onScheduleTypeChange,
}) => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onScheduleTypeChange("fixed")}
          className={`p-4 border-2 rounded-lg text-center ${
            scheduleType === "fixed"
              ? "border-sky-400 bg-sky-100 text-sky-700"
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
          onClick={() => onScheduleTypeChange("flexible")}
          className={`p-4 border-2 rounded-lg text-center ${
            scheduleType === "flexible"
              ? "border-sky-400 bg-sky-100 text-sky-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <h3 className="font-semibold mb-2">Lịch tự do</h3>
          <p className="text-sm text-gray-600">Chọn từng buổi học cụ thể</p>
        </button>
      </div>
    </div>
  );
};

export default ScheduleTypeSelector;
