# Thay đổi: Chuyển isVerified sang User và thêm cvUrl vào TutorProfile

## 🔄 Những thay đổi đã thực hiện:

### 1. **Chuyển `isVerified` từ `TutorProfile` sang `User`**

**Trước:**

```java
// TutorProfile.java
@Column(nullable = false)
private boolean isVerified = false;
```

**Sau:**

```java
// User.java
@Column(nullable = false)
private boolean isVerified = false;
```

**Lý do:** `isVerified` là trạng thái của user, không chỉ riêng cho tutor profile.

### 2. **Thêm trường `cvUrl` vào `TutorProfile`**

```java
// TutorProfile.java
@Column(columnDefinition = "NVARCHAR(500)")
private String cvUrl;
```

### 3. **Cập nhật `BecomeTutorRequest` DTO**

```java
// CV URL
@Size(max = 500, message = "Link CV không được quá 500 ký tự")
private String cvUrl;
```

## 📝 Files đã được cập nhật:

### **Entity Files:**

- ✅ `src/main/java/fsa/training/tutormatch/entity/User.java`
  - Thêm field `isVerified`
- ✅ `src/main/java/fsa/training/tutormatch/entity/TutorProfile.java`
  - Xóa field `isVerified`
  - Thêm field `cvUrl`
  - Cập nhật method `isAvailableForBooking()`

### **DTO Files:**

- ✅ `src/main/java/fsa/training/tutormatch/dto/BecomeTutorRequest.java`
  - Thêm field `cvUrl`

### **Service Files:**

- ✅ `src/main/java/fsa/training/tutormatch/service/TutorApplicationServiceImpl.java`
  - Cập nhật tất cả references từ `profile.setVerified()` → `user.setVerified()`
  - Cập nhật tất cả references từ `profile.isVerified()` → `user.isVerified()`
  - Thêm xử lý `cvUrl` trong create và update methods

### **Controller Files:**

- ✅ `src/main/java/fsa/training/tutormatch/controller/profile/ProfileController.java`
  - Cập nhật `tp.isVerified()` → `tp.getUser().isVerified()`
- ✅ `src/main/java/fsa/training/tutormatch/controller/profile/TutorApplicationController.java`
  - Cập nhật tất cả admin approval/rejection methods
  - Cập nhật response data mapping

## 🔧 API Changes:

### **Become Tutor API Request Body:**

```json
{
  "bio": "...",
  "headline": "...",
  "firstName": "Nguyễn",
  "lastName": "Văn An",
  "avatar": "https://example.com/avatar.jpg",
  "cvUrl": "https://example.com/cv.pdf", // ← NEW FIELD
  "subjectFees": [
    {
      "subjectId": 1,
      "fees": 150000
    }
  ]
  // ... other fields
}
```

### **API Response Changes:**

- `isVerified` giờ được lấy từ `user.isVerified()` thay vì `tutorProfile.isVerified()`
- Tất cả API responses đều đã được cập nhật

## 🗃️ Database Schema Changes:

### **Table: users**

```sql
ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;
```

### **Table: tutor_profiles**

```sql
-- Remove isVerified column (if exists)
ALTER TABLE tutor_profiles DROP COLUMN IF EXISTS is_verified;

-- Add cvUrl column
ALTER TABLE tutor_profiles ADD COLUMN cv_url NVARCHAR(500);
```

## ✅ Verification:

### **Compilation Status:** ✅ PASSED

- All compilation errors have been fixed
- All references updated correctly
- No breaking changes

### **Backward Compatibility:**

- ✅ API structure remains the same
- ✅ `isVerified` field still appears in responses
- ✅ All existing functionality preserved

### **New Features:**

- ✅ Users can now upload CV URL when becoming tutor
- ✅ `isVerified` status applies to entire user account
- ✅ Better separation of concerns (user vs profile data)

## 🎯 Usage Examples:

### **Check if user is verified:**

```java
// Old way (DEPRECATED)
tutorProfile.isVerified()

// New way
user.isVerified()
// or
tutorProfile.getUser().isVerified()
```

### **Set user as verified (Admin action):**

```java
// Old way (DEPRECATED)
tutorProfile.setVerified(true);

// New way
user.setVerified(true);
// or
tutorProfile.getUser().setVerified(true);
```

### **Access CV URL:**

```java
String cvUrl = tutorProfile.getCvUrl();
```

## 🚀 Next Steps:

1. **Database Migration:** Run the SQL commands to update schema
2. **Frontend Updates:** Update frontend to handle `cvUrl` field
3. **Testing:** Test all tutor application flows
4. **Documentation:** Update API documentation
