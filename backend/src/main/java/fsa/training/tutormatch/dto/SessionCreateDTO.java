package fsa.training.tutormatch.dto;

import lombok.Data;

@Data
public class SessionCreateDTO {
    private String date;      // YYYY-MM-DD
    private String fromTime;  // HH:mm
    private String toTime;    // HH:mm
    private Integer subjectId; // optional, override for each session
    private java.math.BigDecimal fee; // optional fee per session
}






