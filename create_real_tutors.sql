-- Tạo dữ liệu gia sư thật
-- Tạo users
INSERT INTO users (username, email, password, first_name, last_name, phone_number, role, created_at, updated_at, is_verified, address, date_of_birth, gender, timezone)
VALUES 
('nguyenvanan@gmail.com', 'nguyenvanan@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Nguyễn', 'Văn An', '0123456789', 'TUTOR', GETDATE(), GETDATE(), 1, '123 Đường ABC, Quận 1, TP.HCM', '1990-01-15', 'MALE', 'Asia/Ho_Chi_Minh'),
('tranthibinh@gmail.com', 'tranthibinh@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Trần', 'Thị Bình', '0123456790', 'TUTOR', GETDATE(), GETDATE(), 1, '456 Đường XYZ, Quận 2, TP.HCM', '1988-05-20', 'FEMALE', 'Asia/Ho_Chi_Minh'),
('levanminh@gmail.com', 'levanminh@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Lê', 'Văn Minh', '0123456791', 'TUTOR', GETDATE(), GETDATE(), 1, '789 Đường DEF, Quận 3, TP.HCM', '1992-08-10', 'MALE', 'Asia/Ho_Chi_Minh');

-- Lấy user IDs
DECLARE @user1_id INT = (SELECT id FROM users WHERE username = 'nguyenvanan@gmail.com');
DECLARE @user2_id INT = (SELECT id FROM users WHERE username = 'tranthibinh@gmail.com');
DECLARE @user3_id INT = (SELECT id FROM users WHERE username = 'levanminh@gmail.com');

-- Tạo profiles
INSERT INTO profiles (user_id, profile_status, created_at, updated_at, approved_by, approved_at, bio, headline, experience, teaching_level, video_intro, rate_point_average, total_point, cv_url, admin_note)
VALUES 
(@user1_id, 'ACTIVE', GETDATE(), GETDATE(), NULL, NULL, 'Tôi là giáo viên Toán với 5 năm kinh nghiệm, chuyên dạy cấp 2 và cấp 3. Tôi có thể giúp học sinh cải thiện điểm số và hiểu sâu về môn Toán.', 'Giáo viên Toán chuyên nghiệp - 5 năm kinh nghiệm', '5 năm kinh nghiệm dạy Toán cấp 2, cấp 3. Từng giúp nhiều học sinh đạt điểm cao trong kỳ thi.', 'HIGH_SCHOOL', 'https://example.com/video_math.mp4', 4.8, 0, 'https://example.com/cv_math.pdf', NULL),
(@user2_id, 'ACTIVE', GETDATE(), GETDATE(), NULL, NULL, 'Tôi là giáo viên Tiếng Anh với 3 năm kinh nghiệm, chuyên dạy IELTS và giao tiếp. Tôi có thể giúp học sinh cải thiện kỹ năng tiếng Anh.', 'Giáo viên Tiếng Anh chuyên nghiệp - 3 năm kinh nghiệm', '3 năm kinh nghiệm dạy Tiếng Anh, chuyên IELTS và giao tiếp. Từng giúp nhiều học sinh đạt điểm cao.', 'HIGH_SCHOOL', 'https://example.com/video_english.mp4', 4.5, 0, 'https://example.com/cv_english.pdf', NULL),
(@user3_id, 'ACTIVE', GETDATE(), GETDATE(), NULL, NULL, 'Tôi là giáo viên Vật lý với 4 năm kinh nghiệm, chuyên dạy cấp 3. Tôi có thể giúp học sinh hiểu sâu về Vật lý.', 'Giáo viên Vật lý chuyên nghiệp - 4 năm kinh nghiệm', '4 năm kinh nghiệm dạy Vật lý cấp 3. Từng giúp nhiều học sinh đạt điểm cao trong kỳ thi.', 'HIGH_SCHOOL', 'https://example.com/video_physics.mp4', 4.6, 0, 'https://example.com/cv_physics.pdf', NULL);

-- Lấy profile IDs
DECLARE @profile1_id INT = (SELECT id FROM profiles WHERE user_id = @user1_id);
DECLARE @profile2_id INT = (SELECT id FROM profiles WHERE user_id = @user2_id);
DECLARE @profile3_id INT = (SELECT id FROM profiles WHERE user_id = @user3_id);

-- Tạo profile_subjects
INSERT INTO profile_subjects (profile_id, subject_id, fees, created_at, updated_at)
VALUES 
-- Nguyễn Văn An - Toán
(@profile1_id, 2, 200000, GETDATE(), GETDATE()),
(@profile1_id, 7, 180000, GETDATE(), GETDATE()),
-- Trần Thị Bình - Tiếng Anh
(@profile2_id, 1, 250000, GETDATE(), GETDATE()),
(@profile2_id, 4, 300000, GETDATE(), GETDATE()),
-- Lê Văn Minh - Vật lý
(@profile3_id, 8, 220000, GETDATE(), GETDATE()),
(@profile3_id, 2, 200000, GETDATE(), GETDATE());
