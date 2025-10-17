package fsa.training.tutormatch.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class BookingRequestDTO {
    private Integer id;
    private String bookingCode;
    private String status;
    private String bookingType;
    private LocalDate date;
    private LocalTime fromTime;
    private LocalTime toTime;
    private String note;
    private Double totalAmount;
    private Integer totalSessions;
    
    // Student info (minimal)
    private StudentInfo student;
    
    // Tutor info (minimal)
    private TutorInfo tutor;
    
    // Subject info
    private SubjectInfo subject;
    
    // Sessions info
    private List<SessionInfo> sessions;
    
    @Data
    public static class StudentInfo {
        private Integer id;
        private String firstName;
        private String lastName;
        private String email;
    }
    
    @Data
    public static class TutorInfo {
        private Integer id;
        private String firstName;
        private String lastName;
        private String email;
        private String headline;
        private Integer fees;
        private String city;
    }
    
    @Data
    public static class SubjectInfo {
        private Integer id;
        private String name;
    }
    
    @Data
    public static class SessionInfo {
        private Long id;
        private LocalDate sessionDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String status;
        private Integer rescheduleCount;
        // extended fields for UI
        private String subjectName;
        private java.math.BigDecimal fee;
    }
} 