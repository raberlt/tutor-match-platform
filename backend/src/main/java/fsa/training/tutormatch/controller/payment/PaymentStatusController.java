package fsa.training.tutormatch.controller.payment;

import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.repository.TransactionRepository;
import fsa.training.tutormatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentStatusController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    /**
     * API để mô phỏng webhook thành công (chỉ để test)
     */
    @PostMapping("/simulate-success/{transactionRef}")
    public ResponseEntity<?> simulateSuccess(@PathVariable String transactionRef, Authentication authentication) {
        log.info("Simulating successful payment for transactionRef: {}", transactionRef);
        
        try {
            String username = authentication.getName();
            Optional<Transaction> optionalTransaction = transactionRepository.findByTransactionRef(transactionRef);
            
            if (optionalTransaction.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Transaction not found");
                return ResponseEntity.badRequest().body(response);
            }
            
            Transaction transaction = optionalTransaction.get();
            
            // Kiểm tra quyền truy cập
            if (!transaction.getUser().getUsername().equals(username)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Unauthorized access to transaction");
                return ResponseEntity.badRequest().body(response);
            }

            // Cập nhật trạng thái thành COMPLETED
            transaction.setStatus(fsa.training.tutormatch.enums.TransactionStatus.COMPLETED);
            transaction.setProcessedAt(java.time.ZonedDateTime.now());
            transaction.setBalanceAfter(transaction.getBalanceBefore().add(transaction.getAmount()));
            transactionRepository.save(transaction);

            // Cập nhật số dư user
            var user = transaction.getUser();
            user.setCreditBalance(user.getCreditBalance().add(transaction.getAmount()));
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment simulated successfully");
            response.put("transactionRef", transactionRef);
            response.put("status", "COMPLETED");
            response.put("newBalance", user.getCreditBalance());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error simulating payment for transactionRef {}: {}", transactionRef, e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error simulating payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * API để check trạng thái giao dịch thủ công
     */
    @GetMapping("/status/{transactionRef}")
    public ResponseEntity<?> checkStatus(@PathVariable String transactionRef, Authentication authentication) {
        log.info("Checking payment status for transactionRef: {}", transactionRef);
        
        try {
            String username = authentication.getName();
            Optional<Transaction> optionalTransaction = transactionRepository.findByTransactionRef(transactionRef);
            
            if (optionalTransaction.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Transaction not found");
                return ResponseEntity.badRequest().body(response);
            }
            
            Transaction transaction = optionalTransaction.get();
            
            // Kiểm tra xem user có quyền xem transaction này không
            if (!transaction.getUser().getUsername().equals(username)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Unauthorized access to transaction");
                return ResponseEntity.badRequest().body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("transactionRef", transactionRef);
            response.put("status", transaction.getStatus().name());
            response.put("amount", transaction.getAmount());
            response.put("description", transaction.getDescription());
            response.put("createdAt", transaction.getCreatedAt());
            response.put("processedAt", transaction.getProcessedAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error checking payment status for transactionRef {}: {}", transactionRef, e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error checking status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
