package fsa.training.tutormatch.service;

public interface BookingLifecycleService {
    void acceptPackageBooking(Integer bookingId, Integer tutorUserId);
    void declinePackageBooking(Integer bookingId, Integer tutorUserId, String reason);
    void markPaymentPending(Integer bookingId);
    void markPaymentExpired(Integer bookingId);
    void onPaymentSuccess(Integer bookingId);
    void completeIfAllSessionsCompleted(Integer bookingId);
}


