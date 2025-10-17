package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.User;
import java.math.BigDecimal;

public interface SepayService {
    String createPayment(User user, BigDecimal amount, String transactionRef);
    boolean verifyWebhookSignature(String payload, String signature);
    boolean processWebhook(String payload);
    String checkPaymentStatus(String transactionRef);
}

 