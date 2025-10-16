package fsa.training.tutormatch.controller.booking.dto;

public class SessionInfoDTO {
    public Long id;
    public String date; // yyyy-MM-dd
    public String startTime; // HH:mm
    public String endTime; // HH:mm
    public String status;
    public SubjectInfoDTO subject;
    public java.math.BigDecimal fee;
}


