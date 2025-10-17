import React from "react";

export const SecondaryStatsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {["Tỷ lệ duyệt", "Báo cáo", "Chuyển đổi"].map((title, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-lg shadow border border-gray-100"
        >
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">—</p>
        </div>
      ))}
    </div>
  );
};
