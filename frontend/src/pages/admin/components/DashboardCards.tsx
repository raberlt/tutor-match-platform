import React from "react";

export const DashboardCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {["Người dùng", "Gia sư", "Đơn đặt", "Doanh thu"].map((title, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-lg shadow border border-gray-100"
        >
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">—</p>
        </div>
      ))}
    </div>
  );
};
