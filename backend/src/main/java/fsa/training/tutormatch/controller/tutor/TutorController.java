package fsa.training.tutormatch.controller.tutor;

import fsa.training.tutormatch.dto.TutorDTO;
import fsa.training.tutormatch.service.interfaces.ITutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tutors")
@PreAuthorize("hasRole('STUDENT')")
public class TutorController {

    @Autowired
    private ITutorService tutorService;

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
}
