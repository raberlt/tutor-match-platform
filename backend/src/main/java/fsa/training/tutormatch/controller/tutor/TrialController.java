package fsa.training.tutormatch.controller.tutor;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.TrialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/trial")
@CrossOrigin(origins = "*")
public class TrialController {

    @Autowired
    private TrialService trialService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Kiểm tra xem học viên có thể học thử với gia sư này không
     */
    @GetMapping("/check-eligibility")
    public ResponseEntity<?> checkTrialEligibility(
            @RequestParam Integer studentId,
            @RequestParam Integer tutorId) {
        try {
            Optional<User> studentOpt = userRepository.findById(studentId);
            Optional<User> tutorOpt = userRepository.findById(tutorId);

            if (studentOpt.isEmpty() || tutorOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Không tìm thấy học viên hoặc gia sư")
                );
            }

            boolean canTakeTrial = trialService.canTakeTrial(studentOpt.get(), tutorOpt.get());
            
            Map<String, Object> response = new HashMap<>();
            response.put("canTakeTrial", canTakeTrial);
            response.put("message", canTakeTrial ? 
                "Bạn có thể học thử với gia sư này" : 
                "Bạn đã học thử với gia sư này rồi");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi kiểm tra điều kiện học thử: " + e.getMessage())
            );
        }
    }

    /**
     * Tính phí học thử (50% giá gốc)
     */
    @GetMapping("/calculate-trial-fee")
    public ResponseEntity<?> calculateTrialFee(@RequestParam Double originalFee) {
        try {
            double trialFee = trialService.calculateTrialFee(originalFee);
            
            Map<String, Object> response = new HashMap<>();
            response.put("originalFee", originalFee);
            response.put("trialFee", trialFee);
            response.put("discount", originalFee - trialFee);
            response.put("discountPercentage", 50);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi tính phí học thử: " + e.getMessage())
            );
        }
    }

    /**
     * Tính phí gói học với giảm giá
     */
    @GetMapping("/calculate-package-fee")
    public ResponseEntity<?> calculatePackageFee(
            @RequestParam Double originalFee,
            @RequestParam Integer totalSessions) {
        try {
            double packageFee = trialService.calculatePackageFee(originalFee, totalSessions);
            int discountSessions = trialService.calculateDiscountSessions(totalSessions);
            double originalTotal = originalFee * totalSessions;
            double discountAmount = originalTotal - packageFee;
            
            Map<String, Object> response = new HashMap<>();
            response.put("originalFee", originalFee);
            response.put("totalSessions", totalSessions);
            response.put("originalTotal", originalTotal);
            response.put("discountSessions", discountSessions);
            response.put("discountAmount", discountAmount);
            response.put("packageFee", packageFee);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi tính phí gói học: " + e.getMessage())
            );
        }
    }
}

