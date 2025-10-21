import React from "react";

type Education = {
  schoolName: string;
  degree: string;
  major: string;
  fromTime: number;
  toTime: number;
  degreeFileName: string;
  degreeFileUrl: string;
};

interface Props {
  educations: Education[];
  setEducations: (next: Education[]) => void;
  noEducation: boolean;
  setNoEducation: (value: boolean) => void;
  errors: Record<string, string>;
}

export const Step4Education: React.FC<Props> = ({
  educations,
  setEducations,
  noEducation,
  setNoEducation,
  errors,
}) => {
  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#f0f8ff", border: "1px solid #94cce6" }}
      >
        <h4
          className="font-semibold mb-2 flex items-center"
          style={{ color: "#94cce6" }}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Nhận "Tích xanh" cho Bằng cấp của bạn (có thể thêm sau)
        </h4>
        <p className="text-sm text-blue-700">
          Đăng tải bản chụp/scan Bằng Đại học/Cao đẳng để tăng độ tin cậy.
          JPG/PNG, tối đa 4MB.
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="no-education"
          checked={noEducation}
          onChange={(e) => setNoEducation(e.target.checked)}
          className="h-4 w-4 focus:ring-[#94cce6] border-gray-300 rounded"
        />
        <label
          htmlFor="no-education"
          className="ml-2 block text-sm text-gray-900"
        >
          Tôi không có bằng cấp
        </label>
      </div>

      {!noEducation && (
        <div className="space-y-6">
          {errors.educations && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.educations}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {educations.map((education, index) => (
              <div
                key={index}
                className="rounded-xl p-6 hover:bg-gray-50 transition-colors duration-200"
                style={{ backgroundColor: "oklch(0.97 0.01 0)" }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-semibold text-gray-800">
                    Bằng cấp #{index + 1}
                  </h5>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trường *
                    </label>
                    <input
                      type="text"
                      value={education.schoolName}
                      onChange={(e) => {
                        const next = [...educations];
                        next[index].schoolName = e.target.value;
                        setEducations(next);
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                      placeholder="Ví dụ: ĐH Bách Khoa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bậc học *
                    </label>
                    <input
                      type="text"
                      value={education.degree}
                      onChange={(e) => {
                        const next = [...educations];
                        next[index].degree = e.target.value;
                        setEducations(next);
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                      placeholder="Cử nhân, Thạc sĩ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chuyên ngành *
                    </label>
                    <input
                      type="text"
                      value={education.major}
                      onChange={(e) => {
                        const next = [...educations];
                        next[index].major = e.target.value;
                        setEducations(next);
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                      placeholder="Ví dụ: Sư phạm Toán"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Từ năm
                      </label>
                      <input
                        type="number"
                        value={education.fromTime}
                        onChange={(e) => {
                          const next = [...educations];
                          next[index].fromTime = Number(e.target.value);
                          setEducations(next);
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                        placeholder="2018"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Đến năm
                      </label>
                      <input
                        type="number"
                        value={education.toTime}
                        onChange={(e) => {
                          const next = [...educations];
                          next[index].toTime = Number(e.target.value);
                          setEducations(next);
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                        placeholder="2022"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setEducations([
                ...educations,
                {
                  schoolName: "",
                  degree: "",
                  major: "",
                  fromTime: 0,
                  toTime: 0,
                  degreeFileName: "",
                  degreeFileUrl: "",
                },
              ])
            }
            className="flex items-center justify-center w-full px-6 py-3 border-2 border-dashed rounded-xl transition-colors duration-200 font-medium"
            style={{ borderColor: "#94cce6", color: "#94cce6" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#94cce6";
              e.currentTarget.style.backgroundColor = "#f0f8ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#94cce6";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm bằng cấp khác
          </button>
        </div>
      )}
    </div>
  );
};

export default Step4Education;


