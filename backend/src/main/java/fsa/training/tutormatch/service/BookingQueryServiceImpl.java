package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.BookingStatus;import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.entity.BookingType;import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.interfaces.IBookingQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BookingQueryServiceImpl implements IBookingQueryService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public Optional<Booking> findById(Integer bookingId) {
        return bookingRepository.findById(bookingId);
    }
    
    @Override
    public List<Booking> findByStudent(String studentUsername) {
        User student = findUserByUsername(studentUsername);
        return bookingRepository.findByStudentUser(student, org.springframework.data.domain.Pageable.unpaged()).getContent();
    }
    
    @Override
    public List<Booking> findByTutor(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUser(tutor, org.springframework.data.domain.Pageable.unpaged()).getContent();
    }
    
    @Override
    public List<Booking> getPendingBookings(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndStatus(tutor, BookingStatus.PENDING);
    }
    
    @Override
    public List<Booking> getConfirmedBookings(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndStatus(tutor, BookingStatus.CONFIRMED);
    }
    
    @Override
    public List<Booking> getCancelledBookings(String username) {
        User user = findUserByUsername(username);
        if (user.getRole() == User.Role.TUTOR) {
            return bookingRepository.findByTutorUserAndStatus(user, BookingStatus.CANCELLED);
        } else {
            return bookingRepository.findByStudentUserAndStatus(user, BookingStatus.CANCELLED, org.springframework.data.domain.Pageable.unpaged()).getContent();
        }
    }
    
    @Override
    public List<Booking> getConfirmedBookingsByDate(String tutorUsername, Date date) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndDate(tutor, date)
                .stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
                .toList();
    }
    
    @Override
    public List<Booking> getBookingsBetweenDates(String tutorUsername, Date startDate, Date endDate) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndDateBetween(tutor, startDate, endDate);
    }
    
    @Override
    public long countPendingBookings(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndStatus(tutor, BookingStatus.PENDING).size();
    }
    
    @Override
    public long countCompletedBookings(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndStatus(tutor, BookingStatus.COMPLETED).size();
    }
    
    @Override
    public long countTodayBookings(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        Date today = Date.valueOf(LocalDate.now());
        return bookingRepository.findByTutorUserAndDate(tutor, today)
                .stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
                .count();
    }
    
    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
} 