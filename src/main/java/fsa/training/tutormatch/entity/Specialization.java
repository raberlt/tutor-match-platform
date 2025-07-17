package fsa.training.tutormatch.entity;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "specializations")
public class Specialization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // VD: Toán, Lý, Hóa

    @ManyToMany(mappedBy = "specializations")
    private List<Profile> profiles;

    // getters, setters
}
