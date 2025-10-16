package fsa.training.tutormatch.entity;

import fsa.training.tutormatch.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "sessions")
@EqualsAndHashCode(exclude = {"booking", "changeHistory"})
@ToString(exclude = {"booking", "changeHistory"})
public class Session {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Mã session duy nhất (SS-2024-001, SS-2024-002, ...)
    @Column(name = "session_code", unique = true, nullable = false, columnDefinition = "NVARCHAR(20)")
    private String sessionCode;
    
    // Foreign Key to Booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    // Session Info
    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;
    
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    
    // Subject & fee for this session
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Column(name = "fee", precision = 10, scale = 2)
    private BigDecimal fee;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.PAYMENT_PENDING;
    
    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
    
    @Column(name = "reschedule_count", nullable = false)
    private Integer rescheduleCount = 0;
    
    // One-to-Many relationship with session change history
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SessionChangeHistory> changeHistory;
    
    @PrePersist
    public void setDefaultValuesOnCreate() {
        // Tự động tạo session code nếu chưa có
        if (this.sessionCode == null || this.sessionCode.isEmpty()) {
            this.sessionCode = generateSessionCode();
        }
    }
    
    // Helper method để tạo session code ngắn gọn (<= 20 ký tự) và vẫn duy nhất
    private String generateSessionCode() {
        java.time.LocalDate nowDate = java.time.LocalDate.now();
        java.time.LocalTime nowTime = java.time.LocalTime.now();
        String y = String.valueOf(nowDate.getYear()).substring(2);     // YY
        String m = String.format("%02d", nowDate.getMonthValue());     // MM
        String d = String.format("%02d", nowDate.getDayOfMonth());     // DD
        String hh = String.format("%02d", nowTime.getHour());          // HH
        String mm = String.format("%02d", nowTime.getMinute());        // MM
        String ss = String.format("%02d", nowTime.getSecond());        // SS
        // hậu tố ngẫu nhiên 2 ký tự [A-Z0-9]
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        java.util.Random rnd = new java.util.Random();
        String suffix = "" + chars.charAt(rnd.nextInt(chars.length())) + chars.charAt(rnd.nextInt(chars.length()));
        // Định dạng: SS + YYMMDD + HHMMSS + 2 ký tự = tối đa 2+6+6+2 = 16 ký tự
        return "SS" + y + m + d + hh + mm + ss + suffix;
    }
}
