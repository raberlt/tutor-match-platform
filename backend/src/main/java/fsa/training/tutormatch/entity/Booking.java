package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;

@Entity
@Data
@Table(name = "bookings")
@EqualsAndHashCode(exclude = {"student", "tutor"})
@ToString(exclude = {"student", "tutor"})
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;   // ✅ đổi User -> StudentProfile

    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private TutorProfile tutor;       // ✅ đổi User -> TutorProfile

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    private Date date;
    private Time fromTime;
    private Time toTime;
    
    @Column(columnDefinition = "NVARCHAR(100)")
    private String time; // Time slot as string for backward compatibility

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private BookingType bookingType = BookingType.TRIAL;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String note;

    // Payment fields
    @Column(name = "amount", nullable = false)
    private Double amount;
    
    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Column(name = "payment_reference")
    private String paymentReference;
    
    @Column(name = "payment_date")
    private Timestamp paymentDate;

    // Contract fields (for package booking)
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Contract contract;
    
    @Column(name = "contract_duration") // Số tháng
    private Integer contractDuration;
    
    @Column(name = "sessions_per_week")
    private Integer sessionsPerWeek;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;
    
    // Helper method for backward compatibility
    public Double getTotalAmount() {
        return this.amount;
    }
    
    public void setTotalAmount(Double totalAmount) {
        this.amount = totalAmount;
    }
    
    // Payment status enum
    public enum PaymentStatus {
        PENDING("Chờ thanh toán"),
        COMPLETED("Đã thanh toán"),
        FAILED("Thanh toán thất bại"),
        REFUNDED("Đã hoàn tiền");
        
        private final String displayName;
        
        PaymentStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
