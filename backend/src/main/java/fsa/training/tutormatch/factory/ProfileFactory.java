package fsa.training.tutormatch.factory;

import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.*;
import org.springframework.stereotype.Component;

@Component
public class ProfileFactory {

    public StudentProfile createStudentProfile(User user) {
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setProfileStatus(ProfileStatus.ACTIVE);
        return profile;
    }

    public TutorProfile createTutorProfile(User user) {
        TutorProfile profile = new TutorProfile();
        profile.setUser(user);
        profile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
        return profile;
    }
}