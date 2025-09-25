package fsa.training.tutormatch.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BecomeTutorDraftRequest {
    
    // Thông tin cơ bản - cho phép trống khi draft
    @Size(max = 2000, message = "Bio không được quá 2000 ký tự")
    private String bio;
    
    @Size(max = 255, message = "Headline không được quá 255 ký tự")
    private String headline;
    
    @Size(max = 2000, message = "Kinh nghiệm không được quá 2000 ký tự")
    private String experience;
    
    
    @Size(max = 1000, message = "Đối tượng dạy không được quá 1000 ký tự")
    private List<String> teachingAudiences;
    
    // Thông tin cá nhân bổ sung
    @Size(max = 50, message = "Họ không được quá 50 ký tự")
    private String firstName;
    
    @Size(max = 50, message = "Tên không được quá 50 ký tự")
    private String lastName;
    
    private LocalDate dateOfBirth;
    
    @Pattern(regexp = "MALE|FEMALE|OTHER", message = "Giới tính phải là MALE, FEMALE hoặc OTHER")
    private String gender;
    
    @Pattern(regexp = "^[0-9]{9,15}$", message = "Số điện thoại phải từ 9-15 chữ số")
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
    private List<SubjectFeeRequest> subjectFees;
    
    // Lịch dạy
    @Valid
    private List<ScheduleRequest> schedules;
    
    // Danh sách bằng cấp
    @Valid
    private List<EducationRequest> educations;
    
    // Danh sách chứng chỉ
    @Valid
    private List<CertificateRequest> certificates;
    
    @Data
    public static class ScheduleRequest {
        @Pattern(regexp = "MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY", 
                 message = "Thứ phải là MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY hoặc SUNDAY")
        private String dayOfWeek;
        
        @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Giờ bắt đầu phải có định dạng HH:mm")
        private String fromTime;
        
        @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Giờ kết thúc phải có định dạng HH:mm")
        private String toTime;
        
        private boolean enable = true;
    }

    @Data
    public static class EducationRequest {
        @Size(max = 100, message = "Tên trường không được quá 100 ký tự")
        private String schoolName;
    
        @Size(max = 100, message = "Bằng cấp không được quá 100 ký tự")
        private String degree;
    
        @Size(max = 100, message = "Chuyên ngành không được quá 100 ký tự")
        private String major;
    
        @Min(value = 1900, message = "Năm bắt đầu phải từ 1900")
        @Max(value = 2030, message = "Năm kết thúc không được quá 2030")
        private Integer fromTime;
    
        @Min(value = 1900, message = "Năm kết thúc phải từ 1900")
        @Max(value = 2030, message = "Năm kết thúc không được quá 2030")
        private Integer toTime;
        
        private String degreeFileName;
        private String degreeFileUrl;    }
    
    @Data
    public static class CertificateRequest {
        @Size(max = 255, message = "Tên chứng chỉ không được quá 255 ký tự")
        private String name;
        
        @Size(max = 255, message = "Đơn vị cấp không được quá 255 ký tự")
        private String issuedBy;
        
        @Size(max = 255, message = "Mô tả không được quá 255 ký tự")
        private String description;
        
        private String certFileName;
        private String certFileUrl;    }
    
    @Data
    public static class SubjectFeeRequest {
        private Long subjectId;
        
        @Min(value = 0, message = "Học phí phải lớn hơn hoặc bằng 0")
        private Integer fees;
    }
}
