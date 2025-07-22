package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.ProfileRepository;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<Profile> findById(Long profileId) {
        return profileRepository.findById(profileId);
    }

    public Optional<Profile> findByTutorId(Integer tutorId) {
        return profileRepository.findByTutorId(tutorId);
    }

    public Profile save(Profile profile, String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User không tồn tại: " + username);
        }

        User user = userOptional.get();
        profile.setTutor(user);  // Sửa lại ở đây
        return profileRepository.save(profile);
    }


    public Profile updateProfile(Long profileId, Profile updatedProfile) {
        Optional<Profile> optionalProfile = profileRepository.findById(profileId);
        if (optionalProfile.isEmpty()) {
            throw new IllegalArgumentException("Profile ID không tồn tại");
        }

        Profile profile = optionalProfile.get();
        if (updatedProfile.getBio() != null) profile.setBio(updatedProfile.getBio());
        if (updatedProfile.getHeadline() != null) profile.setHeadline(updatedProfile.getHeadline());
        if (updatedProfile.getExperience() != null) profile.setExperience(updatedProfile.getExperience());
        if (updatedProfile.getTeachingLevel() != null) profile.setTeachingLevel(updatedProfile.getTeachingLevel());
        if (updatedProfile.getFees() != null) profile.setFees(updatedProfile.getFees());

        return profileRepository.save(profile);
    }
}
