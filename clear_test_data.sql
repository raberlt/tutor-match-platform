-- Xóa dữ liệu test
-- Xóa profile_subjects trước
DELETE FROM profile_subjects WHERE profile_id IN (
    SELECT id FROM profiles WHERE id >= 152 AND id <= 156
);

-- Xóa schedules
DELETE FROM schedules WHERE profile_id IN (
    SELECT id FROM profiles WHERE id >= 152 AND id <= 156
);

-- Xóa educations
DELETE FROM educations WHERE profile_id IN (
    SELECT id FROM profiles WHERE id >= 152 AND id <= 156
);

-- Xóa certificates
DELETE FROM certificates WHERE profile_id IN (
    SELECT id FROM profiles WHERE id >= 152 AND id <= 156
);

-- Xóa bookings
DELETE FROM bookings WHERE tutor_id IN (
    SELECT id FROM profiles WHERE id >= 152 AND id <= 156
);

-- Xóa profiles
DELETE FROM profiles WHERE id >= 152 AND id <= 156;

-- Xóa users
DELETE FROM users WHERE id >= 8 AND id <= 12;
