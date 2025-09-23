package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import fsa.training.tutormatch.enums.DiscountType;
import fsa.training.tutormatch.enums.CouponStatus;
import fsa.training.tutormatch.enums.BookingType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.ZoneId;

@Entity
@Data
@Table(name = "coupons")
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, columnDefinition = "NVARCHAR(50)")
    private String code; // Mã giảm giá (SUMMER2024, SINGLE50, etc.)

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name; // Tên chương trình giảm giá

    @Column(columnDefinition = "NVARCHAR(500)")
    private String description; // Mô tả

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue; // Giá trị giảm (% hoặc số tiền)

    @Column(precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount; // Số tiền giảm tối đa

    @Column(precision = 10, scale = 2)
    private BigDecimal minOrderAmount; // Giá trị đơn hàng tối thiểu

    @Column(nullable = false)
    private LocalDate startDate; // Ngày bắt đầu

    @Column(nullable = false)
    private LocalDate endDate; // Ngày kết thúc

    @Column(nullable = false)
    private Integer usageLimit; // Số lần sử dụng tối đa

    @Column(nullable = false)
    private Integer usedCount = 0; // Số lần đã sử dụng

    @Column(nullable = false)
    private Integer usageLimitPerUser = 1; // Số lần mỗi user có thể sử dụng

    @Enumerated(EnumType.STRING)
    private CouponStatus status = CouponStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    private BookingType applicableBookingType; // Áp dụng cho loại booking nào

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy; // Admin tạo mã

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;
    
    // Helper methods for timezone handling
    public ZonedDateTime getCreatedAtInTimezone(String timezoneId) {
        return createdAt != null ? createdAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
    
    public ZonedDateTime getUpdatedAtInTimezone(String timezoneId) {
        return updatedAt != null ? updatedAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
}