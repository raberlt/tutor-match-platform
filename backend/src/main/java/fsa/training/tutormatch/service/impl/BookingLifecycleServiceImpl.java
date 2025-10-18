package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.enums.PaymentStatus;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.service.BookingLifecycleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;

@Service
@Transactional
public class BookingLifecycleServiceImpl implements BookingLifecycleService {

    private final BookingRepository bookingRepository;

    public BookingLifecycleServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public void acceptPackageBooking(Integer bookingId, Integer tutorUserId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus(BookingStatus.PAYMENT_PENDING); // Chuyển sang chờ thanh toán
        booking.setPaymentStatus(PaymentStatus.PENDING); // Set payment status khi gia sư đồng ý
        booking.setPaymentDeadline(ZonedDateTime.now().plusHours(24));
        bookingRepository.save(booking);
    }

    @Override
    public void declinePackageBooking(Integer bookingId, Integer tutorUserId, String reason) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelReason(reason);
        bookingRepository.save(booking);
    }

    @Override
    public void markPaymentPending(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus(BookingStatus.PAYMENT_PENDING);
        if (booking.getPaymentDeadline() == null) {
            booking.setPaymentDeadline(ZonedDateTime.now().plusMinutes(10));
        }
        bookingRepository.save(booking);
    }

    @Override
    public void markPaymentExpired(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus(BookingStatus.PAYMENT_EXPIRED);
        bookingRepository.save(booking);
    }

    @Override
    public void onPaymentSuccess(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus(BookingStatus.PAYMENT_COMPLETED);
        bookingRepository.save(booking);
    }

    @Override
    public void completeIfAllSessionsCompleted(Integer bookingId) {
        // TODO: check all sessions status and then set booking completed
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);
    }
}


