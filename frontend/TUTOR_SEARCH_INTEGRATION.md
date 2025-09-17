# 🔍 **TÍCH HỢP API TÌM KIẾM GIA SƯ**

## 📋 **TỔNG QUAN**

Đã tích hợp thành công API backend cho việc tìm kiếm gia sư với các tính năng:

- ✅ **API tìm kiếm gia sư** cho guest và student
- ✅ **Bộ lọc nâng cao** theo môn học, giá, đánh giá, thành phố
- ✅ **Phân trang** và sắp xếp
- ✅ **Chi tiết gia sư** với thông tin đầy đủ
- ✅ **Tích hợp với booking** system

## 🔌 **API ENDPOINTS**

### **1. Public API (Không cần đăng nhập)**

```http
GET /api/public/tutors
```

**Parameters:**

- `keyword` - Từ khóa tìm kiếm
- `subjectId` - ID môn học
- `minFee` - Giá tối thiểu
- `maxFee` - Giá tối đa
- `minRating` - Đánh giá tối thiểu
- `city` - Thành phố
- `page` - Trang (default: 0)
- `size` - Kích thước trang (default: 20)
- `sortBy` - Sắp xếp theo (default: "id")
- `sortDirection` - Hướng sắp xếp (default: "asc")

**Response:**

```json
{
  "content": [
    {
      "id": 1,
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "imageAvatar": "avatar.jpg",
      "headline": "Chuyên gia IELTS",
      "fees": 200000,
      "ratePointAverage": 4.8,
      "totalPoint": 95,
      "city": "Hà Nội",
      "subjectNames": ["Tiếng Anh", "IELTS"]
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "currentPage": 0,
  "size": 10,
  "first": true,
  "last": false
}
```

### **2. Student API (Cần đăng nhập với role STUDENT)**

```http
GET /api/tutors
Authorization: Bearer <JWT_TOKEN>
```

**Response:** Tương tự public API nhưng có thêm thông tin chi tiết.

### **3. Tutor Detail API**

```http
GET /api/tutors/{id}
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "id": 1,
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "imageAvatar": "avatar.jpg",
  "bio": "Chuyên gia IELTS với 5 năm kinh nghiệm...",
  "headline": "Chuyên gia IELTS",
  "experience": "5 năm kinh nghiệm giảng dạy...",
  "teachingLevel": "Từ cơ bản đến nâng cao",
  "fees": 200000,
  "ratePointAverage": 4.8,
  "totalPoint": 95,
  "city": "Hà Nội",
  "subjects": [
    {
      "id": 1,
      "name": "Tiếng Anh"
    },
    {
      "id": 2,
      "name": "IELTS"
    }
  ],
  "schedules": [
    {
      "id": 1,
      "dayOfWeek": "MONDAY",
      "fromTime": "09:00",
      "toTime": "17:00"
    }
  ]
}
```

### **4. Subjects API**

```http
GET /api/student/become-tutor/subjects
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "success": true,
  "subjects": [
    {
      "id": 1,
      "name": "Toán học"
    },
    {
      "id": 2,
      "name": "Tiếng Anh"
    }
  ],
  "total": 2
}
```

## 📱 **FRONTEND COMPONENTS**

### **1. TutorSearch.tsx**

- **Tích hợp API**: `/api/public/tutors` (guest) và `/api/tutors` (student)
- **Bộ lọc**: Từ khóa, môn học, giá, đánh giá, thành phố
- **Phân trang**: Hỗ trợ pagination với navigation
- **Sắp xếp**: Theo giá, đánh giá, mới nhất
- **Responsive**: Mobile-first design

### **2. TutorDetail.tsx**

- **Chi tiết gia sư**: Thông tin đầy đủ cho student
- **Lịch rảnh**: Hiển thị schedule của gia sư
- **Môn học**: Danh sách môn dạy với nút đặt lịch
- **Tích hợp booking**: Link trực tiếp đến CreateBooking

### **3. tutorService.ts**

- **Service layer**: Tích hợp với backend API
- **Error handling**: Xử lý lỗi và hiển thị thông báo
- **Type safety**: TypeScript interfaces
- **Authentication**: Tự động gửi JWT token

## 🎯 **LUỒNG SỬ DỤNG**

### **1. Guest (Chưa đăng nhập)**

```
Trang chủ → Tìm gia sư → Xem danh sách (limited info) → Đăng nhập → Đặt lịch
```

