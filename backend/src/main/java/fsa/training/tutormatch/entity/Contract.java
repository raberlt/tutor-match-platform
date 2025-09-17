package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.time.LocalDate;

@Entity
@Table(name = "contracts")
@Data
public class Contract {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @Column(name = "contract_number", unique = true, nullable = false)
    private String contractNumber;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "total_sessions", nullable = false)
    private Integer totalSessions;
    
    @Column(name = "sessions_completed", nullable = false)
    private Integer sessionsCompleted = 0;
    
    @Column(name = "monthly_fee", nullable = false)
    private Double monthlyFee;
    
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;
    
    @Column(name = "contract_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ContractStatus contractStatus = ContractStatus.PENDING;
    
    @Column(name = "contract_file_path")
    private String contractFilePath;
    
    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Timestamp updatedAt;
    
    public enum ContractStatus {
        PENDING("Chờ duyệt"),
        APPROVED("Đã duyệt"),
        ACTIVE("Đang hoạt động"),
        COMPLETED("Hoàn thành"),
        CANCELLED("Đã hủy"),
        EXPIRED("Hết hạn");
        
        private final String displayName;
        
        ContractStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
