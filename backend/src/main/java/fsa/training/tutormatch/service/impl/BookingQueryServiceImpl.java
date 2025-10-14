package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.BookingQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
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
        return bookingRepository.findByStudentUser(student, Pageable.unpaged()).getContent();
    }
    
    @Override
    public List<Booking> findByTutor(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUser(tutor, Pageable.unpaged()).getContent();
    }
    
    @Override
    public List<Booking> getPendingBookings(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndStatus(tutor, BookingStatus.PAYMENT_PENDING);
    }
    
    @Override
    public List<Booking> getConfirmedBookings(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndStatus(tutor, BookingStatus.TUTOR_APPROVED);
    }
    
    @Override
    public List<Booking> getCancelledBookings(String username) {
        User user = findUserByUsername(username);
        if (user.getRole() == UserRole.TUTOR) {
            return bookingRepository.findByTutorUserAndStatus(user, BookingStatus.CANCELLED);
        } else {
            return bookingRepository.findByStudentUserAndStatus(user, BookingStatus.CANCELLED, Pageable.unpaged()).getContent();
        }
    }
    
    @Override
    public List<Booking> getConfirmedBookingsByLocalDate(String tutorUsername, LocalDate date) {
        User tutor = findUserByUsername(tutorUsername);
        // Lấy tất cả booking của tutor và filter theo session date
        return bookingRepository.findByTutorUser(tutor, Pageable.unpaged()).getContent()
                .stream()
                .filter(booking -> booking.getSessions() != null && 
                                  booking.getSessions().stream()
                                          .anyMatch(session -> session.getSessionDate().equals(date)) &&
                                  booking.getStatus() == BookingStatus.TUTOR_APPROVED)
                .toList();
    }
    
    @Override
    public List<Booking> getBookingsBetweenLocalDates(String tutorUsername, LocalDate startLocalDate, LocalDate endLocalDate) {
        User tutor = findUserByUsername(tutorUsername);
        // Lấy tất cả booking của tutor và filter theo session date range
        return bookingRepository.findByTutorUser(tutor, Pageable.unpaged()).getContent()
                .stream()
                .filter(booking -> booking.getSessions() != null && 
                                  booking.getSessions().stream()
                                          .anyMatch(session -> !session.getSessionDate().isBefore(startLocalDate) && 
                                                              !session.getSessionDate().isAfter(endLocalDate)))
                .toList();
    }
    
    @Override
    public long countPendingBookings(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndStatus(tutor, BookingStatus.PAYMENT_PENDING).size();
    }
    
    @Override
    public long countCompletedBookings(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        return bookingRepository.findByTutorUserAndStatus(tutor, BookingStatus.TUTOR_APPROVED).size();
    }
    
    @Override
    public long countTodayBookings(String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        LocalDate today = LocalDate.now();
        // Lấy tất cả booking của tutor và filter theo session date hôm nay
        return bookingRepository.findByTutorUser(tutor, Pageable.unpaged()).getContent()
                .stream()
                .filter(booking -> booking.getSessions() != null && 
                                  booking.getSessions().stream()
                                          .anyMatch(session -> session.getSessionDate().equals(today)) &&
                                  booking.getStatus() == BookingStatus.TUTOR_APPROVED)
                .count();
    }
    
    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
} 