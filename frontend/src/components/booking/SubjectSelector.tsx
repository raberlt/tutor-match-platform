import React from "react";

interface TutorProfileSubject {
  id: number;
  name: string;
  fees: number;
}

interface SubjectSelectorProps {
  subjects: TutorProfileSubject[];
  selectedSubjectId: string | number;
  onSubjectChange: (subjectId: string) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  selectedSubjectId,
  onSubjectChange,
  disabled = false,
  required = false,
  label = "Chọn môn học",
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name="subjectId"
        value={selectedSubjectId}
        onChange={(e) => onSubjectChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
        disabled={disabled}
      >
        <option value="">-- Chọn môn học --</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name} - {subject.fees.toLocaleString("vi-VN")} VNĐ/buổi
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubjectSelector;
