package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // STUDENT, TUTOR, ADMIN

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Profile profile;

    // getters, setters
}
