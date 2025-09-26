package fsa.training.tutormatch.controller.auth;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.Gender;
import fsa.training.tutormatch.enums.EducationLevel;
import fsa.training.tutormatch.service.UserService;
import fsa.training.tutormatch.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class UserProfileController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        try {
            // Tạm thời sử dụng email mặc định để test
            String username = authentication != null ? authentication.getName() : "testuser@example.com";
            User user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("id", user.getId());
            userProfile.put("firstName", user.getFirstName());
            userProfile.put("lastName", user.getLastName());
            userProfile.put("email", user.getEmail());
            userProfile.put("username", user.getUsername());
            userProfile.put("phoneNumber", user.getPhoneNumber());
            userProfile.put("dateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null);
            userProfile.put("gender", user.getGender() != null ? user.getGender().toString() : null);
            userProfile.put("address", user.getAddress());
            userProfile.put("educationLevel", user.getEducationLevel() != null ? user.getEducationLevel().toString() : null);
            userProfile.put("imageAvatar", user.getImageAvatar());
            userProfile.put("role", user.getRole());
            userProfile.put("isVerified", user.isVerified());
            userProfile.put("enable", user.isEnable());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", userProfile
            ));
        } catch (Exception e) {
            log.error("Error getting user profile: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateUserProfile(
        @RequestBody Map<String, Object> profileData,
        Authentication authentication
    ) {
        try {
            // Tạm thời sử dụng email mặc định để test
            String username = authentication != null ? authentication.getName() : "testuser@example.com";
            User user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Cập nhật thông tin user
            if (profileData.containsKey("firstName")) {
                user.setFirstName((String) profileData.get("firstName"));
            }
            if (profileData.containsKey("lastName")) {
                user.setLastName((String) profileData.get("lastName"));
            }
            if (profileData.containsKey("username")) {
                user.setUsername((String) profileData.get("username"));
            }
            if (profileData.containsKey("phoneNumber")) {
                user.setPhoneNumber((String) profileData.get("phoneNumber"));
            }
            if (profileData.containsKey("dateOfBirth")) {
                String dateStr = (String) profileData.get("dateOfBirth");
                if (dateStr != null && !dateStr.isEmpty()) {
                    try {
                        LocalDate dateOfBirth = LocalDate.parse(dateStr);
                        user.setDateOfBirth(dateOfBirth);
                    } catch (Exception e) {
                        log.warn("Invalid date format: {}", dateStr);
                    }
                }
            }
            if (profileData.containsKey("gender")) {
                String genderStr = (String) profileData.get("gender");
                if (genderStr != null && !genderStr.isEmpty()) {
                    try {
                        Gender gender = Gender.valueOf(genderStr.toUpperCase());
                        user.setGender(gender);
                    } catch (Exception e) {
                        log.warn("Invalid gender: {}", genderStr);
                    }
                }
            }
            if (profileData.containsKey("address")) {
                user.setAddress((String) profileData.get("address"));
            }
            if (profileData.containsKey("educationLevel")) {
                String educationStr = (String) profileData.get("educationLevel");
                if (educationStr != null && !educationStr.isEmpty()) {
                    try {
                        EducationLevel educationLevel = EducationLevel.valueOf(educationStr.toUpperCase());
                        user.setEducationLevel(educationLevel);
                    } catch (Exception e) {
                        log.warn("Invalid education level: {}", educationStr);
                    }
                }
            }
            if (profileData.containsKey("avatar")) {
                user.setImageAvatar((String) profileData.get("avatar"));
            }
            
            User updatedUser = userService.save(user);
            
            // Tạo response object đơn giản để tránh lỗi serialization
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", updatedUser.getId());
            userData.put("firstName", updatedUser.getFirstName());
            userData.put("lastName", updatedUser.getLastName());
            userData.put("email", updatedUser.getEmail());
            userData.put("username", updatedUser.getUsername());
            userData.put("phoneNumber", updatedUser.getPhoneNumber());
            userData.put("address", updatedUser.getAddress());
            userData.put("gender", updatedUser.getGender());
            userData.put("educationLevel", updatedUser.getEducationLevel());
            userData.put("dateOfBirth", updatedUser.getDateOfBirth());
            userData.put("imageAvatar", updatedUser.getImageAvatar());
            userData.put("role", updatedUser.getRole());
            userData.put("enable", updatedUser.isEnable());
            userData.put("verified", updatedUser.isVerified());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated successfully",
                "data", userData
            ));
        } catch (Exception e) {
            log.error("Error updating user profile: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/upload-avatar")
    @Transactional
    public ResponseEntity<?> uploadAvatar(
        @RequestParam("avatar") MultipartFile file,
        Authentication authentication
    ) {
        try {
            // Tạm thời sử dụng email mặc định để test
            String username = authentication != null ? authentication.getName() : "testuser@example.com";
            
            // Kiểm tra file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "File is empty"
                ));
            }
            
            // Kiểm tra kích thước file (5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "File size too large. Maximum 5MB allowed."
                ));
            }
            
            // Kiểm tra loại file
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Only image files are allowed"
                ));
            }
            
            // Upload lên Cloudinary
            String avatarUrl = cloudinaryService.uploadImage(file, "tutormatching/avatars");
            
            // Cập nhật avatar URL vào database
            User user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            user.setImageAvatar(avatarUrl);
            userService.save(user);
            
            log.info("Avatar uploaded for user {}: {}", username, avatarUrl);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Avatar uploaded successfully",
                "avatarUrl", avatarUrl
            ));
        } catch (Exception e) {
            log.error("Error uploading avatar: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}
