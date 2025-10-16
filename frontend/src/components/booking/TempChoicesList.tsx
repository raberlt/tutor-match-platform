import React from "react";

interface TempChoice {
  day: string;
  timeSlot: string;
  subject: { id: number; name: string; fees: number };
  startDate: string;
  endDate: string;
}

interface TempChoicesListProps {
  tempChoices: TempChoice[];
  selectedTempChoiceIdxs: number[];
  onTempChoiceSelect: (index: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteSelected: () => void;
}

const TempChoicesList: React.FC<TempChoicesListProps> = ({
  tempChoices,
  selectedTempChoiceIdxs,
  onTempChoiceSelect,
  onSelectAll,
  onDeleteSelected,
}) => {
  if (tempChoices.length === 0) return null;

  const getVietnameseDay = (day: string) => {
    const dayMap: { [key: string]: string } = {
      MONDAY: "Thứ 2",
      TUESDAY: "Thứ 3",
      WEDNESDAY: "Thứ 4",
      THURSDAY: "Thứ 5",
      FRIDAY: "Thứ 6",
      SATURDAY: "Thứ 7",
      SUNDAY: "Chủ nhật",
    };
    return dayMap[day] || day;
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-lg">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg flex items-center justify-between">
        <h5 className="text-sm font-medium text-gray-700">
          Lịch trong tuần đã chọn
        </h5>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedTempChoiceIdxs.length === tempChoices.length}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-4 h-4"
            />
          </label>
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={selectedTempChoiceIdxs.length === 0}
            className="inline-flex items-center p-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
            title="Xoá lựa chọn đã chọn"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {tempChoices.map((choice, idx) => (
          <div key={idx} className="px-4 py-3 flex items-center gap-4 text-sm">
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={selectedTempChoiceIdxs.includes(idx)}
                onChange={(e) => onTempChoiceSelect(idx, e.target.checked)}
              />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <div className="text-gray-500">Thứ</div>
                <div className="font-medium text-gray-900">
                  {getVietnameseDay(choice.day)}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Môn học</div>
                <div className="font-medium text-gray-900">
                  {choice.subject?.name}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Khung giờ</div>
                <div className="font-medium text-gray-900">
                  {choice.timeSlot}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Ngày bắt đầu</div>
                <div className="font-medium text-gray-900">
                  {choice.startDate
                    ? new Date(choice.startDate).toLocaleDateString("vi-VN")
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Ngày kết thúc</div>
                <div className="font-medium text-gray-900">
                  {choice.endDate
                    ? new Date(choice.endDate).toLocaleDateString("vi-VN")
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TempChoicesList;
