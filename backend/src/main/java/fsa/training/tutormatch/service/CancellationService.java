package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.CancelledBy;

public interface CancellationService {
    void cancelBooking(Integer bookingId, CancelledBy actor, String reason);
    void cancelSession(Long sessionId, CancelledBy actor, String reason);
}


