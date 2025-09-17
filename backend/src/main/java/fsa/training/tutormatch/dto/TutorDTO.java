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
    private String experience;
    private String teachingLevel;
    private Integer fees;
    private Double ratePointAverage;
    private Integer totalPoint;
    private String city;
    private List<SubjectDTO> subjects;
    private List<ScheduleDTO> schedules;

    @Data
    public static class SubjectDTO {
        private Integer id;
        private String name;

        public SubjectDTO(Integer id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    @Data
    public static class ScheduleDTO {
        private Integer id;
        private String dayOfWeek;
        private String fromTime;
        private String toTime;

        public ScheduleDTO(Integer id, String dayOfWeek, String fromTime, String toTime) {
            this.id = id;
            this.dayOfWeek = dayOfWeek;
            this.fromTime = fromTime;
            this.toTime = toTime;
        }
    }
}
