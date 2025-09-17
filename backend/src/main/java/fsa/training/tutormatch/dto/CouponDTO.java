package fsa.training.tutormatch.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CouponDTO {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderAmount;
    private String startDate;
    private String endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer usageLimitPerUser;
    private String status;
    private String applicableBookingType;
    private String createdBy;
} 