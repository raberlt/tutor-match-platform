package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Session;
import fsa.training.tutormatch.enums.BookingType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Service để tạo sessions từ booking data
 * Hỗ trợ tạo sessions cho SINGLE, PACKAGE, TRIAL bookings
 */
public interface BookingSessionService {
    
    /**
     * Tạo sessions cho booking dựa trên booking type
     */
    List<Session> createSessionsForBooking(Booking booking);
    
    /**
     * Tạo session cho SINGLE booking
     */
    List<Session> createSingleSession(Booking booking);
    
    /**
     * Tạo sessions cho PACKAGE booking với lịch cố định
     */
    List<Session> createPackageSessionsFixed(Booking booking, LocalDate startDate, List<String> selectedDays, LocalTime startTime, LocalTime endTime);
    
    /**
     * Tạo sessions cho PACKAGE booking với lịch tự do
     */
    List<Session> createPackageSessionsFlexible(Booking booking, List<SessionSchedule> customSessions);
    
    /**
     * Tạo session cho TRIAL booking
     */
    List<Session> createTrialSession(Booking booking);
    
    /**
     * Inner class để lưu thông tin lịch session
     */
    class SessionSchedule {
        private LocalDate sessionDate;
        private LocalTime startTime;
        private LocalTime endTime;
        
        public SessionSchedule(LocalDate sessionDate, LocalTime startTime, LocalTime endTime) {
            this.sessionDate = sessionDate;
            this.startTime = startTime;
            this.endTime = endTime;
        }
        
        // Getters and setters
        public LocalDate getSessionDate() { return sessionDate; }
        public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }
        
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    }
}
