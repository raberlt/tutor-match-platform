package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.BookingQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BookingQueryServiceImpl implements BookingQueryService {
    
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
        if (user.getRole() == UserRole.TUTOR) {
            return bookingRepository.findByTutorUserAndStatus(user, BookingStatus.CANCELLED);
        } else {
            return bookingRepository.findByStudentUserAndStatus(user, BookingStatus.CANCELLED, org.springframework.data.domain.Pageable.unpaged()).getContent();
        }
    }
    
    @Override
    public List<Booking> getConfirmedBookingsByLocalDate(String tutorUsername, LocalDate date) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndDate(tutor, date)
                .stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
                .toList();
    }
    
    @Override
    public List<Booking> getBookingsBetweenLocalDates(String tutorUsername, LocalDate startLocalDate, LocalDate endLocalDate) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndDateBetween(tutor, startLocalDate, endLocalDate);
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
        LocalDate today = LocalDate.now();
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