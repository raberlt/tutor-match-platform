import React, { useState } from "react";
import ImageUpload from "../components/ImageUpload";

const CloudinaryDemo: React.FC = () => {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const handleUploadSuccess = (url: string) => {
    setUploadedUrls((prev) => [...prev, url]);
    setError("");
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearAll = () => {
    setUploadedUrls([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Cloudinary Upload Demo
          </h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Upload Ảnh Đơn
            </h2>
            <ImageUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              folder="tutor-match/single"
              className="mb-4"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Upload Nhiều Ảnh
            </h2>
            <ImageUpload
              multiple={true}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              folder="tutor-match/multiple"
              className="mb-4"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Lỗi:</strong> {error}
            </div>
          )}

          {uploadedUrls.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Ảnh Đã Upload ({uploadedUrls.length})
                </h2>
                <button
                  onClick={clearAll}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                >
                  Xóa Tất Cả
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedUrls.map((url, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-sm text-gray-600 truncate">
                        URL: {url}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(url);
                          alert("URL đã được copy vào clipboard!");
                        }}
                        className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Hướng dẫn cấu hình Cloudinary:
            </h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1">
              <li>
                Đăng ký tài khoản tại{" "}
                <a
                  href="https://cloudinary.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  cloudinary.com
                </a>
              </li>
              <li>Vào Dashboard và lấy Cloud Name, API Key, API Secret</li>
              <li>Tạo Upload Preset (Settings → Upload → Add upload preset)</li>
              <li>Đặt Signing Mode = "Unsigned"</li>
              <li>Cập nhật file .env với thông tin của bạn</li>
              <li>Restart development server</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryDemo;
