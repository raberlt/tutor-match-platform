package fsa.training.tutormatch.controller.tutor;

import fsa.training.tutormatch.dto.TutorDTO;
import fsa.training.tutormatch.entity.TutorProfile;
// import fsa.training.tutormatch.entity.TutorProfileSubject; // Entity not found
import fsa.training.tutormatch.repository.TutorProfileRepository;
import fsa.training.tutormatch.service.TutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/tutors")
@PreAuthorize("hasRole('STUDENT')")
public class TutorController {

    @Autowired
    private TutorService tutorService;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    /**
     * API cho Student - Tìm kiếm gia sư với pagination và filters (full info)
     * Cần authentication với role STUDENT
     */
    @GetMapping
    public ResponseEntity<?> searchTutors(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer subjectId,
            @RequestParam(required = false) BigDecimal minFee,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            Map<String, Object> result = tutorService.searchTutorsWithFilters(
                keyword, subjectId, minFee, maxFee, minRating, city,
                page, size, sortBy, sortDirection);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi tìm kiếm gia sư: " + e.getMessage())
            );
        }
    }

    /**
     * API cho Student - Lấy chi tiết gia sư theo ID
     * Cần authentication với role STUDENT
     */
    @GetMapping("/{tutorId}")
    public ResponseEntity<?> getTutorDetail(@PathVariable Integer tutorId) {
        try {
            Optional<TutorDTO> tutorDetail = tutorService.findTutorDetailById(tutorId);
            
            if (tutorDetail.isPresent()) {
                return ResponseEntity.ok(tutorDetail.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy chi tiết gia sư: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy lịch trình của gia sư
     */
    @GetMapping("/{tutorId}/schedules")
    public ResponseEntity<?> getTutorSchedules(@PathVariable Integer tutorId) {
        try {
            Optional<TutorProfile> tutorOpt = tutorProfileRepository.findById(tutorId);
            if (tutorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            TutorProfile tutor = tutorOpt.get();
            List<Map<String, Object>> schedules = new ArrayList<>();

            if (tutor.getSchedules() != null) {
                tutor.getSchedules().forEach(schedule -> {
                    Map<String, Object> scheduleData = new HashMap<>();
                    scheduleData.put("dayOfWeek", schedule.getDayOfWeek());
                    scheduleData.put("fromTime", schedule.getFromTime());
                    scheduleData.put("toTime", schedule.getToTime());
                    schedules.add(scheduleData);
                });
            }

            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy lịch trình gia sư: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy danh sách môn học của gia sư
     */
    @GetMapping("/{tutorId}/subjects")
    public ResponseEntity<?> getTutorSubjects(@PathVariable Integer tutorId) {
        try {
            Optional<TutorProfile> tutorOpt = tutorProfileRepository.findById(tutorId);
            if (tutorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            TutorProfile tutor = tutorOpt.get();
            List<Map<String, Object>> subjects = new ArrayList<>();

            // Subject fees are now managed through ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
            if (false) { // Disabled as subject fees are managed separately
                new ArrayList<>().forEach(obj -> {
                    // TutorProfileSubject entity not found - temporarily disabled
                    Map<String, Object> subjectData = new HashMap<>();
                    subjectData.put("id", 0);
                    subjectData.put("name", "Unknown Subject");
                    subjectData.put("fees", 0);
                    subjects.add(subjectData);
                });
            }

            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy môn học gia sư: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy khung giờ trống của gia sư trong ngày cụ thể
     */
    @GetMapping("/{tutorId}/available-slots")
    public ResponseEntity<?> getAvailableTimeSlots(
            @PathVariable Integer tutorId,
            @RequestParam String date) {
        try {
            Optional<TutorProfile> tutorOpt = tutorProfileRepository.findById(tutorId);
            if (tutorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            TutorProfile tutor = tutorOpt.get();
            LocalDate selectedDate = LocalDate.parse(date);
            String dayOfWeek = selectedDate.getDayOfWeek().name();

            List<String> availableSlots = new ArrayList<>();

            if (tutor.getSchedules() != null) {
                tutor.getSchedules().stream()
                    .filter(schedule -> schedule.getDayOfWeek().equals(dayOfWeek))
                    .forEach(schedule -> {
                        LocalTime start = schedule.getFromTime();
                        LocalTime end = schedule.getToTime();
                        
                        // Generate 1-hour slots
                        LocalTime current = start;
                        while (current.isBefore(end)) {
                            LocalTime next = current.plusHours(1);
                            if (!next.isAfter(end)) {
                                String timeSlot = current.format(DateTimeFormatter.ofPattern("HH:mm")) + 
                                               " - " + next.format(DateTimeFormatter.ofPattern("HH:mm"));
                                availableSlots.add(timeSlot);
                            }
                            current = next;
                        }
                    });
            }

            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy khung giờ trống: " + e.getMessage())
            );
        }
    }
}
