# Cloudinary Setup Guide

## Backend Setup

### 1. Thêm Cloudinary Dependencies

Đã thêm vào `backend/pom.xml`:

```xml
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-http44</artifactId>
    <version>1.41.0</version>
</dependency>
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-core</artifactId>
    <version>1.41.0</version>
</dependency>
```

### 2. Tạo file .env

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:sqlserver://localhost:1433;databaseName=tutormatch;encrypt=true;trustServerCertificate=true
SPRING_DATASOURCE_USERNAME=sa
SPRING_DATASOURCE_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Lấy Cloudinary Credentials

1. Đăng ký tài khoản tại [cloudinary.com](https://cloudinary.com)
2. Vào Dashboard → Settings → Security
3. Copy các thông tin:
   - Cloud Name
   - API Key
   - API Secret

### 4. Cấu trúc thư mục Cloudinary

Files sẽ được upload vào các thư mục:

- `tutormatch/avatars/` - Ảnh đại diện
- `tutormatch/cvs/` - File CV
- `tutormatch/certificates/` - Chứng chỉ
- `tutormatch/degrees/` - Bằng cấp

## Frontend Setup

### 1. Tạo file .env

Tạo file `.env` trong thư mục `frontend/` với nội dung:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080

# Cloudinary Configuration (Optional - for direct uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UNSIGNED_PRESET=your_unsigned_preset
```

## API Endpoints

### File Upload APIs

- `POST /api/files/upload/avatar` - Upload ảnh đại diện
- `POST /api/files/upload/cv` - Upload CV
- `POST /api/files/upload/certificate` - Upload chứng chỉ
- `POST /api/files/upload/degree` - Upload bằng cấp

### Tutor Registration APIs

- `POST /api/tutor/draft` - Lưu nháp hồ sơ
- `POST /api/tutor/submit` - Gửi hồ sơ để duyệt
- `GET /api/tutor/profile` - Lấy hồ sơ hiện tại
- `PUT /api/tutor/profile` - Cập nhật hồ sơ
- `GET /api/tutor/status` - Lấy trạng thái hồ sơ
- `POST /api/tutor/cancel` - Hủy hồ sơ

## Cách sử dụng

### 1. Khởi động Backend

```bash
cd backend
./mvnw spring-boot:run
```

### 2. Khởi động Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Upload

1. Vào trang "Trở thành gia sư"
2. Chọn ảnh đại diện hoặc CV
3. File sẽ được upload lên Cloudinary và trả về URL
4. URL sẽ được lưu vào formData để gửi lên server

## Lưu ý

- File ảnh sẽ được resize về 500x500px với crop face
- File CV được upload dạng raw (không xử lý)
- Tất cả file đều có validation về type và size
- Cần có JWT token để upload file
