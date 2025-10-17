import React from "react";

interface Props {
  formData: {
    imageAvatar: File | null;
    imageAvatarUrl: string;
    cvFile: File | null;
    cvFileUrl: string;
    cvFileName: string;
  };
  isUploading: boolean;
  handleOpenUploadModal: (type: "avatar" | "cv") => void;
  handleFileSelect: (file: File, type: "avatar" | "cv") => void;
}

const Step2KeepUI: React.FC<Props> = ({
  formData,
  isUploading,
  handleOpenUploadModal,
  handleFileSelect,
}) => {
  return (
    <div className="space-y-8">
      {/* Grid Layout cho 2 phần upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ảnh đại diện */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            Ảnh đại diện
          </h3>

          <div className="flex flex-col items-center space-y-6">
            {/* Avatar Display */}
            <div className="w-40 h-40 border border-gray-300 rounded-lg flex items-center justify-center bg-white">
              {formData.imageAvatar ? (
                <img
                  src={URL.createObjectURL(formData.imageAvatar)}
                  alt="Profile preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : formData.imageAvatarUrl ? (
                <img
                  src={formData.imageAvatarUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">👤</div>
                  <p className="text-sm">Chưa có ảnh</p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex flex-col items-center">
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    handleFileSelect(file, "avatar");
                  }
                }}
                className="hidden"
              />
              <button
                onClick={() => handleOpenUploadModal("avatar")}
                disabled={isUploading}
                className={`inline-flex items-center px-6 py-3 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium cursor-pointer ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{ backgroundColor: "#94cce6" }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Tải ảnh lên
              </button>
              {(formData.imageAvatar || formData.imageAvatarUrl) && (
                <div className="mt-2 text-xs text-green-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formData.imageAvatar
                    ? formData.imageAvatar.name
                    : "Ảnh đã tải lên"}
                </div>
              )}
            </div>

            {/* Requirements */}
            <div
              className="w-full p-4 rounded-lg"
              style={{ backgroundColor: "oklch(0.97 0.01 0)" }}
            >
              <h4 className="font-medium text-gray-900 mb-3">
                Yêu cầu ảnh đại diện
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Hiện rõ khuôn mặt và mắt
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Chất lượng tốt, không bị mờ
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Định dạng JPG, PNG
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Kích thước tối đa 4MB
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CV Upload */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            CV/Resume (tuỳ chọn)
          </h3>

          <div className="flex flex-col items-center space-y-6">
            <div className="w-full">
              {/* Drag & Drop */}
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="cv-file"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2"
                      />
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Nhấn để tải CV</span> hoặc
                      kéo thả
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX (tối đa 10MB)
                    </p>
                  </div>
                  <input
                    id="cv-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        handleFileSelect(file, "cv");
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => handleOpenUploadModal("cv")}
                  disabled={isUploading}
                  className={`inline-flex items-center px-6 py-3 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium cursor-pointer ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  style={{ backgroundColor: "#94cce6" }}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Tải CV
                </button>
              </div>

              {/* CV Requirements */}
              <div
                className="w-full p-4 rounded-lg"
                style={{ backgroundColor: "oklch(0.97 0.01 0)" }}
              >
                <h4 className="font-medium text-gray-900 mb-3">Yêu cầu CV</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Định dạng: PDF, DOC, DOCX
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Dung lượng tối đa: 10MB
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Nên đặt tên file rõ ràng (VD: NguyenVanA_CV.pdf)
                  </li>
                </ul>
              </div>

              {(formData.cvFile || formData.cvFileUrl) && (
                <div className="mt-3 text-sm text-gray-700">
                  {formData.cvFile
                    ? formData.cvFile.name
                    : formData.cvFileName || "CV đã tải lên"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2KeepUI;
