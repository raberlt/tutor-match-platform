package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.entity.ApplicationEducation;
import fsa.training.tutormatch.repository.ApplicationEducationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/educations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEducationController {

    @Autowired
    private ApplicationEducationRepository applicationEducationRepository;

    @PutMapping("/{educationId}/verify")
    public ResponseEntity<?> verifyEducation(
            @PathVariable Long educationId,
            @RequestBody Map<String, Boolean> request) {
        try {
            Boolean isVerified = request.get("isVerified");
            if (isVerified == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "isVerified field is required"));
            }

            Optional<ApplicationEducation> educationOpt = applicationEducationRepository.findById(educationId);
            if (educationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ApplicationEducation education = educationOpt.get();
            education.setVerified(isVerified);
            applicationEducationRepository.save(education);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", isVerified ? "Education verified successfully" : "Education verification removed");
            response.put("educationId", educationId);
            response.put("isVerified", isVerified);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to verify education: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
