package fsa.training.tutormatch.service;

import java.math.BigDecimal;

public interface QRCodeService {
    
    /**
     * Tạo URL QR code cho nạp tín dụng
     * @param amount Số tiền nạp
     * @param transactionRef Mã giao dịch
     * @return URL QR code
     */
    String generateTopUpQRCode(BigDecimal amount, String transactionRef);
    
    /**
     * Tạo URL QR code cho thanh toán
     * @param amount Số tiền thanh toán
     * @param transactionRef Mã giao dịch
     * @return URL QR code
     */
    String generatePaymentQRCode(BigDecimal amount, String transactionRef);
}
