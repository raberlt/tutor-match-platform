# Tutor Match Platform - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan Hệ Thống

Tutor Match Platform là một hệ thống kết nối gia sư và học sinh, hỗ trợ đặt lịch học, thanh toán và nhắn tin trực tiếp.

## 🚀 Tính Năng Chính

### 1. Hệ Thống Tín Dụng (Credit System)

- **Mô tả**: Học sinh có thể sử dụng tín dụng trong tài khoản để thanh toán các buổi học
- **Cách sử dụng**:
  - Kiểm tra số dư tín dụng trong trang "Buổi Học Của Tôi"
  - Chọn phương thức thanh toán "Tín dụng" khi đặt lịch
  - Hệ thống sẽ tự động trừ tín dụng khi thanh toán thành công

### 2. Thanh Toán QR SePay

- **Mô tả**: Thanh toán qua QR code sử dụng ứng dụng ngân hàng
- **Cách sử dụng**:
  - Chọn phương thức thanh toán "QR Code SePay"
  - Quét QR code bằng ứng dụng ngân hàng
  - Xác nhận thanh toán trong ứng dụng
  - Hệ thống sẽ tự động cập nhật trạng thái thanh toán

### 3. Đặt Lịch Học Thông Minh

- **Mô tả**: Hệ thống hiển thị lịch rảnh của gia sư và ngăn chặn đặt lịch vào ngày không có sẵn
- **Tính năng**:
  - Calendar hiển thị ngày có sẵn của gia sư
  - Ngày không có sẵn sẽ bị làm mờ và không thể chọn
  - Chỉ cho phép đặt lịch từ ngày mai trở đi
  - Hiển thị khung giờ học bằng tiếng Việt

### 4. Hệ Thống Nhắn Tin

- **Mô tả**: Gia sư và học sinh có thể nhắn tin trực tiếp
- **Tính năng**:
  - Danh sách cuộc trò chuyện
  - Gửi/nhận tin nhắn real-time
  - Đánh dấu tin nhắn đã đọc
  - Hiển thị số tin nhắn chưa đọc

## 👥 Hướng Dẫn Cho Từng Vai Trò

### 🎓 Học Sinh (STUDENT)

#### Đặt Lịch Học

1. **Tìm gia sư**: Vào trang "Tìm Gia Sư" và sử dụng bộ lọc
2. **Chọn gia sư**: Click vào gia sư phù hợp
3. **Đặt lịch**:
   - Chọn môn học
   - Chọn ngày học (chỉ hiển thị ngày có sẵn)
   - Chọn khung giờ
   - Chọn phương thức thanh toán
   - Nhập ghi chú (tùy chọn)
4. **Thanh toán**:
   - Nếu chọn tín dụng: Thanh toán ngay lập tức
   - Nếu chọn QR: Quét QR code để thanh toán

#### Quản Lý Buổi Học

- **Xem danh sách**: Trang "Buổi Học Của Tôi"
- **Lọc theo trạng thái**: Pending, Confirmed, Completed, Cancelled
- **Xem chi tiết**: Click vào từng buổi học
- **Hủy buổi học**: Chỉ có thể hủy khi trạng thái là Pending

#### Nhắn Tin Với Gia Sư

1. Vào trang "Tin Nhắn"
2. Chọn cuộc trò chuyện với gia sư
3. Gửi tin nhắn trực tiếp

### 👨‍🏫 Gia Sư (TUTOR)

#### Quản Lý Lịch Dạy

1. **Cập nhật lịch**: Vào trang "Lịch Dạy"
2. **Thêm khung giờ**: Chọn ngày và thời gian
3. **Bật/tắt lịch**: Sử dụng toggle để bật/tắt từng khung giờ

#### Quản Lý Buổi Học

- **Xem danh sách**: Trang "Buổi Học Của Tôi"
- **Chấp nhận/từ chối**: Với các buổi học mới
- **Cập nhật trạng thái**: Khi buổi học hoàn thành

#### Nhắn Tin Với Học Sinh

- Tương tự như học sinh, có thể nhắn tin với học sinh đã đặt lịch

### 👨‍💼 Quản Trị Viên (ADMIN)

#### Quản Lý Người Dùng

- **Xem danh sách**: Trang "Quản Lý Người Dùng"
- **Phê duyệt gia sư**: Xem và phê duyệt hồ sơ gia sư
- **Quản lý tài khoản**: Kích hoạt/vô hiệu hóa tài khoản

#### Quản Lý Hệ Thống

- **Thống kê tổng quan**: Dashboard với các số liệu quan trọng
- **Quản lý tin nhắn**: Xem tất cả tin nhắn trong hệ thống
- **Quản lý thanh toán**: Theo dõi các giao dịch

## 🔧 Cài Đặt Và Chạy Dự Án

### Backend (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

### Database

- Sử dụng SQL Server
- Chạy script migration trong `backend/src/main/resources/sql/`

## 📱 API Endpoints Chính

### Authentication

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất

### Booking

- `POST /api/booking/student/create` - Tạo booking
- `GET /api/booking/student/my-bookings` - Lấy danh sách booking
- `GET /api/booking/student/credit-balance` - Lấy số dư tín dụng

### Payment

- `POST /api/payments/{paymentId}/credit` - Thanh toán bằng tín dụng
- `POST /api/payments/{paymentId}/sepay-qr` - Tạo QR code SePay
- `GET /api/payments/{paymentId}/status` - Kiểm tra trạng thái thanh toán

### Messages

- `GET /api/messages/conversations` - Lấy danh sách cuộc trò chuyện
- `GET /api/messages/between/{userId}` - Lấy tin nhắn giữa 2 người
- `POST /api/messages` - Gửi tin nhắn

## 🐛 Xử Lý Lỗi Thường Gặp

### Frontend

1. **Lỗi module not found**: Chạy `npm install` để cài đặt dependencies
2. **Lỗi TypeScript**: Kiểm tra types và interfaces
3. **Lỗi build**: Kiểm tra syntax và imports

### Backend

1. **Lỗi compilation**: Kiểm tra imports và dependencies
2. **Lỗi database**: Kiểm tra connection string và migration scripts
3. **Lỗi authentication**: Kiểm tra JWT configuration

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra logs trong console
2. Xem lại hướng dẫn này
3. Liên hệ team phát triển

## 🔄 Cập Nhật Gần Đây

### Version 2.0

- ✅ Thêm hệ thống tín dụng
- ✅ Tích hợp SePay QR payment
- ✅ Cải thiện UI/UX đặt lịch
- ✅ Hệ thống nhắn tin real-time
- ✅ Multi-language support (VI/EN)
- ✅ Responsive design

---

**Tutor Match Platform** - Kết nối tri thức, phát triển tương lai 🚀

