package fsa.training.tutormatch.controller.credit;

import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.TransactionStatus;
import fsa.training.tutormatch.enums.TransactionType;
import fsa.training.tutormatch.service.CreditService;
import fsa.training.tutormatch.service.TransactionService;
import fsa.training.tutormatch.service.SepayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credit")
@RequiredArgsConstructor
public class CreditController {

    private final CreditService creditService;
    private final UserRepository userRepository;
    private final TransactionService transactionService;
    private final SepayService sepayService;

    /**
     * Nạp tín dụng cho user (alias cho deposit)
     */
    @PostMapping("/top-up")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR')")
    public ResponseEntity<?> topUpCredit(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = request.get("description") != null ? request.get("description").toString() : "Nạp tín dụng";

            // 1) Tạo transaction PENDING (chưa cộng tiền)
            String transactionRef = Transaction.generateTransactionRef();
            Transaction transaction = new Transaction();
            transaction.setUser(user);
            transaction.setPayment(null);
            transaction.setBooking(null);
            transaction.setType(TransactionType.DEPOSIT);
            transaction.setMethod(PaymentMethod.CREDIT);
            transaction.setStatus(TransactionStatus.PENDING);
            transaction.setAmount(amount);
            transaction.setDescription(description);
            transaction.setTransactionRef(transactionRef);
            transaction.setBalanceBefore(user.getCreditBalance());
            transaction = transactionService.createTransaction(transaction);

            // 2) Gọi Sepay tạo URL thanh toán/QR (webhook sẽ cập nhật số dư khi SUCCESS)
            String qrCodeUrl = sepayService.createPayment(user, amount, transactionRef);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo giao dịch nạp tín dụng thành công. Vui lòng quét/đi tới URL để thanh toán.");
            response.put("transactionId", transaction.getId());
            response.put("transactionRef", transactionRef);
            response.put("amount", amount);
            response.put("newBalance", user.getCreditBalance()); // chưa thay đổi cho tới khi webhook SUCCESS
            response.put("qrCodeUrl", qrCodeUrl); // tái sử dụng field để FE hiển thị

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi nạp tín dụng: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Nạp tín dụng cho user
     */
    @PostMapping("/deposit")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR')")
    public ResponseEntity<?> depositCredit(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = request.getOrDefault("description", "Credit deposit").toString();

            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Số tiền nạp phải lớn hơn 0"
                ));
            }

            Transaction transaction = creditService.depositCredit(
                    user, amount, description, "DEPOSIT_" + System.currentTimeMillis()
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Nạp tín dụng thành công",
                    "transactionId", transaction.getId(),
                    "amount", amount,
                    "newBalance", user.getCreditBalance()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Nạp tín dụng thất bại: " + e.getMessage()
            ));
        }
    }

    /**
     * Lấy số dư tín dụng hiện tại
     */
    @GetMapping("/balance")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR')")
    public ResponseEntity<?> getCreditBalance(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            BigDecimal balance = creditService.getCurrentBalance(user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "balance", balance,
                    "currency", "VND"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Không thể lấy số dư tín dụng: " + e.getMessage()
            ));
        }
    }

    /**
     * Lấy lịch sử giao dịch tín dụng
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR')")
    public ResponseEntity<?> getCreditHistory(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Transaction> transactions = creditService.getTransactionHistory(user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "transactions", transactions
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Không thể lấy lịch sử giao dịch: " + e.getMessage()
            ));
        }
    }
}

