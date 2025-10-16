package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.CancelledBy;
import fsa.training.tutormatch.entity.Session;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.enums.SessionStatus;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.SessionRepository;
import fsa.training.tutormatch.service.CancellationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CancellationServiceImpl implements CancellationService {

    private final BookingRepository bookingRepository;
    private final SessionRepository sessionRepository;

    public CancellationServiceImpl(BookingRepository bookingRepository, SessionRepository sessionRepository) {
        this.bookingRepository = bookingRepository;
        this.sessionRepository = sessionRepository;
    }

    @Override
    public void cancelBooking(Integer bookingId, CancelledBy actor, String reason) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        // Simple rule: if any session is IN_PROGRESS or COMPLETED, forbid full cancel (handled at controller/UI)
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledBy(actor);
        booking.setCancelReason(reason);
        bookingRepository.save(booking);
    }

    @Override
    public void cancelSession(Long sessionId, CancelledBy actor, String reason) {
        Session session = sessionRepository.findById(sessionId).orElseThrow();
        session.setStatus(SessionStatus.CANCELLED);
        sessionRepository.save(session);
    }
}


