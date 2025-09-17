package fsa.training.tutormatch.controller.api.booking.student;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.dto.BookingRequestDTO;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.BookingStatus;
import fsa.training.tutormatch.entity.BookingType;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.interfaces.IBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student/bookings")
@PreAuthorize("hasRole('STUDENT')")
public class StudentBookingApiController {

    @Autowired
    private IBookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Tạo booking mới (đặt lịch)
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestCreateDTO request, 
                                         Authentication authentication) {
        try {
            String username = authentication.getName();
            Booking booking = bookingService.createBooking(username, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đặt lịch thành công!");
            response.put("bookingId", booking.getId());
            // TODO: Fix when Lombok is working properly
            response.put("status", "PENDING"); // Temporary fix
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Đặt lịch thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy danh sách booking của student với response simplified
     */
    @GetMapping
    public ResponseEntity<?> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            
            // ✅ Find student by username
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            // ✅ Get StudentProfile from User (multi-profiles)
            StudentProfile student = user.getStudentProfile()
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Booking> bookings;
            
            if (status != null && !status.isEmpty()) {
                BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
                bookings = bookingRepository.findByStudentAndStatus(student, bookingStatus, pageable);
            } else {
                bookings = bookingRepository.findByStudent(student, pageable);
            }
            
            // Convert to simplified DTO
            List<BookingRequestDTO> bookingDTOs = bookings.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookings", bookingDTOs);
            response.put("currentPage", bookings.getNumber());
            response.put("totalPages", bookings.getTotalPages());
            response.put("totalElements", bookings.getTotalElements());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách booking: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy chi tiết 1 booking
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingDetail(@PathVariable Integer bookingId,
                                            Authentication authentication) {
        try {
            String username = authentication.getName();
            User student = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Verify ownership
            if (!booking.getStudent().getId().equals(student.getId())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You can only view your own bookings");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            BookingRequestDTO bookingDTO = convertToDTO(booking);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("booking", bookingDTO);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Hủy booking (chỉ khi status = PENDING)
     */
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Integer bookingId,
                                         Authentication authentication) {
        try {
            String username = authentication.getName();
            Booking cancelledBooking = bookingService.cancelBookingByStudent(bookingId, username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking đã được hủy thành công");
            response.put("bookingId", cancelledBooking.getId());
            response.put("status", cancelledBooking.getStatus().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Convert Booking entity to simplified DTO
     */
    private BookingRequestDTO convertToDTO(Booking booking) {
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setId(booking.getId());
        dto.setStatus(booking.getStatus().toString());
        dto.setBookingType(booking.getBookingType().toString());
        dto.setDate(booking.getDate());
        dto.setFromTime(booking.getFromTime());
        dto.setToTime(booking.getToTime());
        dto.setNote(booking.getNote());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setContractDuration(booking.getContractDuration());
        dto.setSessionsPerWeek(booking.getSessionsPerWeek());

        // Student info (minimal)
        if (booking.getStudent() != null && booking.getStudent().getUser() != null) {
            User studentUser = booking.getStudent().getUser();
            BookingRequestDTO.StudentInfo studentInfo = new BookingRequestDTO.StudentInfo();
            studentInfo.setId(studentUser.getId());
            studentInfo.setFirstName(studentUser.getFirstName());
            studentInfo.setLastName(studentUser.getLastName());
            studentInfo.setEmail(studentUser.getEmail());
            dto.setStudent(studentInfo);
        }

        // Tutor info (minimal)
        if (booking.getTutor() != null && booking.getTutor().getUser() != null) {
            User tutorUser = booking.getTutor().getUser();
            BookingRequestDTO.TutorInfo tutorInfo = new BookingRequestDTO.TutorInfo();
            tutorInfo.setId(tutorUser.getId());
            tutorInfo.setFirstName(tutorUser.getFirstName());
            tutorInfo.setLastName(tutorUser.getLastName());
            tutorInfo.setEmail(tutorUser.getEmail());

            // Lấy thêm thông tin từ TutorProfile
            tutorInfo.setHeadline(booking.getTutor().getHeadline());
            tutorInfo.setFees(booking.getTutor().getFees());
            tutorInfo.setCity(booking.getTutor().getCity());

            dto.setTutor(tutorInfo);
        }

        // Subject info
        if (booking.getSubject() != null) {
            BookingRequestDTO.SubjectInfo subjectInfo = new BookingRequestDTO.SubjectInfo();
            subjectInfo.setId(booking.getSubject().getId());
            subjectInfo.setName(booking.getSubject().getName());
            dto.setSubject(subjectInfo);
        }

        return dto;
    }

} 