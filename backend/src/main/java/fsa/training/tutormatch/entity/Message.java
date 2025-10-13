package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;

@Entity
@Data
@Table(name = "messages")
@EqualsAndHashCode(exclude = {"sender", "receiver"})
@ToString(exclude = {"sender", "receiver"})
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false, columnDefinition = "NVARCHAR(1000)")
    private String content;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private ZonedDateTime readAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    // Helper methods for JSON serialization
    public Integer getSenderId() {
        return sender != null ? sender.getId() : null;
    }

    public String getSenderName() {
        return sender != null ? sender.getFullName() : null;
    }

    public Integer getReceiverId() {
        return receiver != null ? receiver.getId() : null;
    }

    public String getReceiverName() {
        return receiver != null ? receiver.getFullName() : null;
    }
}