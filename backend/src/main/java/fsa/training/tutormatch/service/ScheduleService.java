package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.BookingStatus;import fsa.training.tutormatch.entity.Schedule;
import fsa.training.tutormatch.entity.BookingType;import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.ScheduleRepository;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * DTO cho available time slots
     */
    public static class AvailableSlot {
        private String fromTime;
        private String toTime;
        private String dayOfWeek;

        // Getters and setters
        public String getFromTime() { return fromTime; }
        public void setFromTime(String fromTime) { this.fromTime = fromTime; }
        
        public String getToTime() { return toTime; }
        public void setToTime(String toTime) { this.toTime = toTime; }
        
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    }

    /**
     * Lấy available time slots cho tutor trong ngày cụ thể
     */
    public List<AvailableSlot> getAvailableSlots(Integer tutorId, String date) {
        Optional<User> tutorOpt = userRepository.findById(tutorId);
        if (tutorOpt.isEmpty()) {
            throw new IllegalArgumentException("Tutor not found");
        }

        User tutor = tutorOpt.get();
        // Lấy TutorProfile từ user (multi-profiles)
        var tutorProfileOpt = tutor.getTutorProfile();
        if (tutorProfileOpt.isEmpty()) {
            return List.of();
        }

        // Get tutor's schedule for the day
        Date bookingDate = Date.valueOf(date);
        Calendar cal = Calendar.getInstance();
        cal.setTime(bookingDate);
        String dayOfWeekEn = getDayOfWeekEnglish(cal.get(Calendar.DAY_OF_WEEK));
        String dayOfWeekVi = getDayOfWeekVietnamese(cal.get(Calendar.DAY_OF_WEEK));

        List<Schedule> daySchedules = scheduleRepository.findByProfileIdAndEnableTrue(tutorProfileOpt.get().getId())
            .stream()
            .filter(schedule ->
                schedule.getDayOfWeek().equals(dayOfWeekEn) ||
                schedule.getDayOfWeek().equals(dayOfWeekVi)
            )
            .toList();

        if (daySchedules.isEmpty()) {
            return List.of();
        }

        // Get existing bookings for this date and tutor (CONFIRMED or PENDING status)
        List<Booking> existingBookings = bookingRepository.findByTutorUserAndDate(tutor, bookingDate)
            .stream()
            .filter(booking -> 
                booking.getStatus() == BookingStatus.CONFIRMED || 
                booking.getStatus() == BookingStatus.PENDING
            )
            .toList();

        // Create available slots by removing booked time slots
        List<AvailableSlot> availableSlots = new ArrayList<>();
        for (Schedule schedule : daySchedules) {
            boolean isBooked = existingBookings.stream()
                .anyMatch(booking -> 
                    booking.getFromTime().equals(schedule.getFromTime()) &&
                    booking.getToTime().equals(schedule.getToTime())
                );
            
            if (!isBooked) {
                AvailableSlot slot = new AvailableSlot();
                // Format time to HH:mm format
                slot.setFromTime(schedule.getFromTime().toLocalTime().toString().substring(0, 5));
                slot.setToTime(schedule.getToTime().toLocalTime().toString().substring(0, 5));
                slot.setDayOfWeek(schedule.getDayOfWeek());
                availableSlots.add(slot);
            }
        }

        return availableSlots;
    }

    /**
     * Lấy lịch dạy của tutor theo profile ID
     */
    public List<Schedule> getTutorSchedules(Integer profileId) {
        return scheduleRepository.findByProfileIdAndEnableTrue(profileId);
    }

    private String getDayOfWeekEnglish(int dayOfWeek) {
        String[] days = {"", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        return days[dayOfWeek];
    }

    private String getDayOfWeekVietnamese(int dayOfWeek) {
        String[] days = {"", "Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"};
        return days[dayOfWeek];
    }
} 