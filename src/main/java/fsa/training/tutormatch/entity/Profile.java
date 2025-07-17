package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "profiles")
public class Profile {
    @Id
    private Long id; // Same as Account ID

    @OneToOne
    @MapsId
    @JoinColumn(name = "account_id")
    private User user;

    private String fullName;
    private String email;
    private String address;
    private String phone;

    @ManyToMany
    @JoinTable(
            name = "profile_specializations",
            joinColumns = @JoinColumn(name = "profile_id"),
            inverseJoinColumns = @JoinColumn(name = "specialization_id")
    )
    private List<Specialization> specializations;

    private String description; // Nếu là Tutor

    // getters, setters
}
