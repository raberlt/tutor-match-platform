package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;

@Entity
@Data
@Table(name = "coupons")
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, columnDefinition = "NVARCHAR(50)")
    private String code; // Mã giảm giá (SUMMER2024, TRIAL50, etc.)

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
    private Date startDate; // Ngày bắt đầu

    @Column(nullable = false)
    private Date endDate; // Ngày kết thúc

    @Column(nullable = false)
    private Integer usageLimit; // Số lần sử dụng tối đa

    @Column(nullable = false)
    private Integer usedCount = 0; // Số lần đã sử dụng

    @Column(nullable = false)
    private Integer usageLimitPerUser = 1; // Số lần mỗi user có thể sử dụng

    @Enumerated(EnumType.STRING)
    private CouponStatus status = CouponStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    private ApplicableBookingType applicableBookingType; // Áp dụng cho loại booking nào

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy; // Admin tạo mã

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;

    public enum DiscountType {
        PERCENTAGE, // Giảm theo %
        FIXED_AMOUNT // Giảm số tiền cố định
    }

    public enum CouponStatus {
        ACTIVE,   // Đang hoạt động
        INACTIVE, // Tạm dừng
        EXPIRED,  // Hết hạn
        DELETED   // Đã xóa
    }

    public enum ApplicableBookingType {
        ALL,        // Tất cả loại booking
        TRIAL,      // Chỉ học thử
        MONTHLY,    // Chỉ hàng tháng
        CONTRACT    // Chỉ hợp đồng
    }
} 