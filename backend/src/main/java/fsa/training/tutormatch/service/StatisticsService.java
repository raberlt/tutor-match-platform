package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.TutorStatsDTO;
import fsa.training.tutormatch.enums.BookingStatus;import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Calendar;
import java.util.Optional;

@Service
public class StatisticsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Tính toán thống kê cho tutor dashboard
     */
    public TutorStatsDTO calculateTutorStats(String tutorUsername) {
        Optional<User> tutorOpt = userRepository.findByUsername(tutorUsername);
        if (tutorOpt.isEmpty()) {
            throw new IllegalArgumentException("Tutor not found");
        }

        User tutor = tutorOpt.get();
        LocalDate today = LocalDate.now();

        // Count today's confirmed bookings
        long todayCount = bookingRepository.findByTutorUserAndDate(tutor, today)
            .stream()
            .filter(booking -> booking.getStatus() == BookingStatus.PAYMENT_COMPLETED || booking.getStatus() == BookingStatus.TUTOR_APPROVED || booking.getStatus() == BookingStatus.UPCOMING)
            .count();

        // Count pending bookings
        long pendingCount = bookingRepository.findByTutorUserAndStatus(tutor, BookingStatus.PAYMENT_PENDING).size();

        // Count upcoming week bookings
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, 7);
        LocalDate nextWeek = LocalDate.now().plusWeeks(1);
        
        long upcomingCount = bookingRepository.findByTutorUserAndDateBetween(tutor, today, nextWeek)
            .stream()
            .filter(booking -> booking.getStatus() == BookingStatus.PAYMENT_COMPLETED || booking.getStatus() == BookingStatus.TUTOR_APPROVED || booking.getStatus() == BookingStatus.UPCOMING)
            .count();

        // Calculate monthly earnings (mock for now - should implement real calculation)
        String monthlyEarnings = calculateMonthlyEarnings(tutor);

        TutorStatsDTO stats = new TutorStatsDTO();
        stats.setTodayClasses((int) todayCount);
        stats.setPendingRequests((int) pendingCount);
        stats.setUpcomingClasses((int) upcomingCount);
        stats.setMonthlyEarnings(monthlyEarnings);

        return stats;
    }

    /**
     * Tính toán thu nhập hàng tháng (mock implementation)
     * TODO: Implement real calculation based on completed bookings and tutor fees
     */
    private String calculateMonthlyEarnings(User tutor) {
        // Mock implementation - should calculate based on:
        // 1. Completed bookings this month
        // 2. Tutor's hourly rate
        // 3. Duration of each booking
        return "2.4M"; // Placeholder
    }
} 