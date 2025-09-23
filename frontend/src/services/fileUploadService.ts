const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface UploadResponse {
  success: boolean;
  url: string;
  message: string;
  error?: string;
}

export class FileUploadService {
  private static async uploadFile(
    file: File,
    endpoint: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/files/${endpoint}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      return result;
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        url: "",
        message: "",
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  static async uploadAvatar(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    return this.uploadFile(file, "upload/avatar", onProgress);
  }

  static async uploadCV(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    return this.uploadFile(file, "upload/cv", onProgress);
  }

  static async uploadCertificate(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    return this.uploadFile(file, "upload/certificate", onProgress);
  }

  static async uploadDegree(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    return this.uploadFile(file, "upload/degree", onProgress);
  }
}
