package fsa.training.tutormatch.dto;

import lombok.Data;

import java.util.List;

@Data
public class TutorDTO {
    private Integer id;
    private String firstName;
    private String lastName;
    private String imageAvatar;
    private String bio;
    private String headline;
    private Integer fees;
    private Double ratePointAverage;
    private Integer totalPoint;
    private List<String> subjects;
}
