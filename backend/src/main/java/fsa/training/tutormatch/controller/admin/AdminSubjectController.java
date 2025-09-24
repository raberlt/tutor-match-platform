package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.entity.Subject;
// import fsa.training.tutormatch.enums.SubjectCategory;
// import fsa.training.tutormatch.enums.SubjectLevel;
import fsa.training.tutormatch.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/subjects")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    /**
     * Lấy danh sách môn học
     */
    @GetMapping
    public ResponseEntity<?> getSubjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Subject> subjectsPage;

            // Apply filters - simplified since category and level fields are commented out
            subjectsPage = subjectRepository.findAll(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("subjects", subjectsPage.getContent());
            response.put("currentPage", subjectsPage.getNumber());
            response.put("totalItems", subjectsPage.getTotalElements());
            response.put("totalPages", subjectsPage.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi lấy danh sách môn học: " + e.getMessage())
            );
        }
    }

    /**
     * Tạo môn học mới
     */
    @PostMapping
    public ResponseEntity<?> createSubject(@RequestBody Map<String, Object> subjectData) {
        try {
            Subject subject = new Subject();
            subject.setName((String) subjectData.get("name"));
            subject.setDescription((String) subjectData.get("description"));
            // subject.setCategory(SubjectCategory.valueOf(((String) subjectData.get("category")).toUpperCase()));
            // subject.setLevel(SubjectLevel.valueOf(((String) subjectData.get("level")).toUpperCase()));
            // subject.setIsActive((Boolean) subjectData.getOrDefault("isActive", true));
            subject.setCreatedAt(ZonedDateTime.now());

            subject = subjectRepository.save(subject);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã tạo môn học thành công");
            response.put("subject", subject);

            return ResponseEntity.status(201).body(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi tạo môn học: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật môn học
     */
    @PutMapping("/{subjectId}")
    public ResponseEntity<?> updateSubject(@PathVariable Integer subjectId, @RequestBody Map<String, Object> subjectData) {
        try {
            Optional<Subject> subjectOpt = subjectRepository.findById(subjectId);
            if (subjectOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Subject subject = subjectOpt.get();
            if (subjectData.containsKey("name")) subject.setName((String) subjectData.get("name"));
            if (subjectData.containsKey("description")) subject.setDescription((String) subjectData.get("description"));
            // if (subjectData.containsKey("category")) subject.setCategory(SubjectCategory.valueOf(((String) subjectData.get("category")).toUpperCase()));
            // if (subjectData.containsKey("level")) subject.setLevel(SubjectLevel.valueOf(((String) subjectData.get("level")).toUpperCase()));
            // if (subjectData.containsKey("isActive")) subject.setIsActive((Boolean) subjectData.get("isActive"));

            subject = subjectRepository.save(subject);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cập nhật môn học thành công");
            response.put("subject", subject);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi cập nhật môn học: " + e.getMessage())
            );
        }
    }

    /**
     * Thay đổi trạng thái môn học
     */
    @PutMapping("/{subjectId}/toggle-status")
    public ResponseEntity<?> toggleSubjectStatus(@PathVariable Integer subjectId) {
        try {
            Optional<Subject> subjectOpt = subjectRepository.findById(subjectId);
            if (subjectOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Subject subject = subjectOpt.get();
            // subject.setIsActive(!subject.getIsActive());
            subject = subjectRepository.save(subject);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã thay đổi trạng thái môn học thành công");
            response.put("subject", subject);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi thay đổi trạng thái môn học: " + e.getMessage())
            );
        }
    }

    /**
     * Xóa môn học
     */
    @DeleteMapping("/{subjectId}")
    public ResponseEntity<?> deleteSubject(@PathVariable Integer subjectId) {
        try {
            Optional<Subject> subjectOpt = subjectRepository.findById(subjectId);
            if (subjectOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            subjectRepository.delete(subjectOpt.get());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xóa môn học thành công");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi xóa môn học: " + e.getMessage())
            );
        }
    }

    /**
     * Thống kê môn học
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getSubjectStatistics() {
        try {
            long totalSubjects = subjectRepository.count();
            // long activeSubjects = subjectRepository.countByIsActive(true);
            // long inactiveSubjects = subjectRepository.countByIsActive(false);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalSubjects", totalSubjects);
            // stats.put("activeSubjects", activeSubjects);
            // stats.put("inactiveSubjects", inactiveSubjects);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi lấy thống kê môn học: " + e.getMessage())
            );
        }
    }
}
