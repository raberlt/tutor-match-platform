package fsa.training.tutormatch.controller.profile;

import fsa.training.tutormatch.dto.ProfileUpdateRequest;
import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.enums.*;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.ProfileRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// import java.sql.Date; // Not needed anymore
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserService userService;

    /**
     * Lấy thông tin profile hiện tại
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            //  Đổi từ findByTutorId(...) sang findByUserId(...)
            Optional<Profile> profileOpt = profileRepository.findByUserId(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", Map.of(
                    "id", user.getId(),
                    "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                    "lastName", user.getLastName() != null ? user.getLastName() : "",
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "role", user.getRole().toString()
                    // "enabled", user.isEnabled() // enabled field removed
            ));

            if (profileOpt.isPresent()) {
                Profile baseProfile = profileOpt.get();
                Map<String, Object> profileData = new HashMap<>();

                // Các field chung cho mọi profile
                profileData.put("id", baseProfile.getId());
                profileData.put("phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
                profileData.put("addressLine1", user.getAddress() != null ? user.getAddress() : "");
                // Removed fields: educationLevel (moved to User), university, major, city
                profileData.put("dateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : "");
                profileData.put("gender", user.getGender() != null ? user.getGender().toString() : "");
                // isVerified moved to TutorProfile only
                if (baseProfile instanceof TutorProfile) {
                    TutorProfile tp = (TutorProfile) baseProfile;
                    profileData.put("isVerified", tp.getUser().isVerified());
                } else {
                    profileData.put("isVerified", false);
                }
                profileData.put("profileStatus", baseProfile.getEnable() ? "ENABLED" : "DISABLED");

                // Nếu là TutorProfile thì thêm các field đặc thù
                if (baseProfile instanceof TutorProfile tutorProfile) {
                    profileData.put("bio", tutorProfile.getBio() != null ? tutorProfile.getBio() : "");
                    profileData.put("headline", tutorProfile.getHeadline() != null ? tutorProfile.getHeadline() : "");
                    profileData.put("fees", tutorProfile.getFees() != null ? tutorProfile.getFees() : 0);
                    profileData.put("experience", tutorProfile.getExperience() != null ? tutorProfile.getExperience() : "");
                }

                response.put("profile", profileData);
            } else {
                response.put("profile", null);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", "Lỗi khi lấy thông tin profile: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật thông tin profile
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@Valid @RequestBody ProfileUpdateRequest request,
                                             Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update User basic info
            boolean userUpdated = false;
            if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
                user.setFirstName(request.getFirstName().trim());
                userUpdated = true;
            }
            if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
                user.setLastName(request.getLastName().trim());
                userUpdated = true;
            }
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
                if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                    return ResponseEntity.badRequest().body(
                            Map.of("success", false, "error", "Email đã được sử dụng bởi tài khoản khác!")
                    );
                }
                user.setEmail(request.getEmail().trim());
                userUpdated = true;
            }

            if (userUpdated) {
                userRepository.save(user);
            }

            // Load or create BaseProfile
            Profile profile = profileRepository.findByUserId(user.getId())
                    .orElseGet(() -> {
                        if (user.getRole() == UserRole.TUTOR) {
                            TutorProfile tutorProfile = new TutorProfile();
                            tutorProfile.setUser(user);
                            tutorProfile.setEnable(false);
                            return tutorProfile;
                        } else {
                            // Student không cần profile riêng, thông tin lưu trong User
                            return null;
                        }
                    });

            // Update fields - moved to User entity
            User profileUser = profile.getUser();
            if (request.getPhoneNumber() != null) profileUser.setPhoneNumber(request.getPhoneNumber().trim());
            // if (request.getAddress() != null) profileUser.setAddress(request.getAddress().trim()); // address field removed from DTO
            // Removed fields: educationLevel (moved to User), university, major, city

            if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
                try {
                    profile.getUser().setDateOfBirth(java.time.LocalDate.parse(request.getDateOfBirth()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(
                            Map.of("success", false, "error", "Ngày sinh không hợp lệ! Định dạng: YYYY-MM-DD")
                    );
                }
            }

            if (request.getGender() != null && !request.getGender().trim().isEmpty()) {
                try {
                    profile.getUser().setGender(Gender.valueOf(request.getGender().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(
                            Map.of("success", false, "error", "Giới tính không hợp lệ! Chỉ chấp nhận: MALE, FEMALE, OTHER")
                    );
                }
            }

            // TUTOR specific fields
            if (profile instanceof TutorProfile tutorProfile) {
                if (request.getBio() != null) tutorProfile.setBio(request.getBio().trim());
                if (request.getHeadline() != null) tutorProfile.setHeadline(request.getHeadline().trim());
                if (request.getFees() != null && request.getFees() >= 0) tutorProfile.setFees(request.getFees());
                if (request.getExperience() != null) tutorProfile.setExperience(request.getExperience().trim());
            }

            profileRepository.save(profile);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật thông tin thành công!");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", "Lỗi khi cập nhật profile: " + e.getMessage())
            );
        }
    }


    /**
     * Đổi mật khẩu
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request,
                                          Authentication authentication) {
        try {
            String username = authentication.getName();
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");

            if (oldPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", "Thiếu thông tin mật khẩu cũ hoặc mật khẩu mới!")
                );
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", "Mật khẩu mới phải có ít nhất 6 ký tự!")
                );
            }

            boolean success = userService.changePassword(username, oldPassword, newPassword);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đổi mật khẩu thành công!"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Mật khẩu cũ không đúng!"
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("success", false, "error", "Lỗi khi đổi mật khẩu: " + e.getMessage())
            );
        }
    }
} 