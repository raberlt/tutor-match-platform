package fsa.training.tutormatch.dto;

import lombok.Data;
import java.sql.Date;
import java.sql.Time;

@Data
public class BookingRequestDTO {
    private Integer id;
    private String status;
    private String bookingType;
    private Date date;
    private Time fromTime;
    private Time toTime;
    private String note;
    private Double totalAmount;
    private Integer contractDuration;
    private Integer sessionsPerWeek;
    
    // Student info (minimal)
    private StudentInfo student;
    
    // Tutor info (minimal)
    private TutorInfo tutor;
    
    // Subject info
    private SubjectInfo subject;
    
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
} 