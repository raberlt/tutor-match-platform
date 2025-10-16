package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.repository.BookingRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Component
public class PaymentExpiryScheduler {

    private final BookingRepository bookingRepository;

    public PaymentExpiryScheduler(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expireUnpaidBookings() {
        // Simple scan: find all PAYMENT_PENDING with deadline passed
        List<Booking> all = bookingRepository.findAll();
        ZonedDateTime now = ZonedDateTime.now();
        for (Booking b : all) {
            if (b.getStatus() == BookingStatus.PAYMENT_PENDING
                && b.getPaymentDeadline() != null
                && now.isAfter(b.getPaymentDeadline())) {
                b.setStatus(BookingStatus.PAYMENT_EXPIRED);
                bookingRepository.save(b);
            }
        }
    }
}


