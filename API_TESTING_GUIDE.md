# API Testing Guide

## Backend Setup

### 1. Khởi động Backend

```bash
cd backend
./mvnw spring-boot:run
```

### 2. Kiểm tra API hoạt động

```bash
curl http://localhost:8080/api/files/upload/avatar
```

## Frontend Setup

### 1. Khởi động Frontend

```bash
cd frontend
npm run dev
```

### 2. Test Upload Functionality

1. Vào `http://localhost:5173/become-tutor`
2. Đăng nhập với tài khoản hợp lệ
3. Chuyển đến Step 2 (Ảnh đại diện & CV)
4. Upload ảnh đại diện và CV
5. Kiểm tra console để xem response

## Test Cases

### 1. Upload Avatar

- **Valid**: JPG, PNG files < 4MB
- **Invalid**: Files > 4MB, non-image files
- **Expected**: URL trả về từ Cloudinary

### 2. Upload CV

- **Valid**: PDF, DOC, DOCX files < 10MB
- **Invalid**: Files > 10MB, non-document files
- **Expected**: URL trả về từ Cloudinary

### 3. Save Draft

- **Test**: Điền một số thông tin và bấm "Lưu nháp"
- **Expected**: Thông báo "Đã lưu nháp thành công!"

### 4. Submit Application

- **Test**: Điền đầy đủ thông tin và bấm "Gửi đăng ký"
- **Expected**: Thông báo "Đơn đăng ký đã được gửi thành công!"

## Debugging

### 1. Check Network Tab

- Mở Developer Tools → Network
- Xem các request đến `/api/files/upload/*`
- Kiểm tra response status và data

### 2. Check Console

- Xem console.log messages
- Kiểm tra error messages

### 3. Check Backend Logs

- Xem console output của Spring Boot
- Kiểm tra error logs

## Common Issues

### 1. CORS Error

- **Symptom**: "Access to fetch at 'http://localhost:8080' from origin 'http://localhost:5173' has been blocked by CORS policy"
- **Solution**: Đã thêm `@CrossOrigin(origins = "http://localhost:5173")` vào controller

### 2. 401 Unauthorized

- **Symptom**: "401 Unauthorized" khi upload file
- **Solution**: Đảm bảo đã đăng nhập và có JWT token

### 3. 500 Internal Server Error

- **Symptom**: "500 Internal Server Error" khi upload
- **Solution**: Kiểm tra Cloudinary credentials trong `.env`

### 4. File Upload Fails

- **Symptom**: File không upload được
- **Solution**: Kiểm tra file size và type validation

## Environment Variables

### Backend (.env)

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8080
```

## API Endpoints

### File Upload

- `POST /api/files/upload/avatar` - Upload ảnh đại diện
- `POST /api/files/upload/cv` - Upload CV
- `POST /api/files/upload/certificate` - Upload chứng chỉ
- `POST /api/files/upload/degree` - Upload bằng cấp

### Tutor Registration

- `POST /api/tutor/draft` - Lưu nháp
- `POST /api/tutor/submit` - Gửi hồ sơ
- `GET /api/tutor/profile` - Lấy hồ sơ
- `PUT /api/tutor/profile` - Cập nhật hồ sơ
- `GET /api/tutor/status` - Lấy trạng thái
- `POST /api/tutor/cancel` - Hủy hồ sơ
