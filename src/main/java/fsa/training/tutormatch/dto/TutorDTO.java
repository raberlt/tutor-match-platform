package fsa.training.tutormatch.dto;

import lombok.Data;
import java.util.List;

@Data
public class TutorDTO {
    private Integer id;
    private String fullName;
    private String headline;
    private String bio;
    private List<String> subjects;
    private int fees;
    private double averageRating;
    private String avatarUrl;
}
