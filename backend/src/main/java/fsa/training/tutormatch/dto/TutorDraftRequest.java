package fsa.training.tutormatch.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class TutorDraftRequest {
    
    // Thông tin cơ bản - không bắt buộc cho draft
    private String bio;
    private String headline;
    private String experience;
    
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
    private String cvFileUrl;
    
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
    
    // Đối tượng dạy - không bắt buộc cho draft
    private List<String> teachingAudiences;
    
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
        private String degreeFileName;
        private String degreeFileUrl;    }
    
    @Data
    public static class CertificateRequest {
        private String name;
        private String issuedBy;
        private String description;
        private String certFileName;
        private String certFileUrl;    }
    
    @Data
    public static class SubjectFeeRequest {
        private Integer subjectId;
        private Integer fees;
    }
}
