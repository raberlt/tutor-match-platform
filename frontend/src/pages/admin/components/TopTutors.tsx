import React from "react";
import { useDashboard } from "../../../hooks/useDashboard";

interface TopTutor {
  id: number;
  name: string;
  subject: string;
  rating: number;
  totalBookings: number;
  revenue: number;
}

export const TopTutors: React.FC = () => {
  const { topTutors } = useDashboard();
  return (
    <div
      className="p-4 rounded-xl shadow-md"
      style={{
        backgroundColor: "white",
        borderColor: "rgba(148, 204, 230, 0.2)",
        border: "1px solid",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Gia sư nổi bật</h3>
        <a
          className="text-sm font-medium"
          style={{ color: "rgb(148, 204, 230)" }}
        >
          Xem tất cả
        </a>
      </div>
      <div className="space-y-4">
        {topTutors.map((tutor, index) => (
          <div key={tutor.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: "rgb(148, 204, 230)" }}
              >
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {tutor.name}
                </p>
                <p className="text-sm text-gray-500">{tutor.subject}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  {tutor.rating}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {tutor.totalBookings} buổi học
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
