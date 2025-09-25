package fsa.training.tutormatch.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
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
    
    
    @NotEmpty(message = "Đối tượng dạy không được để trống")
    private List<String> teachingAudiences;
    
    // Học phí đã được chuyển sang SubjectFeeRequest
    
    // Thông tin học vấn - đã được chuyển vào EducationRequest
    
    // Thông tin cá nhân bổ sung
    @NotBlank(message = "Họ không được để trống")
    @Size(max = 50, message = "Họ không được quá 50 ký tự")
    private String firstName;
    
    @NotBlank(message = "Tên không được để trống")
    @Size(max = 50, message = "Tên không được quá 50 ký tự")
    private String lastName;
    
    private LocalDate dateOfBirth;
    
    @Pattern(regexp = "MALE|FEMALE|OTHER", message = "Giới tính phải là MALE, FEMALE hoặc OTHER")
    private String gender;
    
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải từ 10-11 chữ số")
    private String phoneNumber;
    
    @Size(max = 500, message = "Địa chỉ không được quá 500 ký tự")
    private String address;
    
    @Size(max = 100, message = "Múi giờ không được quá 100 ký tự")
    private String timezone;
    
    // Avatar
    @Size(max = 500, message = "Link avatar không được quá 500 ký tự")
    private String avatar;
    
    // CV URL
    @Size(max = 500, message = "Link CV không được quá 500 ký tự")
    private String cvFileUrl;
    
    @Size(max = 255, message = "Tên file CV không được quá 255 ký tự")
    private String cvFileName;
    
    // Video giới thiệu
    private String videoIntro;
    
    // Danh sách môn học với học phí
    @Valid
    @NotEmpty(message = "Phải chọn ít nhất một môn học")
    private List<SubjectFeeRequest> subjectFees;
    
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
        
        private String degreeFileName;
        private String degreeFileUrl;    }
    
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
        
        private String certFileName;
        private String certFileUrl;    }
    
    @Data
    public static class SubjectFeeRequest {
        @NotNull(message = "ID môn học không được để trống")
        private Integer subjectId;
        
        @NotNull(message = "Học phí không được để trống")
        @Min(value = 50000, message = "Học phí tối thiểu 50,000 VND")
        private Integer fees; // Học phí cho môn học này (VND)
        
        /**
         * Ví dụ:
         * {
         *   "subjectId": 1,    // ID môn Toán
         *   "fees": 150000     // 150k VND/buổi
         * },
         * {
         *   "subjectId": 2,    // ID môn Lý  
         *   "fees": 200000     // 200k VND/buổi
         * }
         */
    }
} 