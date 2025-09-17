package fsa.training.tutormatch.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.sql.Date;
import java.util.List;

@Data
public class BecomeTutorRequest {
    
    // Thông tin cơ bản
    @NotBlank(message = "Bio không được để trống")
    @Size(max = 2000, message = "Bio không được quá 2000 ký tự")
    private String bio;
    
    @NotBlank(message = "Headline không được để trống")
    @Size(max = 255, message = "Headline không được quá 255 ký tự")
    private String headline;
    
    @NotBlank(message = "Kinh nghiệm không được để trống")
    @Size(max = 2000, message = "Kinh nghiệm không được quá 2000 ký tự")
    private String experience;
    
    @NotBlank(message = "Trình độ giảng dạy không được để trống")
    @Size(max = 2000, message = "Trình độ giảng dạy không được quá 2000 ký tự")
    private String teachingLevel;
    
    @NotNull(message = "Học phí không được để trống")
    @Min(value = 50000, message = "Học phí tối thiểu 50,000 VND")
    private Integer fees;
    
    // Thông tin học vấn
    @Size(max = 255, message = "Trường đại học không được quá 255 ký tự")
    private String university;
    
    @Size(max = 255, message = "Chuyên ngành không được quá 255 ký tự")
    private String major;
    
    @Size(max = 100, message = "Trình độ học vấn không được quá 100 ký tự")
    private String educationLevel;
    
    // Thông tin cá nhân bổ sung
    private Date dateOfBirth;
    
    @Pattern(regexp = "MALE|FEMALE|OTHER", message = "Giới tính phải là MALE, FEMALE hoặc OTHER")
    private String gender;
    
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải từ 10-11 chữ số")
    private String phoneNumber;
    
    @Size(max = 255, message = "Địa chỉ không được quá 255 ký tự")
    private String addressLine1;
    
    @Size(max = 100, message = "Thành phố không được quá 100 ký tự")
    private String city;
    
    // Video giới thiệu
    private String videoIntro;
    
    // Danh sách ID môn học
    @NotEmpty(message = "Phải chọn ít nhất một môn học")
    private List<Integer> subjectIds;
    
    // Lịch dạy
    @Valid
    @NotEmpty(message = "Phải có ít nhất một khung giờ dạy")
    private List<ScheduleRequest> schedules;
    
    // Danh sách bằng cấp
    @Valid
    private List<EducationRequest> educations;
    
    // Danh sách chứng chỉ
    @Valid
    private List<CertificateRequest> certificates;
    
    @Data
    public static class ScheduleRequest {
        @NotBlank(message = "Thứ không được để trống")
        @Pattern(regexp = "MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY", 
                 message = "Thứ phải là MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY hoặc SUNDAY")
        private String dayOfWeek;
        
        @NotBlank(message = "Giờ bắt đầu không được để trống")
        @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Giờ bắt đầu phải có định dạng HH:mm")
        private String fromTime;
        
        @NotBlank(message = "Giờ kết thúc không được để trống")
        @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Giờ kết thúc phải có định dạng HH:mm")
        private String toTime;
        
        private boolean enable = true;
    }

@Data
    public static class EducationRequest {
        @NotBlank(message = "Tên trường không được để trống")
        @Size(max = 100, message = "Tên trường không được quá 100 ký tự")
        private String schoolName;
    
        @NotBlank(message = "Bằng cấp không được để trống")
        @Size(max = 100, message = "Bằng cấp không được quá 100 ký tự")
        private String degree;
    
        @NotBlank(message = "Chuyên ngành không được để trống")
        @Size(max = 100, message = "Chuyên ngành không được quá 100 ký tự")
    private String major;
    
        @NotNull(message = "Năm bắt đầu không được để trống")
        @Min(value = 1900, message = "Năm bắt đầu phải từ 1900")
        @Max(value = 2030, message = "Năm bắt đầu không được quá 2030")
        private Integer fromTime;
    
        @NotNull(message = "Năm kết thúc không được để trống")
        @Min(value = 1900, message = "Năm kết thúc phải từ 1900")
        @Max(value = 2030, message = "Năm kết thúc không được quá 2030")
        private Integer toTime;
        
        private String degreeImage;
    }
    
    @Data
    public static class CertificateRequest {
        @NotBlank(message = "Tên chứng chỉ không được để trống")
        @Size(max = 255, message = "Tên chứng chỉ không được quá 255 ký tự")
        private String name;
        
        @NotBlank(message = "Đơn vị cấp không được để trống")
        @Size(max = 255, message = "Đơn vị cấp không được quá 255 ký tự")
        private String issuedBy;
        
        @Size(max = 255, message = "Mô tả không được quá 255 ký tự")
        private String description;
        
        private String certImage;
    }
} 