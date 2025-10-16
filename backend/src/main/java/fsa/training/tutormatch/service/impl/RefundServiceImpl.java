package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Session;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.SessionRepository;
import fsa.training.tutormatch.service.RefundService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RefundServiceImpl implements RefundService {

    private final BookingRepository bookingRepository;
    private final SessionRepository sessionRepository;

    public RefundServiceImpl(BookingRepository bookingRepository, SessionRepository sessionRepository) {
        this.bookingRepository = bookingRepository;
        this.sessionRepository = sessionRepository;
    }

    @Override
    public void computeAndApplyRefundForBooking(Integer bookingId, String actor, RefundMethod method) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();

        // Tìm buổi gần nhất trong tương lai để tính mốc giờ
        var sessions = sessionRepository.findByBookingId(bookingId);
        java.time.ZonedDateTime now = java.time.ZonedDateTime.now();
        java.time.ZonedDateTime nearest = null;
        for (Session s : sessions) {
            java.time.LocalDate d = s.getSessionDate();
            java.time.LocalTime t = s.getStartTime();
            if (d == null || t == null) continue;
            java.time.ZonedDateTime z = java.time.ZonedDateTime.of(d, t, now.getZone());
            if (z.isAfter(now) && (nearest == null || z.isBefore(nearest))) {
                nearest = z;
            }
        }

        long hoursUntil = 0;
        if (nearest != null) {
            hoursUntil = java.time.Duration.between(now, nearest).toHours();
        }

        // Tính phần trăm hoàn tiền/phạt theo actor và mốc giờ
        // Lưu ý: Ở đây chỉ ghi nhận trạng thái và có thể log mức hoàn tiền/phạt, chưa hạch toán ví/thanh toán thực.
        String actorUpper = actor == null ? "SYSTEM" : actor.toUpperCase();
        int refundPercentForStudent = 0;
        int penaltyPercentForTutor = 0;

        if ("TUTOR".equals(actorUpper)) {
            // Tutor huỷ: học sinh hoàn 100%, tutor bị phạt theo mốc
            refundPercentForStudent = 100;
            if (hoursUntil >= 48) penaltyPercentForTutor = 5;
            else if (hoursUntil >= 24) penaltyPercentForTutor = 10;
            else penaltyPercentForTutor = 15;
        } else if ("STUDENT".equals(actorUpper)) {
            // Student huỷ: hoàn theo mốc
            if (hoursUntil >= 48) refundPercentForStudent = 100;
            else if (hoursUntil >= 24) refundPercentForStudent = 50;
            else refundPercentForStudent = 0;
            penaltyPercentForTutor = 0; // tuỳ rule có thể giảm thu nhập tutor nếu sát giờ
        } else {
            // System/Admin trigger - mặc định coi như 100% về học sinh
            refundPercentForStudent = 100;
        }

        // TODO: Hạch toán: tạo bản ghi refund/penalty, cập nhật số dư ví/credit theo method (BANK|CREDIT)
        // Hiện tại: cập nhật trạng thái booking -> REFUNDED
        booking.setStatus(BookingStatus.REFUNDED);
        bookingRepository.save(booking);

        // Có thể ghi log bằng System.out cho bước đầu
        System.out.printf("[Refund] booking=%d actor=%s hours=%d refundStudent=%d%% penaltyTutor=%d%% method=%s%n",
                bookingId, actorUpper, hoursUntil, refundPercentForStudent, penaltyPercentForTutor, method);
    }
}


