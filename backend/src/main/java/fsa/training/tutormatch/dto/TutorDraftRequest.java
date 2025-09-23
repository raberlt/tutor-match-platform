package fsa.training.tutormatch.dto;

import fsa.training.tutormatch.enums.TeachingLevel;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class TutorDraftRequest {
    
    // Thông tin cơ bản - không bắt buộc cho draft
    private String bio;
    private String headline;
    private String experience;
    private TeachingLevel teachingLevel;
    
    // Thông tin cá nhân
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String address;
    private String timezone;
    
    // Avatar và CV
    private String avatar;
    private String cvUrl;
    
    // Video giới thiệu
    private String videoIntro;
    
    // Danh sách môn học với học phí - không bắt buộc cho draft
    private List<SubjectFeeRequest> subjectFees;
    
    // Lịch dạy - không bắt buộc cho draft
    private List<ScheduleRequest> schedules;
    
    // Danh sách bằng cấp - không bắt buộc cho draft
    private List<EducationRequest> educations;
    
    // Danh sách chứng chỉ - không bắt buộc cho draft
    private List<CertificateRequest> certificates;
    
    @Data
    public static class ScheduleRequest {
        private String dayOfWeek;
        private String fromTime;
        private String toTime;
        private boolean enable = true;
    }

    @Data
    public static class EducationRequest {
        private String schoolName;
        private String degree;
        private String major;
        private Integer fromTime;
        private Integer toTime;
        private String degreeImage;
    }
    
    @Data
    public static class CertificateRequest {
        private String name;
        private String issuedBy;
        private String description;
        private String certImage;
    }
    
    @Data
    public static class SubjectFeeRequest {
        private Integer subjectId;
        private Integer fees;
    }
}
