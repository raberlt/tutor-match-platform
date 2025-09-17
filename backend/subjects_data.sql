-- Thêm dữ liệu môn học tiếng Việt
-- Chạy file này để có dữ liệu môn học cho việc test API

-- Xóa dữ liệu cũ nếu cần
DELETE FROM profile_subjects;
DELETE FROM subjects;

-- Thêm các môn học phổ biến
INSERT INTO subjects (name) VALUES 
('Toán học'),
('Ngữ văn'),
('Tiếng Anh'),
('Vật lý'),
('Hóa học'),
('Sinh học'),
('Lịch sử'),
('Địa lý'),
('Tin học'),
('IELTS'),
('TOEIC'),
('Tiếng Trung'),
('Tiếng Nhật'),
('Tiếng Hàn'),
('Luyện thi ĐGNL'),
('Luyện thi THPT QG'),
('Toán cao cấp'),
('Vật lý đại cương'),
('Hóa đại cương'),
('Kế toán'),
('Kinh tế học'),
('Tài chính'),
('Marketing'),
('Quản trị kinh doanh'),
('Lập trình Java'),
('Lập trình Python'),
('Lập trình C++'),
('Web Development'),
('Mobile Development'),
('Data Science');

-- Hiển thị danh sách môn học đã tạo
SELECT id, name FROM subjects ORDER BY id; 