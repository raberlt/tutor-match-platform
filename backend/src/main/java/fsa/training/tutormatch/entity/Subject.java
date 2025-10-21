package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.ZonedDateTime;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false, unique = true, columnDefinition = "NVARCHAR(100)")
    private String name;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    // @Enumerated(EnumType.STRING)
    // @Column(name = "category", nullable = false)
    // private SubjectCategory category;

    // @Enumerated(EnumType.STRING)
    // @Column(name = "level", nullable = false)
    // private SubjectLevel level;

    // @Column(name = "is_active", nullable = false)
    // private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    // Constructors
    public Subject() {}

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // public SubjectCategory getCategory() {
    //     return category;
    // }

    // public void setCategory(SubjectCategory category) {
    //     this.category = category;
    // }

    // public SubjectLevel getLevel() {
    //     return level;
    // }

    // public void setLevel(SubjectLevel level) {
    //     this.level = level;
    // }

    // public Boolean getIsActive() {
    //     return isActive;
    // }

    // public void setIsActive(Boolean isActive) {
    //     this.isActive = isActive;
    // }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ZonedDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(ZonedDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}