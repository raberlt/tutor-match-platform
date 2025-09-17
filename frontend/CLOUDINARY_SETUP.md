# Hướng dẫn cấu hình Cloudinary cho TutorMatch

## 1. Tạo tài khoản Cloudinary

1. Truy cập [https://cloudinary.com](https://cloudinary.com)
2. Đăng ký tài khoản miễn phí
3. Xác thực email

## 2. Lấy thông tin cấu hình

1. Đăng nhập vào Cloudinary Dashboard
2. Vào **Settings** → **Security**
3. Copy các thông tin sau:
   - **Cloud Name**: Tên cloud của bạn
   - **API Key**: Khóa API
   - **API Secret**: Secret key

## 3. Tạo Upload Preset

1. Vào **Settings** → **Upload**
2. Click **Add upload preset**
3. Điền thông tin:
   - **Preset name**: `tutor-match-unsigned` (hoặc tên bạn muốn)
   - **Signing Mode**: Chọn **Unsigned**
   - **Folder**: `tutor-match` (tùy chọn)
4. Click **Save**

## 4. Cấu hình file .env

1. Copy file `.env.example` thành `.env`:

   ```bash
   cp .env.example .env
   ```

2. Mở file `.env` và cập nhật thông tin:

   ```env
   # Cloudinary Configuration
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   VITE_CLOUDINARY_API_KEY=your_api_key_here
   VITE_CLOUDINARY_API_SECRET=your_api_secret_here
   VITE_CLOUDINARY_UNSIGNED_PRESET=your_unsigned_preset_here
   ```

3. Thay thế các giá trị `your_*_here` bằng thông tin thực tế từ Cloudinary Dashboard

## 5. Test cấu hình

1. Restart development server:

   ```bash
   npm run dev
   ```

2. Truy cập trang demo: `http://localhost:5173/cloudinary-demo`

3. Thử upload ảnh để kiểm tra cấu hình

## 6. Sử dụng trong code

### Upload ảnh đơn:

```typescript
import { uploadImageToCloudinary } from "../services/cloudinary";

const handleFileUpload = async (file: File) => {
  try {
    const url = await uploadImageToCloudinary(file, {
      folder: "tutor-match/avatars",
      quality: "auto",
      format: "auto",
    });
    console.log("Upload thành công:", url);
  } catch (error) {
    console.error("Upload thất bại:", error);
  }
};
```

### Upload nhiều ảnh:

```typescript
import { uploadMultipleImagesToCloudinary } from "../services/cloudinary";

const handleMultipleUpload = async (files: File[]) => {
  try {
    const urls = await uploadMultipleImagesToCloudinary(files, {
      folder: "tutor-match/gallery",
      quality: "auto",
    });
    console.log("Upload thành công:", urls);
  } catch (error) {
    console.error("Upload thất bại:", error);
  }
};
```

### Sử dụng component ImageUpload:

```tsx
import ImageUpload from "../components/ImageUpload";

<ImageUpload
  onUploadSuccess={(url) => console.log("Upload thành công:", url)}
  onUploadError={(error) => console.error("Upload thất bại:", error)}
  multiple={true}
  folder="tutor-match/documents"
/>;
```

## 7. Tùy chọn Upload

### UploadOptions interface:

```typescript
interface UploadOptions {
  folder?: string; // Thư mục lưu trữ
  publicId?: string; // ID tùy chỉnh
  transformation?: string; // Biến đổi ảnh
  quality?: string | number; // Chất lượng (auto, 80, etc.)
  format?: string; // Định dạng (auto, jpg, png, etc.)
}
```

### Ví dụ biến đổi ảnh:

```typescript
const url = await uploadImageToCloudinary(file, {
  folder: "tutor-match/thumbnails",
  transformation: "w_300,h_300,c_fill",
  quality: 80,
  format: "jpg",
});
```

## 8. Bảo mật

- **KHÔNG** commit file `.env` vào Git
- File `.env` đã được thêm vào `.gitignore`
- Chỉ sử dụng **Unsigned Upload Preset** cho frontend
- API Key và Secret chỉ dùng cho backend (xóa file)

## 9. Troubleshooting

### Lỗi "Thiếu cấu hình Cloudinary":

- Kiểm tra file `.env` có tồn tại không
- Kiểm tra tên biến môi trường có đúng không
- Restart development server

### Lỗi "Upload Cloudinary thất bại":

- Kiểm tra Cloud Name và Upload Preset
- Kiểm tra Upload Preset có được set là "Unsigned" không
- Kiểm tra kích thước file (tối đa 10MB)

### Lỗi CORS:

- Đảm bảo đã cấu hình đúng Upload Preset
- Kiểm tra domain trong Cloudinary Settings

## 10. Giới hạn miễn phí

- **Storage**: 25GB
- **Bandwidth**: 25GB/tháng
- **Transformations**: 25,000/tháng
- **Uploads**: 1,000/tháng

Để tăng giới hạn, nâng cấp lên gói trả phí.
