package fsa.training.tutormatch.builder;

import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.ProfileStatus;
import java.time.ZonedDateTime;
import java.time.ZoneId;

public class TutorProfileBuilder {
    private TutorProfile profile;

    private TutorProfileBuilder(User user) {
        this.profile = new TutorProfile();
        this.profile.setUser(user);
        this.profile.setCreatedAt(ZonedDateTime.now(ZoneId.systemDefault()));
        this.profile.setUpdatedAt(ZonedDateTime.now(ZoneId.systemDefault()));
        // ProfileType không cần set vì TutorProfile đã có @DiscriminatorValue
        this.profile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
    }

    public static TutorProfileBuilder builderFor(User user) {
        return new TutorProfileBuilder(user);
    }

    public TutorProfileBuilder withBio(String bio) {
        this.profile.setBio(bio);
        return this;
    }

    public TutorProfileBuilder withHeadline(String headline) {
        this.profile.setHeadline(headline);
        return this;
    }

    public TutorProfileBuilder withExperience(String experience) {
        this.profile.setExperience(experience);
        return this;
    }

    // withFees removed - fees are now per subject in TutorProfileSubject

    public TutorProfileBuilder withTeachingLevel(String teachingLevel) {
        this.profile.setTeachingLevel(teachingLevel);
        return this;
    }

    public TutorProfileBuilder withVideoIntro(String videoIntro) {
        this.profile.setVideoIntro(videoIntro);
        return this;
    }

    public TutorProfileBuilder withRating(Double rating, Integer totalPoint) {
        this.profile.setRatePointAverage(rating);
        this.profile.setTotalPoint(totalPoint);
        return this;
    }

    public TutorProfile build() {
        // Set default values if not provided
        if (profile.getBio() == null || profile.getBio().isEmpty()) {
            profile.setBio("Experienced and dedicated tutor.");
        }
        if (profile.getHeadline() == null || profile.getHeadline().isEmpty()) {
            profile.setHeadline("Professional Tutor");
        }
        if (profile.getExperience() == null || profile.getExperience().isEmpty()) {
            profile.setExperience("Passionate educator with years of teaching experience, specializing in personalized learning approaches.");
        }
        // Default values for fees are now handled per subject in TutorProfileSubject
        if (profile.getTeachingLevel() == null || profile.getTeachingLevel().isEmpty()) {
            profile.setTeachingLevel("High School");
        }
        if (profile.getRatePointAverage() == null) {
            profile.setRatePointAverage(5.0);
        }
        if (profile.getTotalPoint() == null) {
            profile.setTotalPoint(0);
        }
        return profile;
    }
}