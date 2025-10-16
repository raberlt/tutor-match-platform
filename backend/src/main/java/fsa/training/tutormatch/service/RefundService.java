package fsa.training.tutormatch.service;

public interface RefundService {
    enum RefundMethod { BANK, CREDIT }

    void computeAndApplyRefundForBooking(Integer bookingId, String actor, RefundMethod method);
}


