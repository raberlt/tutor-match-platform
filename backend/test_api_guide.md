# 🧪 TutorMatch API Testing Guide

## 📋 Prerequisites

### 1. Khởi động ứng dụng với SQL Server Database

```bash
# Đảm bảo SQL Server đang chạy và database TutorMatching đã được tạo
mvn spring-boot:run
```

### 2. Các Tools cần thiết

- **Postman** hoặc **Insomnia** hoặc **curl**
- **SQL Server Management Studio** hoặc tool tương tự để kiểm tra database

### 3. Base URL

```
http://localhost:8080
```

---

## 🔄 Test Flow Recommended

### Phase 1: 🔓 Public APIs (Không cần auth)

### Phase 2: 🔐 Authentication Tests

### Phase 3: 👨‍🎓 Student APIs (Cần JWT)

### Phase 4: 👑 Admin APIs (Cần JWT admin)

### Phase 5: 🧪 Role-based Access Tests

---

## 📝 Phase 1: Public APIs Testing

### ✅ Test 1.1: Health Check

```bash
curl -X GET http://localhost:8080/api/test/public
```

**Expected Response:**

```json
{
  "message": "This is a public endpoint - no authentication required",
  "timestamp": "1672531200000"
}
```

### ✅ Test 1.2: System Info

```bash
curl -X GET http://localhost:8080/api/public/info
```

**Expected Response:**

```json
{
  "applicationName": "TutorMatch",
  "version": "1.0.0",
  "totalTutors": 0,
  "features": ["Tutor Search", "Booking System", "Payment Integration"]
}
```

### ✅ Test 1.3: Guest Tutor Search (Sẽ empty vì chưa có data)

```bash
curl -X GET "http://localhost:8080/api/public/tutors?page=0&size=10"
```

**Expected Response:**

```json
{
  "tutors": [],
  "currentPage": 0,
  "totalPages": 0,
  "totalElements": 0,
  "pageSize": 10
}
```

---

## 🔐 Phase 2: Authentication Testing

### ✅ Test 2.1: Register Student Account

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "password123",
    "firstName": "Nguyen",
    "lastName": "Van A",
    "email": "student1@test.com",
    "phoneNumber": "0123456789",
    "role": "STUDENT"
  }'
```

**Expected Response:**

```json
{
  "message": "Đăng ký thành công!",
  "userId": 1,
  "username": "student1",
  "role": "STUDENT"
}
```

### ✅ Test 2.2: Register Tutor Account

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tutor1",
    "password": "password123",
    "firstName": "Tran",
    "lastName": "Thi B",
    "email": "tutor1@test.com",
    "phoneNumber": "0987654321",
    "role": "TUTOR"
  }'
```

### ✅ Test 2.3: Register Admin Account

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "password123",
    "firstName": "Le",
    "lastName": "Van C",
    "email": "admin1@test.com",
    "phoneNumber": "0111222333",
    "role": "ADMIN"
  }'
```

### ✅ Test 2.4: Login Student

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "password123"
  }'
```

**Expected Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "student1",
  "role": "ROLE_STUDENT",
  "expiresIn": 86400,
  "userId": 1,
  "profileComplete": false
}
```

**🔥 SAVE THIS TOKEN** - Sẽ dùng cho các test sau!

### ✅ Test 2.5: Login Tutor

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tutor1",
    "password": "password123"
  }'
```

### ✅ Test 2.6: Login Admin

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "password123"
  }'
```

---

## 👨‍🎓 Phase 3: Student APIs Testing

**⚠️ Cần JWT Token từ student login**

```bash
# Set your student token
STUDENT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### ✅ Test 3.1: Protected Endpoint Test

```bash
curl -X GET http://localhost:8080/api/test/protected \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### ✅ Test 3.2: Student-Only Endpoint

```bash
curl -X GET http://localhost:8080/api/test/student-only \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### ✅ Test 3.3: Student Tutor Search (Full Details)

