import React from "react";
import { TutorApproval } from "./TutorApproval";

export const AdminProfileManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hồ sơ</h1>
          <p className="mt-2 text-gray-600">
            Duyệt và quản lý hồ sơ đăng ký gia sư
          </p>
        </div>

        {/* Content */}
        <TutorApproval />
      </div>
    </div>
  );
};
