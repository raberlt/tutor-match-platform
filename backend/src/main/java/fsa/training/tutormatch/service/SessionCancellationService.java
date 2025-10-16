package fsa.training.tutormatch.service;

public interface SessionCancellationService {
    record CancelResult(String message, int refundPercent, java.math.BigDecimal refundAmount) {}

    CancelResult cancelSession(Long sessionId, String actor, String reason, String username);
}



