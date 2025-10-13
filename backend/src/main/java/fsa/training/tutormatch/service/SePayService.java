package fsa.training.tutormatch.service;

import java.math.BigDecimal;

public interface SePayService {
    
    // SePay QR payment
    SePayQRResponse createQRPayment(String orderId, BigDecimal amount, String description, String callbackUrl);
    SePayRefundResponse refundPayment(String orderId, BigDecimal amount, String reason);
    SePayStatusResponse checkPaymentStatus(String orderId);
    
    // Inner classes for SePay responses
    class SePayQRResponse {
        private boolean success;
        private String qrCodeUrl;
        private String orderId;
        private String message;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getQrCodeUrl() { return qrCodeUrl; }
        public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
        
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    class SePayRefundResponse {
        private boolean success;
        private String transactionId;
        private String message;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    class SePayStatusResponse {
        private boolean success;
        private String status;
        private String message;
        private String orderId;
        private BigDecimal amount;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }
}
