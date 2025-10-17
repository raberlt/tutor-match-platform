package fsa.training.tutormatch.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.TransactionStatus;
import fsa.training.tutormatch.repository.TransactionRepository;
import fsa.training.tutormatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/payment/sepay")
@RequiredArgsConstructor
public class SepayWebhookController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Sepay-Signature", required = false) String signature,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            @RequestHeader(value = "Content-Type", required = false) String contentType) {
        
        log.info("=== SEPAY WEBHOOK RECEIVED ===");
        log.info("Raw payload: {}", payload);
        log.info("Signature: {}", signature);
        log.info("User-Agent: {}", userAgent);
        log.info("Content-Type: {}", contentType);
        log.info("Payload length: {}", payload.length());
        
        // Log tất cả headers để debug
        log.info("=== ALL REQUEST HEADERS ===");
        // Note: Headers sẽ được log trong filter nếu cần
        
        try {
            // Parse webhook payload
            JsonNode jsonNode = objectMapper.readTree(payload);
            
            // Log all available fields in the payload
            log.info("Available fields in payload:");
            jsonNode.fieldNames().forEachRemaining(fieldName -> {
                log.info("  - {}: {}", fieldName, jsonNode.get(fieldName));
            });
            
               // Extract transaction information from webhook - handle Sepay format
               String transactionRef = null;
               String status = null;
               BigDecimal amount = null;
               String gatewayTransactionId = null;
               
               // Sepay webhook format: content field contains transfer description, not transactionRef
               if (jsonNode.has("content")) {
                   String content = jsonNode.get("content").asText();
                   log.info("Sepay content field: {}", content);
               }
               
               // Try different possible field names for transactionRef (fallback)
               if (transactionRef == null) {
                   if (jsonNode.has("transactionRef")) {
                       transactionRef = jsonNode.get("transactionRef").asText();
                   } else if (jsonNode.has("order_id")) {
                       transactionRef = jsonNode.get("order_id").asText();
                   } else if (jsonNode.has("orderId")) {
                       transactionRef = jsonNode.get("orderId").asText();
                   } else if (jsonNode.has("reference")) {
                       transactionRef = jsonNode.get("reference").asText();
                   } else if (jsonNode.has("ref")) {
                       transactionRef = jsonNode.get("ref").asText();
                   }
               }
               
               // Sepay format: transferType "in" means successful payment
               if (jsonNode.has("transferType")) {
                   String transferType = jsonNode.get("transferType").asText();
                   if ("in".equals(transferType)) {
                       status = "SUCCESS";
                   } else if ("out".equals(transferType)) {
                       status = "FAILED";
                   }
               }
               
               // Try different possible field names for status (fallback)
               if (status == null) {
                   if (jsonNode.has("status")) {
                       status = jsonNode.get("status").asText();
                   } else if (jsonNode.has("payment_status")) {
                       status = jsonNode.get("payment_status").asText();
                   } else if (jsonNode.has("state")) {
                       status = jsonNode.get("state").asText();
                   }
               }
               
               // Sepay format: transferAmount field
               if (jsonNode.has("transferAmount")) {
                   amount = new BigDecimal(jsonNode.get("transferAmount").asDouble());
               }
               
               // Try different possible field names for amount (fallback)
               if (amount == null) {
                   if (jsonNode.has("amount")) {
                       amount = new BigDecimal(jsonNode.get("amount").asDouble());
                   } else if (jsonNode.has("total_amount")) {
                       amount = new BigDecimal(jsonNode.get("total_amount").asDouble());
                   } else if (jsonNode.has("value")) {
                       amount = new BigDecimal(jsonNode.get("value").asDouble());
                   }
               }
               
               // Sepay format: id field as gatewayTransactionId
               if (jsonNode.has("id")) {
                   gatewayTransactionId = jsonNode.get("id").asText();
               }
               
               // Try different possible field names for gatewayTransactionId (fallback)
               if (gatewayTransactionId == null) {
                   if (jsonNode.has("gatewayTransactionId")) {
                       gatewayTransactionId = jsonNode.get("gatewayTransactionId").asText();
                   } else if (jsonNode.has("transaction_id")) {
                       gatewayTransactionId = jsonNode.get("transaction_id").asText();
                   } else if (jsonNode.has("gateway_id")) {
                       gatewayTransactionId = jsonNode.get("gateway_id").asText();
                   } else if (jsonNode.has("payment_id")) {
                       gatewayTransactionId = jsonNode.get("payment_id").asText();
                   }
               }
            
            log.info("Extracted values: transactionRef={}, status={}, amount={}, gatewayTransactionId={}", 
                    transactionRef, status, amount, gatewayTransactionId);
            
            Transaction transaction = null;
            
            // First try to find by transactionRef if available
            if (transactionRef != null) {
                Optional<Transaction> optionalTransaction = transactionRepository.findByTransactionRef(transactionRef);
                if (optionalTransaction.isPresent()) {
                    transaction = optionalTransaction.get();
                    log.info("Found transaction by transactionRef: {}", transactionRef);
                }
            }
            
            // If not found by transactionRef, try to find by amount and recent time
            if (transaction == null && amount != null) {
                log.info("TransactionRef not found, searching by amount: {} and recent time", amount);
                
                // Find PENDING transactions with matching amount created in last 30 minutes
                ZonedDateTime thirtyMinutesAgo = ZonedDateTime.now().minusMinutes(30);
                List<Transaction> pendingTransactions = transactionRepository.findByStatusAndAmountAndCreatedAtAfter(
                    TransactionStatus.PENDING, amount, thirtyMinutesAgo);
                
                if (!pendingTransactions.isEmpty()) {
                    // Take the most recent one
                    transaction = pendingTransactions.get(0);
                    log.info("Found transaction by amount and time: {}", transaction.getTransactionRef());
                } else {
                    log.warn("No PENDING transaction found with amount {} in last 30 minutes", amount);
                }
            }
            
            if (transaction == null) {
                log.warn("No transaction found for webhook payload");
                return ResponseEntity.ok(Map.of("status", "error", "message", "No matching transaction found"));
            }
            
            // Check if transaction is already processed
            if (transaction.getStatus() == TransactionStatus.COMPLETED) {
                log.info("Transaction {} already completed", transactionRef);
                return ResponseEntity.ok(Map.of("status", "success", "message", "Transaction already completed"));
            }
            
            // Process webhook based on status
            if ("SUCCESS".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
                // Verify amount if provided
                if (amount != null && transaction.getAmount().compareTo(amount) != 0) {
                    log.error("Amount mismatch for transaction {}. Expected: {}, Received: {}", 
                            transactionRef, transaction.getAmount(), amount);
                    return ResponseEntity.ok(Map.of("status", "error", "message", "Amount mismatch"));
                }
                
                // Update transaction status to COMPLETED
                transaction.setStatus(TransactionStatus.COMPLETED);
                transaction.setProcessedAt(ZonedDateTime.now());
                transaction.setGatewayTransactionId(gatewayTransactionId);
                transaction.setBalanceAfter(transaction.getBalanceBefore().add(transaction.getAmount()));
                transactionRepository.save(transaction);
                
                // Update user credit balance
                User user = transaction.getUser();
                user.setCreditBalance(user.getCreditBalance().add(transaction.getAmount()));
                userRepository.save(user);
                
                log.info("Transaction {} completed successfully. User {} credit updated from {} to {}", 
                        transactionRef, user.getUsername(), transaction.getBalanceBefore(), user.getCreditBalance());
                
                return ResponseEntity.ok(Map.of("status", "success", "message", "Transaction completed successfully"));
                
            } else if ("FAILED".equalsIgnoreCase(status) || "CANCELLED".equalsIgnoreCase(status)) {
                // Update transaction status to FAILED
                transaction.setStatus(TransactionStatus.FAILED);
                transaction.setProcessedAt(ZonedDateTime.now());
                transaction.setGatewayTransactionId(gatewayTransactionId);
                transactionRepository.save(transaction);
                
                log.warn("Transaction {} failed/cancelled", transactionRef);
                return ResponseEntity.ok(Map.of("status", "success", "message", "Transaction marked as failed"));
                
            } else {
                log.info("Webhook received for transaction {} with status {}. No action taken.", transactionRef, status);
                return ResponseEntity.ok(Map.of("status", "success", "message", "Webhook received, no action needed"));
            }
            
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("status", "error", "message", "Error processing webhook: " + e.getMessage()));
        }
    }

    @PostMapping("/**")
    public ResponseEntity<?> catchAllWebhook(@RequestBody String payload) {
        log.info("=== CATCH-ALL WEBHOOK RECEIVED ===");
        log.info("Raw payload: {}", payload);
        log.info("Payload length: {}", payload.length());
        return ResponseEntity.ok(Map.of("caught", true, "payload", payload));
    }

    @PostMapping("/debug")
    public ResponseEntity<?> debugWebhook(@RequestBody String payload) {
        log.info("=== DEBUG WEBHOOK ENDPOINT ===");
        log.info("Raw payload: {}", payload);
        return ResponseEntity.ok(Map.of("received", true, "payload", payload));
    }

    @GetMapping("/status/{transactionRef}")
    public ResponseEntity<?> checkStatus(@PathVariable String transactionRef) {
        log.info("Checking status for transactionRef: {}", transactionRef);
        
        try {
            Optional<Transaction> optionalTransaction = transactionRepository.findByTransactionRef(transactionRef);
            
            if (optionalTransaction.isEmpty()) {
                return ResponseEntity.ok(Map.of("transactionRef", transactionRef, "status", "NOT_FOUND"));
            }
            
            Transaction transaction = optionalTransaction.get();
            
            Map<String, Object> response = Map.of(
                "transactionRef", transactionRef,
                "status", transaction.getStatus().name(),
                "amount", transaction.getAmount(),
                "description", transaction.getDescription(),
                "createdAt", transaction.getCreatedAt(),
                "processedAt", transaction.getProcessedAt()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error checking status for transactionRef {}: {}", transactionRef, e.getMessage(), e);
            return ResponseEntity.ok(Map.of("transactionRef", transactionRef, "status", "ERROR"));
        }
    }
}


