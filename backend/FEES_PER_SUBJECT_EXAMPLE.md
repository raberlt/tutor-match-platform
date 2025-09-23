# Ví dụ API Become Tutor với Fees theo từng môn học

## Thay đổi chính:

- **Trước đây**: Tutor có 1 `fees` chung cho tất cả môn học
- **Bây giờ**: Mỗi môn học có thể có `fees` riêng trong `subjectFees`

## Ví dụ Request Body:

```json
{
  "bio": "Tôi là giáo viên với 5 năm kinh nghiệm dạy học...",
  "headline": "Giáo viên Toán - Lý kinh nghiệm",
  "experience": "5 năm dạy học tại trường THPT và gia sư tại nhà",
  "teachingLevel": "HIGH_SCHOOL",

  "firstName": "Nguyễn",
  "lastName": "Văn An",
  "phoneNumber": "0901234567",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "timezone": "Asia/Ho_Chi_Minh",
  "avatar": "https://example.com/avatar.jpg",
  "cvUrl": "https://example.com/cv.pdf",

  "videoIntro": "https://youtube.com/video123",

  "subjectFees": [
    {
      "subjectId": 1,
      "fees": 150000
    },
    {
      "subjectId": 2,
      "fees": 200000
    },
    {
      "subjectId": 3,
      "fees": 180000
    }
  ],

  "schedules": [
    {
      "dayOfWeek": "MONDAY",
      "fromTime": "19:00",
      "toTime": "20:30",
      "enable": true
    },
    {
      "dayOfWeek": "WEDNESDAY",
      "fromTime": "19:00",
      "toTime": "20:30",
      "enable": true
    }
  ],

  "educations": [
    {
      "schoolName": "Đại học Bách Khoa TP.HCM",
      "degree": "Cử nhân",
      "major": "Kỹ thuật phần mềm",
      "fromTime": 2008,
      "toTime": 2012,
      "degreeImage": "https://example.com/degree.jpg"
    }
  ],

  "certificates": [
    {
      "name": "Chứng chỉ Giảng viên",
      "issuedBy": "Bộ Giáo dục và Đào tạo",
      "description": "Chứng chỉ hành nghề giảng viên",
      "certImage": "https://example.com/cert.jpg"
    }
  ]
}
```

## Giải thích `subjectFees`:

- **subjectId**: 1 = Toán, 2 = Lý, 3 = Hóa (tùy theo dữ liệu trong bảng subjects)
- **fees**: Học phí cho môn đó (VND/buổi)

## Ví dụ kết quả:

- Môn Toán: 150,000 VND/buổi
- Môn Lý: 200,000 VND/buổi
- Môn Hóa: 180,000 VND/buổi

## Backward Compatibility:

- Method `getFees()` của `TutorProfile` sẽ trả về học phí thấp nhất
- Method `getMaxFees()` sẽ trả về học phí cao nhất
- Method `getAverageFees()` sẽ trả về học phí trung bình

## Database Changes:

- Table `profile_subjects` có thêm column `fees` (INTEGER NOT NULL DEFAULT 0)
- Table `tutor_profiles` xóa column `fees`