```bash
curl -X GET "http://localhost:8080/api/tutors?page=0&size=10" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### ✅ Test 3.4: Get Tutor Detail

```bash
curl -X GET http://localhost:8080/api/tutors/2 \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

---

## 👑 Phase 4: Admin APIs Testing

**⚠️ Cần JWT Token từ admin login**

```bash
# Set your admin token
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### ✅ Test 4.1: Admin Dashboard Overview

```bash
curl -X GET http://localhost:8080/api/admin/dashboard/overview \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### ✅ Test 4.2: Admin System Health

```bash
curl -X GET http://localhost:8080/api/admin/dashboard/system-health \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### ✅ Test 4.3: Admin Bookings List

```bash
curl -X GET "http://localhost:8080/api/admin/bookings?page=0&size=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### ✅ Test 4.4: Admin Payments List

```bash
curl -X GET "http://localhost:8080/api/admin/payments?page=0&size=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### ✅ Test 4.5: Admin Create Coupon

```bash
curl -X POST http://localhost:8080/api/admin/coupons \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "name": "Welcome Discount",
    "description": "10% discount for new users",
    "discountType": "PERCENTAGE",
    "discountValue": 10.0,
    "minimumAmount": 100000,
    "usageLimit": 100,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "ACTIVE",
    "applicableBookingType": "ALL"
  }'
```

---

## 🧪 Phase 5: Access Control Testing

### ✅ Test 5.1: Student trying Admin endpoint (Should FAIL)

```bash
curl -X GET http://localhost:8080/api/admin/dashboard/overview \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Expected:** `403 Forbidden`

### ✅ Test 5.2: No token accessing protected endpoint (Should FAIL)

```bash
curl -X GET http://localhost:8080/api/test/protected
```

**Expected:** `401 Unauthorized`

### ✅ Test 5.3: Invalid token (Should FAIL)

```bash
curl -X GET http://localhost:8080/api/test/protected \
  -H "Authorization: Bearer invalid_token"
```

**Expected:** `401 Unauthorized`

### ✅ Test 5.4: Admin accessing Student endpoint (Should WORK)

```bash
curl -X GET "http://localhost:8080/api/tutors?page=0&size=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** Should work (Admin has access to all)

---

## 🎯 Test Results Validation

### ✅ Success Criteria:

- [ ] All public endpoints work without authentication
- [ ] Registration creates users successfully
- [ ] Login returns valid JWT tokens
- [ ] Student can access student endpoints with token
- [ ] Admin can access admin endpoints with token
- [ ] Role-based access control works (403 for wrong roles)
- [ ] Invalid tokens return 401
- [ ] No token returns 401 for protected endpoints

## 🐛 Debugging Tips:

```bash
# Check SQL Server connection
# Use SQL Server Management Studio to connect to localhost:1433
# Username: sa
# Password: Linene1@

# Check application logs
tail -f logs/application.log

# Validate JWT token online
# Copy token to: https://jwt.io
```

---

## 📊 Expected Database State After Tests:

```sql
-- Users table should have:
SELECT * FROM users;
-- Expected: 3 users (student1, tutor1, admin1)

-- Profiles table should have:
SELECT * FROM profiles;
-- Expected: 3 profiles with different profile_types

-- Other tables will be empty initially
-- Use SQL Server Management Studio to verify
```

---

## 🚨 Common Issues & Solutions:

### Issue 1: "Cannot find symbol" errors

**Solution:** Run `mvn clean compile` to fix Lombok

### Issue 2: Database connection errors

**Solution:** Đảm bảo SQL Server đang chạy và database TutorMatching đã được tạo với username/password đúng

### Issue 3: 401 Unauthorized with valid token

**Solution:** Check token format: `Authorization: Bearer <token>`

### Issue 4: 500 Internal Server Error

**Solution:** Check application logs and database schema

---

## 🎉 Next Steps After Testing:

1. **Add sample data** (tutors, subjects, schedules)
2. **Test booking flow** (create, confirm, cancel)
3. **Test payment integration**
4. **Test file upload** (avatars, certificates)
5. **Performance testing** with large datasets
