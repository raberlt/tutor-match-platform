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
    public Profile save(Profile profile, String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User không tồn tại: " + username);
        }

        User user = userOptional.get();
        profile.setUser(user);
        user.setProfile(profile);

        userRepository.save(user); // Cập nhật quan hệ
        return profileRepository.save(profile);
    }


    public Profile createProfileForUser(Profile profile, Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("User ID không tồn tại");
        }
        profile.setUser(optionalUser.get());
        return profileRepository.save(profile);
    }

    public Profile updateProfile(Long profileId, Profile updatedProfile) {
        Optional<Profile> optionalProfile = profileRepository.findById(profileId);
        if (optionalProfile.isEmpty()) {
            throw new IllegalArgumentException("Profile ID không tồn tại");
        }

        Profile profile = optionalProfile.get();
        if (updatedProfile.getFullName() != null) profile.setFullName(updatedProfile.getFullName());
        if (updatedProfile.getPhone() != null) profile.setPhone(updatedProfile.getPhone());
        if (updatedProfile.getAddress() != null) profile.setAddress(updatedProfile.getAddress());
        if (updatedProfile.getDescription() != null) profile.setDescription(updatedProfile.getDescription());

        return profileRepository.save(profile);
    }
}
