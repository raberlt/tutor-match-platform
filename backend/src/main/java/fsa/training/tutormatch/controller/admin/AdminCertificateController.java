package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.entity.ApplicationCertificate;
import fsa.training.tutormatch.repository.ApplicationCertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/certificates")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCertificateController {

    @Autowired
    private ApplicationCertificateRepository applicationCertificateRepository;

    @PutMapping("/{certificateId}/verify")
    public ResponseEntity<?> verifyCertificate(
            @PathVariable Long certificateId,
            @RequestBody Map<String, Boolean> request) {
        try {
            Boolean isVerified = request.get("isVerified");
            if (isVerified == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "isVerified field is required"));
            }

            Optional<ApplicationCertificate> certificateOpt = applicationCertificateRepository.findById(certificateId);
            if (certificateOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ApplicationCertificate certificate = certificateOpt.get();
            certificate.setVerified(isVerified);
            applicationCertificateRepository.save(certificate);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", isVerified ? "Certificate verified successfully" : "Certificate verification removed");
            response.put("certificateId", certificateId);
            response.put("isVerified", isVerified);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to verify certificate: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
