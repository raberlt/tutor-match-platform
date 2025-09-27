package fsa.training.tutormatch.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class TutorPreviewDTO {
    private Integer id;
    private String firstName;
    private String lastName;
    private String imageAvatar;
    private String headline;
    private Integer fees;
    private Double ratePointAverage;
    private Integer totalPoint;
    private String city;
    private boolean isVerified;
    
    // Chỉ hiển thị tên môn học, không có chi tiết
    private List<String> subjectNames;
    
    // Subjects với thông tin chi tiết (id, name, hourlyRate)
    private List<Map<String, Object>> subjects;
    
    // Không có: bio, experience, teachingLevel, schedules, certificates
    // Guest không thể xem những thông tin này
} 