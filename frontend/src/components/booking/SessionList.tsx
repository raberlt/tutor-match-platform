import React from "react";

interface PackageSchedule {
  dayOfWeek: string;
  timeSlot: string;
  date?: string;
  subjectId?: number;
  subjectName?: string;
  fee?: number;
}

interface SessionListProps {
  sessions: PackageSchedule[];
  selectedSessionIdxs: number[];
  onSessionSelect: (index: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteSelected: () => void;
  showActions?: boolean;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  selectedSessionIdxs,
  onSessionSelect,
  onSelectAll,
  onDeleteSelected,
  showActions = true,
}) => {
  if (sessions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">
          Danh sách buổi học đã chọn ({sessions.length} buổi)
        </h4>
        {sessions.length < 2 && (
          <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            Cần ít nhất 2 buổi học
          </span>
        )} 
        {showActions && (
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSessionIdxs.length === sessions.length}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4"
              />
            </label>
            <button
              type="button"
              onClick={onDeleteSelected}
              disabled={selectedSessionIdxs.length === 0}
              className="inline-flex items-center p-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
              title="Xoá buổi học đã chọn"
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
        )}
      </div>
      <div className="grid gap-3">
        {sessions.map((session, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-sky-100/30 rounded-lg border border-sky-300"
          >
            <div className="flex items-center gap-3">
              {showActions && (
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={selectedSessionIdxs.includes(index)}
                  onChange={(e) => onSessionSelect(index, e.target.checked)}
                />
              )}
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {session.subjectName}
                </div>
                <div className="text-gray-500">
                  {session.date
                    ? new Date(session.date).toLocaleDateString("vi-VN")
                    : "Chưa chọn ngày"}{" "}
                  - {session.timeSlot}
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {session.fee
                ? `${session.fee.toLocaleString("vi-VN")} VNĐ`
                : "Chưa xác định"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionList;
