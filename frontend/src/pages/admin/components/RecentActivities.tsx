import React from "react";

export const RecentActivities: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Hoạt động gần đây
      </h3>
      <ul className="space-y-2 text-sm text-gray-600">
        <li>—</li>
        <li>—</li>
        <li>—</li>
      </ul>
    </div>
  );
};
