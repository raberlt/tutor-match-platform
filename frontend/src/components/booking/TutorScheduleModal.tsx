import React from "react";

interface TutorSchedule {
  id: number;
  dayOfWeek: string;
  fromTime: string;
  toTime: string;
  enable: boolean;
}

interface DayGroup {
  dayOfWeek: string;
  vietnameseDay: string;
  schedules: TutorSchedule[];
}

interface TutorScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDays: DayGroup[];
}

const TutorScheduleModal: React.FC<TutorScheduleModalProps> = ({
  isOpen,
  onClose,
  availableDays,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Đóng"
        >
          ✕
        </button>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Lịch dạy của gia sư
        </h3>
        {availableDays.length === 0 ? (
          <div className="text-sm text-gray-600">Chưa có lịch dạy.</div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-auto pr-1">
            {availableDays.map((dayGroup) => (
              <div
                key={dayGroup.dayOfWeek}
                className="flex items-center space-x-2"
              >
                <span className="inline-block bg-sky-100 text-sky-800 px-3 py-1 rounded text-sm font-medium min-w-[80px]">
                  {dayGroup.vietnameseDay}
                </span>
                <span className="text-sm text-sky-800">
                  {dayGroup.schedules.map((schedule, index) => {
                    const fromTime = schedule.fromTime.substring(0, 5);
                    const toTime = schedule.toTime.substring(0, 5);
                    return (
                      <span key={index}>
                        {fromTime} - {toTime}
                        {index < dayGroup.schedules.length - 1 && " & "}
                      </span>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorScheduleModal;
