import React from "react";
import { TutorApproval } from "./TutorApproval";
import { useI18n } from "../../contexts/I18nContext";

export const AdminProfileManagement: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}

        {/* Content */}
        <TutorApproval />
      </div>
    </div>
  );
};
