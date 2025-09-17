// Interface cho cấu hình upload
interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: string;
  quality?: string | number;
  format?: string;
}

// Interface cho response từ Cloudinary
interface CloudinaryResponse {
  secure_url?: string;
  url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Upload file lên Cloudinary
 * @param file - File cần upload
 * @param options - Tùy chọn upload (folder, publicId, transformation, etc.)
 * @returns Promise<string> - URL của file đã upload
 */
export async function uploadImageToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  const uploadPreset = import.meta.env
    .VITE_CLOUDINARY_UNSIGNED_PRESET as string;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Thiếu cấu hình Cloudinary: VITE_CLOUDINARY_CLOUD_NAME hoặc VITE_CLOUDINARY_UNSIGNED_PRESET"
    );
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Chỉ hỗ trợ upload file hình ảnh");
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("File quá lớn. Kích thước tối đa là 10MB");
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const form = new FormData();

  form.append("file", file);
  form.append("upload_preset", uploadPreset);

  // Thêm các tùy chọn upload
  if (options.folder) {
    form.append("folder", options.folder);
  }
  if (options.publicId) {
    form.append("public_id", options.publicId);
  }
  if (options.transformation) {
    form.append("transformation", options.transformation);
  }
  if (options.quality) {
    form.append("quality", options.quality.toString());
  }
  if (options.format) {
    form.append("format", options.format);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();

      // Nếu lỗi do unsigned preset không được whitelist → fallback qua backend signed upload
      if (
        res.status === 400 &&
        /Upload preset must be whitelisted for unsigned uploads/i.test(text)
      ) {
        return await uploadViaBackend(file, options);
      }

      throw new Error(`Upload Cloudinary thất bại: ${res.status} ${text}`);
    }

    const data = (await res.json()) as CloudinaryResponse;
    const secureUrl = data.secure_url || data.url;

    if (!secureUrl) {
      throw new Error("Không nhận được secure_url từ Cloudinary");
    }

    return secureUrl;
  } catch (error) {
    console.error("Lỗi upload Cloudinary:", error);
    // Fallback lần cuối qua backend nếu lỗi có liên quan đến preset/unsigned
    const message = error instanceof Error ? error.message : String(error);
    if (/unsigned|preset/i.test(message)) {
      return await uploadViaBackend(file, options);
    }
    throw error;
  }
}

/**
 * Upload nhiều file cùng lúc
 * @param files - Array các file cần upload
 * @param options - Tùy chọn upload
 * @returns Promise<string[]> - Array các URL của file đã upload
 */
export async function uploadMultipleImagesToCloudinary(
  files: File[],
  options: UploadOptions = {}
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadImageToCloudinary(file, options)
  );

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Lỗi upload nhiều file:", error);
    throw error;
  }
}

/**
 * Xóa file khỏi Cloudinary (cần API key và secret)
 * @param publicId - Public ID của file cần xóa
 * @returns Promise<boolean> - true nếu xóa thành công
 */
export async function deleteImageFromCloudinary(
  publicId: string
): Promise<boolean> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY as string;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET as string;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Thiếu cấu hình Cloudinary: VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_API_KEY hoặc VITE_CLOUDINARY_API_SECRET"
    );
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await generateSignature(publicId, timestamp, apiSecret);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
  const form = new FormData();

  form.append("public_id", publicId);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp.toString());
  form.append("signature", signature);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    return data.result === "ok";
  } catch (error) {
    console.error("Lỗi xóa file Cloudinary:", error);
    return false;
  }
}

/**
 * Tạo signature cho API calls
 * @param publicId - Public ID
 * @param timestamp - Timestamp
 * @param apiSecret - API Secret
 * @returns Promise<string> - Signature
 */
async function generateSignature(
  publicId: string,
  timestamp: number,
  apiSecret: string
): Promise<string> {
  const message = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Upload thông qua backend sử dụng signed upload của Cloudinary
async function uploadViaBackend(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const backendUrl = "/api/public/upload/image";
  const form = new FormData();
  form.append("file", file);
  if (options.folder) form.append("folder", options.folder);

  const res = await fetch(backendUrl, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload qua backend thất bại: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("Backend không trả về URL ảnh");
  return data.url;
}
