package fsa.training.tutormatch.factory;

import fsa.training.tutormatch.entity.BaseProfile;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ProfileFactory {

    public StudentProfile createStudentProfile(User user) {
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setProfileStatus(BaseProfile.ProfileStatus.ACTIVE);
        return profile;
    }

    public TutorProfile createTutorProfile(User user) {
        TutorProfile profile = new TutorProfile();
        profile.setUser(user);
        profile.setProfileStatus(BaseProfile.ProfileStatus.PENDING_VERIFICATION);
        return profile;
    }
}