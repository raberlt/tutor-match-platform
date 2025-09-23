package fsa.training.tutormatch.controller.tutor;

import fsa.training.tutormatch.dto.TutorPreviewDTO;
import fsa.training.tutormatch.service.interfaces.ITutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicTutorController {

    @Autowired
    private ITutorService tutorService;

    /**
     * API công khai cho Guest - Tìm kiếm gia sư với pagination và filters
     * Không cần authentication
     */
    @GetMapping("/tutors")
    public ResponseEntity<?> searchTutorPreviews(
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
            Map<String, Object> result = (Map<String, Object>) tutorService.searchTutorPreviewsWithFilters(
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
     * API công khai - Thông tin cơ bản về hệ thống
     */
    @GetMapping("/info")
    public ResponseEntity<?> getSystemInfo() {
        return ResponseEntity.ok(
            new SystemInfo(
                "TutorMatch - Hệ thống kết nối gia sư",
                "Đăng ký để xem chi tiết gia sư và đặt lịch học",
                "v1.0"
            )
        );
    }

    // Nested DTO for system info
    public record SystemInfo(String name, String description, String version) {}
} 