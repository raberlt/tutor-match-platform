package fsa.training.tutormatch.dto;

import fsa.training.tutormatch.enums.SessionStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@Data
public class SessionDTO {
    private Long id;
    private Integer bookingId;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private SessionStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private ZonedDateTime completedAt;
}
