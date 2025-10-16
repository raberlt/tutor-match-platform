package fsa.training.tutormatch.controller.booking.dto;

import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.enums.BookingType;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

public class BookingMyDTO {
    public Integer id;
    public BookingStatus status;
    public BookingType bookingType;
    public String note;
    public Integer totalSessions;
    public BigDecimal totalAmount;
    public ZonedDateTime paymentDeadline;
    public String cancelledBy;
    public String cancelReason;
    public TutorInfoDTO tutor;
    public List<SessionInfoDTO> sessions;
}


