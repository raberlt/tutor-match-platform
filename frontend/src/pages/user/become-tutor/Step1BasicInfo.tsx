import React from "react";

type Subject = { id: number; name: string };
type SubjectInput = { name: string; hourlyRate: string };
type Province = { id: number; name: string };

interface Props {
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    province: string;
    subjects: SubjectInput[];
    confirmAge: boolean;
    acceptTerms: boolean;
  };
  errors: Record<string, string>;
  subjects: Subject[];
  filteredProvinces: Province[];
  showProvinceDropdown: boolean;
  setShowProvinceDropdown: (v: boolean) => void;
  handleInputChange: (key: string, value: any) => void;
  handleProvinceChange: (value: string) => void;
  selectProvince: (p: Province) => void;
}

export const Step1BasicInfo: React.FC<Props> = ({
  formData,
  errors,
  subjects,
  filteredProvinces,
  showProvinceDropdown,
  setShowProvinceDropdown,
  handleInputChange,
  handleProvinceChange,
  selectProvince,
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header giữ nguyên - đang comment trong file gốc */}

        <div className="p-6 space-y-6">
          {/* Thông tin cá nhân - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập tên của bạn"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập họ của bạn"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Thông tin liên hệ - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  handleInputChange("phone", value);
                }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Địa chỉ - Compact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tỉnh/Thành phố *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                onFocus={() => setShowProvinceDropdown(true)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Chọn tỉnh/thành phố"
                autoComplete="off"
              />
              {showProvinceDropdown && filteredProvinces.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredProvinces.map((province) => (
                    <div
                      key={province.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        selectProvince(province);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        selectProvince(province);
                      }}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      {province.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.province && (
              <p className="text-red-500 text-xs mt-1">{errors.province}</p>
            )}
          </div>

          {/* Môn học giảng dạy - Compact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Môn học giảng dạy *
            </label>
            <select
              onChange={(e) => {
                if (
                  e.target.value &&
                  !formData.subjects.some((sub) => sub.name === e.target.value)
                ) {
                  handleInputChange("subjects", [
                    ...formData.subjects,
                    { name: e.target.value, hourlyRate: "" },
                  ]);
                }
                (e.target as HTMLSelectElement).value = "";
              }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Chọn môn học</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>

            {/* Danh sách môn học đã chọn - Compact */}
            {formData.subjects.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {subject.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={subject.hourlyRate}
                        onChange={(e) => {
                          const newSubjects = [...formData.subjects];
                          newSubjects[index].hourlyRate = e.target.value;
                          handleInputChange("subjects", newSubjects);
                        }}
                        className="w-20 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="100k"
                        min="50000"
                      />
                      <span className="text-xs text-gray-500">đ/buổi</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newSubjects = formData.subjects.filter(
                            (_, i) => i !== index
                          );
                          handleInputChange("subjects", newSubjects);
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
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
                  </div>
                ))}
              </div>
            )}

            {errors.subjects && (
              <p className="text-red-500 text-xs mt-1">{errors.subjects}</p>
            )}
          </div>

          {/* Xác nhận - Compact */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="age-confirm"
                checked={formData.confirmAge}
                onChange={(e) =>
                  handleInputChange("confirmAge", e.target.checked)
                }
                className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded mt-0.5 ${
                  errors.confirmAge ? "border-red-500" : ""
                }`}
              />
              <label
                htmlFor="age-confirm"
                className="ml-3 block text-sm text-gray-700"
              >
                Tôi xác nhận đã đủ 18 tuổi
              </label>
            </div>
            {errors.confirmAge && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmAge}</p>
            )}

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms-confirm"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  handleInputChange("acceptTerms", e.target.checked)
                }
                className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded mt-0.5 ${
                  errors.acceptTerms ? "border-red-500" : ""
                }`}
              />
              <label
                htmlFor="terms-confirm"
                className="ml-3 block text-sm text-gray-700"
              >
                Tôi đồng ý với{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  chính sách bảo mật
                </a>{" "}
                của TutorMatch
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
