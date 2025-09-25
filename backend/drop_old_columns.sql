-- Xóa các trường cũ trong database
ALTER TABLE certificates DROP COLUMN cert_image;
ALTER TABLE educations DROP COLUMN degree_image;
ALTER TABLE application_certificates DROP COLUMN cert_image;
ALTER TABLE application_educations DROP COLUMN degree_image;
