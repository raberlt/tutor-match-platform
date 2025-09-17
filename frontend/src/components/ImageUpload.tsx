import React, { useState, useRef } from "react";
import {
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
} from "../services/cloudinary";

interface ImageUploadProps {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  folder?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  multiple = false,
  folder = "tutor-match",
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      if (multiple) {
        const fileArray = Array.from(files);
        const urls = await uploadMultipleImagesToCloudinary(fileArray, {
          folder,
          quality: "auto",
          format: "auto",
        });
        setUploadedImages((prev) => [...prev, ...urls]);
        urls.forEach((url) => onUploadSuccess?.(url));
      } else {
        const file = files[0];
        const url = await uploadImageToCloudinary(file, {
          folder,
          quality: "auto",
          format: "auto",
        });
        setUploadedImages([url]);
        onUploadSuccess?.(url);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi upload không xác định";
      onUploadError?.(errorMessage);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const fileInput = fileInputRef.current;
      if (fileInput) {
        fileInput.files = files;
        handleFileSelect({ target: fileInput } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`image-upload-container ${className}`}>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Đang upload...</p>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {multiple
                ? "Kéo thả hoặc click để chọn nhiều ảnh"
                : "Kéo thả hoặc click để chọn ảnh"}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF lên đến 10MB</p>
          </div>
        )}
      </div>

      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Ảnh đã upload:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
