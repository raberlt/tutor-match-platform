package fsa.training.tutormatch.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.TransactionStatus;
import fsa.training.tutormatch.repository.TransactionRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.SepayService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SepayServiceImpl implements SepayService {

    @Value("${app.sepay.api-key}")
    private String sepayApiKey;

    @Value("${app.sepay.secret-key}")
    private String sepaySecretKey;

    @Value("${app.sepay.base-url}")
    private String sepayBaseUrl;

    @Value("${app.sepay.webhook-url}")
    private String sepayWebhookUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    public String createPayment(User user, BigDecimal amount, String transactionRef) {
        // Tạo URL QR (demo). Khi cần gọi API Sepay thật, thay bằng HTTP POST.
        return String.format(
                "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
                "VQRQAESPZ4646", "MBBank", amount.toBigInteger(), transactionRef
        );
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        if (signature == null) return true; // tuỳ chọn verify, demo cho qua nếu thiếu header
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(sepaySecretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String hash = Base64.getEncoder().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            return hash.equals(signature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            return false;
        }
    }

    @Override
    @Transactional
    public boolean processWebhook(String payload) {
        try {
            JsonNode json = objectMapper.readTree(payload);
            String orderId = json.path("order_id").asText(null);
            String status = json.path("status").asText(null);
            BigDecimal amount = json.has("amount") ? new BigDecimal(json.get("amount").asText()) : null;
            String gatewayTransactionId = json.path("transaction_id").asText(null);

            if (orderId == null || status == null || amount == null) {
                return false;
            }

            Optional<Transaction> opt = transactionRepository.findByTransactionRef(orderId);
            if (opt.isEmpty()) return false;

            Transaction tx = opt.get();
            if (tx.getStatus() == TransactionStatus.COMPLETED) return true;

            if ("SUCCESS".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
                if (tx.getAmount().compareTo(amount) != 0) return false;
                tx.setStatus(TransactionStatus.COMPLETED);
                tx.setGatewayTransactionId(gatewayTransactionId);
                tx.setBalanceAfter(tx.getBalanceBefore().add(amount));
                transactionRepository.save(tx);

                User user = tx.getUser();
                user.setCreditBalance(user.getCreditBalance().add(amount));
                userRepository.save(user);
                return true;
            }

            if ("FAILED".equalsIgnoreCase(status) || "CANCELLED".equalsIgnoreCase(status)) {
                tx.setStatus(TransactionStatus.FAILED);
                tx.setGatewayTransactionId(gatewayTransactionId);
                transactionRepository.save(tx);
                return true;
            }

            return true; // các trạng thái khác: bỏ qua
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String checkPaymentStatus(String transactionRef) {
        return transactionRepository.findByTransactionRef(transactionRef)
                .map(t -> t.getStatus().name())
                .orElse("NOT_FOUND");
    }
}

 