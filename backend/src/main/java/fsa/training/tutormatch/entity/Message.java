package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "messages")
@EqualsAndHashCode(exclude = {"sender", "receiver"})
@ToString(exclude = {"sender", "receiver"})
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "Sender is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnore
    private User sender;

    @NotNull(message = "Receiver is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    @JsonIgnore
    private User receiver;

    @NotBlank(message = "Message content is required")
    @Size(max = 1000, message = "Message content must not exceed 1000 characters")
    @Column(nullable = false, columnDefinition = "NVARCHAR(1000)")
    private String content;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods for JSON serialization
    public Integer getSenderId() {
        return sender != null ? sender.getId() : null;
    }

    public String getSenderName() {
        return sender != null ? sender.getFirstName() + " " + sender.getLastName() : null;
    }

    public String getSenderRole() {
        return sender != null ? sender.getRole().toString() : null;
    }

    public Integer getReceiverId() {
        return receiver != null ? receiver.getId() : null;
    }

    public String getReceiverName() {
        return receiver != null ? receiver.getFirstName() + " " + receiver.getLastName() : null;
    }

    public String getReceiverRole() {
        return receiver != null ? receiver.getRole().toString() : null;
    }
}