### **2. Student (Đã đăng nhập)**

```
Trang chủ → Tìm gia sư → Xem chi tiết → Đặt lịch → Thanh toán
```

## 🔧 **TÍNH NĂNG NỔI BẬT**

### **1. Bộ Lọc Thông Minh**

- **Từ khóa**: Tìm theo tên gia sư hoặc môn học
- **Môn học**: Dropdown với danh sách từ database
- **Khoảng giá**: Input min/max price
- **Đánh giá**: Filter theo rating tối thiểu
- **Thành phố**: Tìm theo địa điểm

### **2. Sắp Xếp Linh Hoạt**

- **Mới nhất**: Theo thời gian tạo
- **Giá**: Từ thấp đến cao / cao đến thấp
- **Đánh giá**: Từ cao đến thấp

### **3. Phân Trang Hiệu Quả**

- **Navigation**: Đầu, trước, sau, cuối
- **Page numbers**: Hiển thị 5 trang gần nhất
- **Responsive**: Hoạt động tốt trên mobile

### **4. UI/UX Tối Ưu**

- **Loading states**: Skeleton loading
- **Error handling**: User-friendly messages
- **Responsive design**: Mobile-first
- **Accessibility**: ARIA labels

## 🔄 **LUỒNG TÍCH HỢP**

### **1. TutorSearch → TutorDetail**

```typescript
// Từ danh sách gia sư
navigate(`/tutor/${tutor.id}`);

// TutorDetail load chi tiết
tutorService.getTutorDetail(tutorId);
```

### **2. TutorSearch → CreateBooking**

```typescript
// Truyền thông tin gia sư qua state
navigate("/create-booking", {
  state: {
    selectedTutor: tutor,
    selectedSubject: selectedSubject,
  },
});
```

### **3. TutorDetail → CreateBooking**

```typescript
// Truyền thông tin gia sư và môn học cụ thể
navigate("/create-booking", {
  state: {
    selectedTutor: tutor,
    selectedSubject: subject,
  },
});
```

## 📊 **TYPE DEFINITIONS**

### **TutorSearchFilters**

```typescript
interface TutorSearchFilters {
  keyword?: string;
  subjectId?: number;
  minFee?: number;
  maxFee?: number;
  minRating?: number;
  city?: string;
}
```

### **TutorPreviewProfile** (Guest)

```typescript
interface TutorPreviewProfile {
  id: number;
  firstName: string;
  lastName: string;
  imageAvatar?: string;
  headline?: string;
  fees?: number;
  ratePointAverage?: number;
  totalPoint?: number;
  city?: string;
  subjectNames: string[];
}
```

### **TutorProfile** (Student)

```typescript
interface TutorProfile {
  id: number;
  firstName: string;
  lastName: string;
  imageAvatar?: string;
  bio?: string;
  headline?: string;
  experience?: string;
  teachingLevel?: string;
  fees?: number;
  ratePointAverage?: number;
  totalPoint?: number;
  city?: string;
  subjects: TutorSubjectDetail[];
  schedules: TutorSchedule[];
}
```

## 🚀 **DEPLOYMENT**

### **1. Development**

```bash
cd tutor-match-fe
npm run dev
```

### **2. Production Build**

```bash
npm run build
npm run preview
```

## 🐛 **TROUBLESHOOTING**

### **1. API Connection Error**

- Kiểm tra backend đang chạy tại `http://localhost:8080`
- Kiểm tra CORS configuration
- Kiểm tra JWT token

### **2. Empty Tutor List**

- Kiểm tra database có dữ liệu gia sư
- Kiểm tra API response format
- Kiểm tra bộ lọc

### **3. Permission Denied**

- Kiểm tra JWT token hợp lệ
- Kiểm tra role permissions
- Đăng nhập lại

## 📚 **NEXT STEPS**

1. **Thêm Advanced Filters**:

   - Filter theo kinh nghiệm
   - Filter theo chứng chỉ
   - Filter theo phương pháp dạy

2. **Cải thiện UI/UX**:

   - Thêm map view
   - Thêm favorite tutors
   - Thêm comparison tool

3. **Performance Optimization**:

   - Lazy loading
   - Infinite scroll
   - Caching

4. **Analytics**:
   - Track search behavior
   - Popular subjects
   - Conversion rates

---

**🎉 Tích hợp API tìm kiếm gia sư hoàn thành!**
