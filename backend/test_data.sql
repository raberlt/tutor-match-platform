-- Test data cho TutorMatch application
USE TutorMatching;
GO

-- 1. Tạo test users (password: test123 đã được encode bằng BCrypt)
-- BCrypt hash cho "test123": $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFVMLVZqpNPNQRl.o/ITELO
IF NOT EXISTS (SELECT * FROM users WHERE username = 'test_student')
BEGIN
    INSERT INTO users (username, password, first_name, last_name, email, phone_number, address, role, enabled, phone)
    VALUES ('test_student', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFVMLVZqpNPNQRl.o/ITELO', 'Test', 'Student', 'student@test.com', '0123456789', 'Ha Noi', 'STUDENT', 1, '0123456789');
    PRINT 'Created test student user';
END

IF NOT EXISTS (SELECT * FROM users WHERE username = 'test_tutor')
BEGIN
    INSERT INTO users (username, password, first_name, last_name, email, phone_number, address, role, enabled, phone)
    VALUES ('test_tutor', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFVMLVZqpNPNQRl.o/ITELO', 'Test', 'Tutor', 'tutor@test.com', '0987654321', 'Ho Chi Minh', 'TUTOR', 1, '0987654321');
    PRINT 'Created test tutor user';
END

IF NOT EXISTS (SELECT * FROM users WHERE username = 'test_admin')
BEGIN
    INSERT INTO users (username, password, first_name, last_name, email, phone_number, address, role, enabled, phone)
    VALUES ('test_admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFVMLVZqpNPNQRl.o/ITELO', 'Test', 'Admin', 'admin@test.com', '0111222333', 'Da Nang', 'ADMIN', 1, '0111222333');
    PRINT 'Created test admin user';
END

-- 2. Tạo subjects test
IF NOT EXISTS (SELECT * FROM subjects WHERE name = 'Mathematics')
BEGIN
    INSERT INTO subjects (name) VALUES ('Mathematics');
    PRINT 'Created Mathematics subject';
END

IF NOT EXISTS (SELECT * FROM subjects WHERE name = 'English')
BEGIN
    INSERT INTO subjects (name) VALUES ('English');
    PRINT 'Created English subject';
END

IF NOT EXISTS (SELECT * FROM subjects WHERE name = 'Physics')
BEGIN
    INSERT INTO subjects (name) VALUES ('Physics');
    PRINT 'Created Physics subject';
END

-- 3. Tạo profile cho tutor
DECLARE @tutorId INT = (SELECT id FROM users WHERE username = 'test_tutor');
IF @tutorId IS NOT NULL AND NOT EXISTS (SELECT * FROM profiles WHERE tutor_id = @tutorId)
BEGIN
    INSERT INTO profiles (tutor_id, bio, headline, description, fees, rate_point_average, total_point, city)
    VALUES (@tutorId, 'Experienced tutor with 5 years of teaching', 'Math & Physics Expert', 'I specialize in Mathematics and Physics for high school students', 500000, 4.5, 95, 'Ho Chi Minh');
    PRINT 'Created profile for test tutor';
END

-- 4. Tạo user_profiles cho tất cả users
DECLARE @studentId INT = (SELECT id FROM users WHERE username = 'test_student');
DECLARE @adminId INT = (SELECT id FROM users WHERE username = 'test_admin');

-- Student profile
IF @studentId IS NOT NULL AND NOT EXISTS (SELECT * FROM user_profiles WHERE user_id = @studentId)
BEGIN
    INSERT INTO user_profiles (user_id, date_of_birth, gender, city, state, country, education_level, bio)
    VALUES (@studentId, '2000-01-15', 'MALE', 'Ha Noi', 'Ha Noi', 'Vietnam', 'UNIVERSITY', 'University student looking for math tutoring');
    PRINT 'Created user profile for test student';
END

-- Tutor profile
IF @tutorId IS NOT NULL AND NOT EXISTS (SELECT * FROM user_profiles WHERE user_id = @tutorId)
BEGIN
    INSERT INTO user_profiles (user_id, date_of_birth, gender, city, state, country, education_level, university, major, graduation_year, bio, is_verified)
    VALUES (@tutorId, '1990-05-20', 'FEMALE', 'Ho Chi Minh', 'Ho Chi Minh', 'Vietnam', 'MASTER', 'Ho Chi Minh University of Science', 'Mathematics', 2015, 'Professional math tutor with Masters degree', 1);
    PRINT 'Created user profile for test tutor';
END

-- Admin profile  
IF @adminId IS NOT NULL AND NOT EXISTS (SELECT * FROM user_profiles WHERE user_id = @adminId)
BEGIN
    INSERT INTO user_profiles (user_id, date_of_birth, gender, city, state, country, education_level, bio, is_verified)
    VALUES (@adminId, '1985-12-10', 'MALE', 'Da Nang', 'Da Nang', 'Vietnam', 'UNIVERSITY', 'System administrator', 1);
    PRINT 'Created user profile for test admin';
END

-- 5. Tạo profile_subjects (subjects cho tutor)
DECLARE @profileId INT = (SELECT id FROM profiles WHERE tutor_id = @tutorId);
DECLARE @mathId INT = (SELECT id FROM subjects WHERE name = 'Mathematics');
DECLARE @physicsId INT = (SELECT id FROM subjects WHERE name = 'Physics');

IF @profileId IS NOT NULL AND @mathId IS NOT NULL AND NOT EXISTS (SELECT * FROM profile_subjects WHERE profile_id = @profileId AND subject_id = @mathId)
BEGIN
    INSERT INTO profile_subjects (profile_id, subject_id) VALUES (@profileId, @mathId);
    PRINT 'Added Mathematics subject to tutor profile';
END

IF @profileId IS NOT NULL AND @physicsId IS NOT NULL AND NOT EXISTS (SELECT * FROM profile_subjects WHERE profile_id = @profileId AND subject_id = @physicsId)
BEGIN
    INSERT INTO profile_subjects (profile_id, subject_id) VALUES (@profileId, @physicsId);
    PRINT 'Added Physics subject to tutor profile';
END

-- 6. Tạo schedules cho tutor
IF @profileId IS NOT NULL AND NOT EXISTS (SELECT * FROM schedules WHERE profile_id = @profileId)
BEGIN
    INSERT INTO schedules (profile_id, day_of_week, from_time, to_time, enable) VALUES 
    (@profileId, 'Monday', '09:00:00', '17:00:00', 1),
    (@profileId, 'Tuesday', '09:00:00', '17:00:00', 1),
    (@profileId, 'Wednesday', '09:00:00', '17:00:00', 1),
    (@profileId, 'Thursday', '09:00:00', '17:00:00', 1),
    (@profileId, 'Friday', '09:00:00', '17:00:00', 1),
    (@profileId, 'Saturday', '09:00:00', '15:00:00', 1);
    PRINT 'Created schedules for test tutor';
END

-- 7. Tạo một coupon test
IF NOT EXISTS (SELECT * FROM coupons WHERE code = 'WELCOME10')
BEGIN
    INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_amount, usage_limit, used_count, start_date, end_date, status, applicable_booking_type, created_by_id)
    VALUES ('WELCOME10', 'Welcome Discount', '10% discount for new students', 'PERCENTAGE', 10.00, 100000, 100, 0, '2024-01-01', '2024-12-31', 'ACTIVE', 'ALL', @adminId);
    PRINT 'Created welcome coupon';
END

PRINT 'Test data creation completed!';

-- Hiển thị thông tin login
PRINT '=== LOGIN CREDENTIALS ===';
PRINT 'Student: username=test_student, password=test123';
PRINT 'Tutor: username=test_tutor, password=test123'; 
PRINT 'Admin: username=test_admin, password=test123';
PRINT '=========================='; 