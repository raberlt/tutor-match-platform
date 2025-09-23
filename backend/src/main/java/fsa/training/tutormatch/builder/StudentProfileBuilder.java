package fsa.training.tutormatch.builder;

import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.EducationLevel;
import java.time.ZonedDateTime;
import java.time.ZoneId;

public class StudentProfileBuilder {
    private StudentProfile profile;

    private StudentProfileBuilder(User user) {
        this.profile = new StudentProfile();
        this.profile.setUser(user);
        this.profile.setCreatedAt(ZonedDateTime.now(ZoneId.systemDefault()));
        this.profile.setUpdatedAt(ZonedDateTime.now(ZoneId.systemDefault()));
    }

    public static StudentProfileBuilder builderFor(User user) {
        return new StudentProfileBuilder(user);
    }

    public StudentProfileBuilder withEducationLevel(EducationLevel educationLevel) {
        this.profile.setEducationLevel(educationLevel);
        return this;
    }

    // phoneNumber, firstName, lastName, address, imageAvatar, dateOfBirth, gender đã được chuyển về User

    public StudentProfile build() {
        // Set default values if not provided
        if (profile.getEducationLevel() == null) {
            profile.setEducationLevel(EducationLevel.INDEPENDENT_LEARNER);
        }
        return profile;
    }
}