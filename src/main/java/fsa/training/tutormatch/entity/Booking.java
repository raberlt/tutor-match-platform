package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "tutor_id")
    private User tutor;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // PENDING, ACCEPTED, REJECTED

    private String note; // Ghi chú thêm nếu có

    // getters, setters
}
