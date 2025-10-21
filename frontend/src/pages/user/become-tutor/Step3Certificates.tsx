import React from "react";

type Certificate = {
  name: string;
  description: string;
  issuedBy: string;
  file: File | null;
  imageUrl: string;
  imageFileName: string;
};

interface Props {
  certificates: Certificate[];
  setCertificates: (next: Certificate[]) => void;
  errors: Record<string, string>;
}

export const Step3Certificates: React.FC<Props> = ({
  certificates,
  setCertificates,
  errors,
}) => {
  const handleUploadCertificate = async (
    file: File,
    index: number
  ): Promise<void> => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch(
        "http://localhost:8080/api/files/upload/certificate",
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const next = [...certificates];
        next[index] = {
          ...next[index],
          file,
          imageUrl: data.url,
          imageFileName: file.name,
        };
        setCertificates(next);
      } else {
        // keep silent; parent may show toast elsewhere
      }
    } catch (_) {
      // ignore; parent may handle globally
    }
  };

  return (
    <div className="space-y-6">
      {errors.certificates && (
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
            {errors.certificates}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {certificates.map((cert, index) => (
          <div
            key={index}
            className="rounded-xl p-6 hover:bg-gray-50 transition-colors duration-200"
            style={{ backgroundColor: "oklch(0.97 0.01 0)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-semibold text-gray-800">
                Chứng chỉ #{index + 1}
              </h5>
              {(certificates.length > 1 ||
                cert.name.trim() !== "" ||
                cert.issuedBy.trim() !== "") && (
                <button
                  type="button"
                  onClick={() => {
                    setCertificates(certificates.filter((_, i) => i !== index));
                  }}
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
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên chứng chỉ *
                </label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => {
                    const next = [...certificates];
                    next[index].name = e.target.value;
                    setCertificates(next);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                  placeholder="Ví dụ: IELTS, TOEIC, Chứng chỉ sư phạm..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <input
                  type="text"
                  value={cert.description}
                  onChange={(e) => {
                    const next = [...certificates];
                    next[index].description = e.target.value;
                    setCertificates(next);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                  placeholder="Mô tả ngắn gọn về chứng chỉ"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Được cấp bởi *
                </label>
                <input
                  type="text"
                  value={cert.issuedBy}
                  onChange={(e) => {
                    const next = [...certificates];
                    next[index].issuedBy = e.target.value;
                    setCertificates(next);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                  placeholder="Tổ chức cấp chứng chỉ"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tải lên chứng chỉ
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    await handleUploadCertificate(file, index);
                  }
                }}
                className="hidden"
                id={`cert-file-${index}`}
              />
              <label
                htmlFor={`cert-file-${index}`}
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-colors duration-200"
                style={{
                  // @ts-ignore - CSS custom props for hover handled via events
                  "--hover-border": "#94cce6",
                  "--hover-bg": "#f0f8ff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#94cce6";
                  e.currentTarget.style.backgroundColor = "#f0f8ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg
                  className="w-5 h-5 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-600">
                  {cert.file
                    ? cert.file.name
                    : cert.imageUrl
                    ? cert.imageFileName || "File đã tải lên từ trước"
                    : "Chọn file hoặc kéo thả vào đây"}
                </span>
              </label>
              {(cert.file || cert.imageUrl) && (
                <div className="mt-2">
                  <p className="text-xs text-green-600 flex items-center mb-1">
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
                    {cert.file
                      ? cert.file.name
                      : cert.imageFileName || "Chứng chỉ đã tải lên"}
                  </p>
                  {cert.imageUrl && (
                    <a
                      href={cert.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Xem chứng chỉ
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setCertificates([
            ...certificates,
            {
              name: "",
              description: "",
              issuedBy: "",
              file: null,
              imageUrl: "",
              imageFileName: "",
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
        Thêm chứng chỉ khác
      </button>
    </div>
  );
};

export default Step3Certificates;


