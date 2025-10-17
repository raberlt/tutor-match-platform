package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.service.QRCodeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class QRCodeServiceImpl implements QRCodeService {
    
    @Value("${app.qr.sepay.account:VQRQAESPZ4646}")
    private String sepayAccount;
    
    @Value("${app.qr.sepay.bank:MBBank}")
    private String sepayBank;
    
    @Override
    public String generateTopUpQRCode(BigDecimal amount, String transactionRef) {
        try {
            // Tạo mô tả giao dịch
            String description = "Nạp tín dụng - " + transactionRef;
            
            // Tạo URL QR code
            String qrUrl = String.format(
                "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s",
                sepayAccount,
                sepayBank,
                amount.intValue(),
                URLEncoder.encode(description, StandardCharsets.UTF_8.toString())
            );
            
            log.info("Generated QR code for top-up: amount={}, transactionRef={}, qrUrl={}", 
                    amount, transactionRef, qrUrl);
            
            return qrUrl;
        } catch (Exception e) {
            log.error("Error generating QR code for top-up: amount={}, transactionRef={}", 
                    amount, transactionRef, e);
            throw new RuntimeException("Không thể tạo QR code", e);
        }
    }
    
    @Override
    public String generatePaymentQRCode(BigDecimal amount, String transactionRef) {
        try {
            // Tạo mô tả giao dịch
            String description = "Thanh toán - " + transactionRef;
            
            // Tạo URL QR code
            String qrUrl = String.format(
                "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s",
                sepayAccount,
                sepayBank,
                amount.intValue(),
                URLEncoder.encode(description, StandardCharsets.UTF_8.toString())
            );
            
            log.info("Generated QR code for payment: amount={}, transactionRef={}, qrUrl={}", 
                    amount, transactionRef, qrUrl);
            
            return qrUrl;
        } catch (Exception e) {
            log.error("Error generating QR code for payment: amount={}, transactionRef={}", 
                    amount, transactionRef, e);
            throw new RuntimeException("Không thể tạo QR code", e);
        }
    }
}
