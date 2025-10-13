package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.service.SePayService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class SePayServiceImpl implements SePayService {
    
    @Override
    public SePayQRResponse createQRPayment(String orderId, BigDecimal amount, String description, String callbackUrl) {
        log.info("Creating SePay QR payment for order: {}, amount: {}, callback: {}", orderId, amount, callbackUrl);
        
        // TODO: Implement actual SePay integration
        SePayQRResponse response = new SePayQRResponse();
        response.setSuccess(true);
        response.setQrCodeUrl("https://example.com/qr/" + orderId);
        response.setOrderId(orderId);
        response.setMessage("QR payment created successfully");
        
        return response;
    }
    
    @Override
    public SePayRefundResponse refundPayment(String orderId, BigDecimal amount, String reason) {
        log.info("Processing SePay refund for order: {}, amount: {}", orderId, amount);
        
        // TODO: Implement actual SePay refund integration
        SePayRefundResponse response = new SePayRefundResponse();
        response.setSuccess(true);
        response.setTransactionId("REFUND_" + orderId);
        response.setMessage("Refund processed successfully");
        
        return response;
    }
    
    @Override
    public SePayStatusResponse checkPaymentStatus(String orderId) {
        log.info("Checking SePay payment status for order: {}", orderId);
        
        // TODO: Implement actual SePay status check integration
        SePayStatusResponse response = new SePayStatusResponse();
        response.setSuccess(true);
        response.setStatus("COMPLETED");
        response.setMessage("Payment status checked successfully");
        response.setOrderId(orderId);
        response.setAmount(BigDecimal.valueOf(100000)); // Mock amount
        
        return response;
    }
}
