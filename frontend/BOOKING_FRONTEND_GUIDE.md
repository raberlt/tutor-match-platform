# 🎯 **HƯỚNG DẪN FRONTEND BOOKING SYSTEM**

## 📋 **TỔNG QUAN**

Frontend booking system đã được phát triển hoàn chỉnh với các tính năng:

- ✅ **3 loại booking**: Học thử, Học buổi đơn, Học theo gói
- ✅ **Phân quyền rõ ràng**: Student, Tutor, Admin
- ✅ **API integration** với backend Spring Boot
- ✅ **Responsive design** với Tailwind CSS
- ✅ **TypeScript** cho type safety

## 🚀 **CÁCH SỬ DỤNG**

### **1. Khởi động Frontend**

```bash
cd tutor-match-fe
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5174`

### **2. Khởi động Backend**

```bash
cd tutormatch
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

## 📱 **CÁC TRANG CHÍNH**

### **🎓 Student (Học sinh)**

- **`/my-sessions`** - Xem danh sách booking của mình
- **`/create-booking`** - Tạo booking mới
- **`/booking-detail/:id`** - Xem chi tiết booking

### **👨‍🏫 Tutor (Giảng viên)**

- **`/tutor/bookings`** - Quản lý booking của học sinh
- **`/tutor/schedule`** - Lịch dạy
- **`/tutor/students`** - Quản lý học sinh

### **👨‍💼 Admin (Quản trị)**

- **`/admin/bookings`** - Quản lý tất cả booking
- **`/admin/users`** - Quản lý người dùng
- **`/admin/tutors`** - Phê duyệt gia sư

### **🔧 Demo & Test**

- **`/booking-demo`** - Test các API booking

## 🎯 **LUỒNG BOOKING**

### **1. Học thử (TRIAL)**

```
Student tạo booking → Thanh toán → Auto chấp nhận → Confirmed
```

### **2. Học buổi đơn (SINGLE_SESSION)**

```
Student tạo booking → Thanh toán → Auto chấp nhận → Confirmed
```

### **3. Học theo gói (PACKAGE)**

```
Student tạo booking → Tutor chấp nhận → Student thanh toán → Confirmed
```

## 🔌 **API ENDPOINTS**

### **Public APIs**

- `GET /api/booking/info` - Thông tin hệ thống
- `GET /api/booking/types` - Danh sách loại booking
- `GET /api/booking/statuses` - Danh sách trạng thái

### **Student APIs**

- `POST /api/booking/create` - Tạo booking
- `GET /api/booking/student/my-bookings` - Lấy booking của mình
- `GET /api/booking/student/{id}` - Chi tiết booking
- `PUT /api/booking/student/{id}/cancel` - Hủy booking

### **Tutor APIs**

- `GET /api/booking/tutor/my-bookings` - Lấy booking của tutor
- `PUT /api/booking/tutor/{id}/approve` - Chấp nhận booking (PACKAGE)
- `PUT /api/booking/tutor/{id}/reject` - Từ chối booking (PACKAGE)

### **Admin APIs**

- `GET /api/booking/admin/all` - Lấy tất cả booking
- `GET /api/booking/admin/{id}` - Chi tiết booking
- `PUT /api/booking/admin/{id}/status` - Cập nhật trạng thái
- `DELETE /api/booking/admin/{id}` - Xóa booking

## 🎨 **COMPONENTS CHÍNH**

### **1. CreateBooking.tsx**

- Form tạo booking mới
- Hỗ trợ 3 loại booking
- Validation dữ liệu
- Hiển thị thông tin hệ thống

### **2. MySessions.tsx**

- Danh sách booking của student
- Phân trang và lọc theo trạng thái
- Thống kê booking
- Hủy booking

### **3. BookingDetail.tsx**

- Chi tiết booking
- Thông tin giảng viên
- Thông tin thanh toán
- Hợp đồng (cho gói PACKAGE)

### **4. TutorBookings.tsx**

- Quản lý booking cho tutor
- Chấp nhận/từ chối booking PACKAGE
- Thống kê booking

### **5. AdminBookings.tsx**

- Quản lý tất cả booking
- Cập nhật trạng thái
- Xóa booking
- Thống kê tổng quan

## 🔧 **CẤU HÌNH**

### **1. API Base URL**

```typescript
// src/services/api.ts
const API_BASE_URL = "http://localhost:8080";
```

### **2. CORS Configuration**

Backend đã cấu hình CORS cho:

- `http://localhost:5174` (Vite dev server)
- `http://localhost:3000` (React dev server)

### **3. Authentication**

- Sử dụng JWT token
- Token được lưu trong localStorage
- Auto refresh token

## 🎯 **TÍNH NĂNG NỔI BẬT**

### **1. Responsive Design**

- Mobile-first approach
- Tailwind CSS
- Dark mode support

### **2. Type Safety**

- TypeScript
- Strict type checking
- Interface definitions

### **3. Error Handling**

- Try-catch blocks
- User-friendly error messages
- Loading states

### **4. State Management**

- React hooks
- Context API
- Local state

## 🚀 **DEPLOYMENT**

### **1. Build Production**

```bash
npm run build
```

### **2. Preview Production**

```bash
npm run preview
```

### **3. Deploy to Vercel**

```bash
npm install -g vercel
vercel --prod
```

## 🐛 **TROUBLESHOOTING**

### **1. CORS Error**

- Kiểm tra backend CORS config
- Đảm bảo frontend URL được whitelist

### **2. 401 Unauthorized**

- Kiểm tra JWT token
- Đăng nhập lại

### **3. 403 Forbidden**

- Kiểm tra role permissions
- Đảm bảo user có quyền truy cập

### **4. 404 Not Found**

- Kiểm tra API endpoint
- Đảm bảo backend đang chạy

## 📚 **TÀI LIỆU THAM KHẢO**

- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/)
- [Spring Boot](https://spring.io/projects/spring-boot)

## 🤝 **ĐÓNG GÓP**

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📞 **HỖ TRỢ**

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ:

- Email: support@tutormatch.com
- GitHub: [TutorMatch Repository](https://github.com/tutormatch)

---

**🎉 Chúc bạn sử dụng thành công!**
