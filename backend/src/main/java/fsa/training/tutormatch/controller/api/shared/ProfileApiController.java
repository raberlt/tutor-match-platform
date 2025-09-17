package fsa.training.tutormatch.controller.api.shared;

import fsa.training.tutormatch.dto.ProfileUpdateRequest;
import fsa.training.tutormatch.entity.BaseProfile;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.ProfileRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.interfaces.IUserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileApiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private IUserService userService;

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
            Optional<BaseProfile> profileOpt = profileRepository.findByUserId(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", Map.of(
                    "id", user.getId(),
                    "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                    "lastName", user.getLastName() != null ? user.getLastName() : "",
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "role", user.getRole().toString(),
                    "enabled", user.isEnabled()
            ));

            if (profileOpt.isPresent()) {
                BaseProfile baseProfile = profileOpt.get();
                Map<String, Object> profileData = new HashMap<>();

                // Các field chung cho mọi profile
                profileData.put("id", baseProfile.getId());
                profileData.put("phoneNumber", baseProfile.getPhoneNumber() != null ? baseProfile.getPhoneNumber() : "");
                profileData.put("addressLine1", baseProfile.getAddressLine1() != null ? baseProfile.getAddressLine1() : "");
                profileData.put("educationLevel", baseProfile.getEducationLevel() != null ? baseProfile.getEducationLevel() : "");
                profileData.put("university", baseProfile.getUniversity() != null ? baseProfile.getUniversity() : "");
                profileData.put("major", baseProfile.getMajor() != null ? baseProfile.getMajor() : "");
                profileData.put("city", baseProfile.getCity() != null ? baseProfile.getCity() : "");
                profileData.put("dateOfBirth", baseProfile.getDateOfBirth() != null ? baseProfile.getDateOfBirth().toString() : "");
                profileData.put("gender", baseProfile.getGender() != null ? baseProfile.getGender().toString() : "");
                profileData.put("isVerified", baseProfile.isVerified());
                profileData.put("profileStatus", baseProfile.getProfileStatus().toString());

                // Nếu là TutorProfile thì thêm các field đặc thù
                if (baseProfile instanceof TutorProfile tutorProfile) {
                    profileData.put("bio", tutorProfile.getBio() != null ? tutorProfile.getBio() : "");
                    profileData.put("headline", tutorProfile.getHeadline() != null ? tutorProfile.getHeadline() : "");
                    profileData.put("teachingLevel", tutorProfile.getTeachingLevel() != null ? tutorProfile.getTeachingLevel() : "");
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
            BaseProfile profile = profileRepository.findByUserId(user.getId())
                    .orElseGet(() -> {
                        if (user.getRole() == User.Role.TUTOR) {
                            TutorProfile tutorProfile = new TutorProfile();
                            tutorProfile.setUser(user);
                            tutorProfile.setProfileStatus(BaseProfile.ProfileStatus.PENDING_VERIFICATION);
                            return tutorProfile;
                        } else {
                            StudentProfile studentProfile = new StudentProfile();
                            studentProfile.setUser(user);
                            studentProfile.setProfileStatus(BaseProfile.ProfileStatus.ACTIVE);
                            return studentProfile;
                        }
                    });

            // Update common fields
            if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber().trim());
            if (request.getAddressLine1() != null) profile.setAddressLine1(request.getAddressLine1().trim());
            if (request.getEducationLevel() != null) profile.setEducationLevel(request.getEducationLevel().trim());
            if (request.getUniversity() != null) profile.setUniversity(request.getUniversity().trim());
            if (request.getMajor() != null) profile.setMajor(request.getMajor().trim());
            if (request.getCity() != null) profile.setCity(request.getCity().trim());

            if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
                try {
                    profile.setDateOfBirth(Date.valueOf(request.getDateOfBirth()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(
                            Map.of("success", false, "error", "Ngày sinh không hợp lệ! Định dạng: YYYY-MM-DD")
                    );
                }
            }

            if (request.getGender() != null && !request.getGender().trim().isEmpty()) {
                try {
                    profile.setGender(BaseProfile.Gender.valueOf(request.getGender().toUpperCase()));
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
                if (request.getTeachingLevel() != null) tutorProfile.setTeachingLevel(request.getTeachingLevel().trim());
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