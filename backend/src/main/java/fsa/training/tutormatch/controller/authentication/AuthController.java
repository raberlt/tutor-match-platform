package fsa.training.tutormatch.controller.authentication;

import fsa.training.tutormatch.dto.JwtResponse;
import fsa.training.tutormatch.dto.LoginRequest;
import fsa.training.tutormatch.dto.SimpleRegisterRequest;
import fsa.training.tutormatch.enums.*;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.TutorProfileRepository;
import fsa.training.tutormatch.security.JwtUtil;
import fsa.training.tutormatch.service.UserService;
import fsa.training.tutormatch.service.CloudinaryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"})
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Đăng ký tài khoản mới (đơn giản)
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody SimpleRegisterRequest request) {
        try {
            // Tạo User
            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword()); // sẽ được encode trong UserService
            user.setUsername(request.getEmail()); // dùng email làm username

            // Gán role (mặc định STUDENT nếu không hợp lệ)
            String roleStr = request.getRole();
            if (roleStr == null || roleStr.trim().isEmpty()) {
                roleStr = "STUDENT";
            }
            try {
                user.setRole(UserRole.valueOf(roleStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(UserRole.STUDENT);
            }

            // Kiểm tra email đã tồn tại chưa
            if (userService.findByUsername(user.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Email đã được sử dụng!")
                );
            }

            // Lưu user
            User savedUser = userService.save(user);

            // Khởi tạo profile phù hợp với role
            if (savedUser.getRole() == UserRole.TUTOR) {
                TutorProfile tutor = new TutorProfile();
                tutor.setUser(savedUser);
                tutor.setEnable(true);

                // Default giá trị rỗng, tránh null
                tutor.setBio("");
                tutor.setHeadline("");
                tutor.setExperience("");
                // Fees are now handled per subject in ApplicationSubjectFee

                // Lưu profile vào repository
                tutorProfileRepository.save(tutor);
            }

            // Response trả về
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đăng ký thành công!");
            response.put("user", Map.of(
                    "id", savedUser.getId(),
                    "firstName", savedUser.getFirstName(),
                    "lastName", savedUser.getLastName(),
                    "email", savedUser.getEmail(),
                    "role", savedUser.getRole().toString()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Đăng ký thất bại: " + e.getMessage())
            );
        }
    }


    /**
     * Đăng nhập
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());

            // Generate JWT token
            String jwt = jwtUtil.generateToken(userDetails);

            // Extract role
            String role = userDetails.getAuthorities().iterator().next().getAuthority();

            // Get user info
            Optional<User> userOpt = userService.findByUsername(loginRequest.getUsername());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Không tìm thấy thông tin người dùng")
                );
            }
            User user = userOpt.get();

            // Check if profile exists and is complete (chỉ áp dụng cho TUTOR)
            boolean profileComplete = false;
            if ("ROLE_TUTOR".equalsIgnoreCase(role)) {
                Optional<TutorProfile> profileOpt = tutorProfileRepository.findByUserId(user.getId());
                profileComplete = profileOpt.isPresent()
                        && Boolean.TRUE.equals(profileOpt.get().getEnable());
            }

            // Create response
            JwtResponse jwtResponse = new JwtResponse(
                    jwt,
                    userDetails.getUsername(),
                    role,
                    jwtUtil.getExpirationTime()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtResponse.getToken());
            response.put("type", jwtResponse.getType());
            response.put("username", jwtResponse.getUsername());
            response.put("role", jwtResponse.getRole());
            response.put("expiresIn", jwtResponse.getExpiresIn());
            response.put("userId", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("imageAvatar", user.getImageAvatar());
            response.put("profileComplete", profileComplete);

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Tên đăng nhập hoặc mật khẩu không đúng")
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Đăng nhập thất bại: " + e.getMessage())
            );
        }
    }


    /**
     * Refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);
                
                if (username != null && jwtUtil.validateToken(token)) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    String newToken = jwtUtil.generateToken(userDetails);
                    String role = userDetails.getAuthorities().iterator().next().getAuthority();
                    
                    JwtResponse jwtResponse = new JwtResponse(
                        newToken,
                        userDetails.getUsername(),
                        role,
                        jwtUtil.getExpirationTime()
                    );
                    
                    return ResponseEntity.ok(jwtResponse);
                }
            }
            
            return ResponseEntity.badRequest().body(
                Map.of("error", "Token không hợp lệ")
            );
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Refresh token thất bại: " + e.getMessage())
            );
        }
    }

    /**
     * Thay đổi mật khẩu
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Thiếu thông tin mật khẩu")
                );
            }

            String username = authentication.getName();
            
            // Verify current password
            try {
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, currentPassword)
                );
            } catch (BadCredentialsException e) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Mật khẩu hiện tại không đúng")
                );
            }

            // Update password
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setPassword(newPassword); // Will be encoded in UserService.save()
                userService.save(user);
                
                return ResponseEntity.ok(
                    Map.of("message", "Đổi mật khẩu thành công")
                );
            }
            
            return ResponseEntity.badRequest().body(
                Map.of("error", "Không tìm thấy user")
            );
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Đổi mật khẩu thất bại: " + e.getMessage())
            );
        }
    }

    /**
     * Đăng xuất (client side sẽ xóa token)
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(
            Map.of("message", "Đăng xuất thành công")
        );
    }

    /**
     * Kiểm tra token hợp lệ
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                boolean isValid = jwtUtil.validateToken(token);
                
                Map<String, Object> response = new HashMap<>();
                response.put("valid", isValid);
                response.put("username", username);
                response.put("role", role);
                response.put("expired", jwtUtil.isTokenExpired(token));
                
                return ResponseEntity.ok(response);
            }
            
            return ResponseEntity.badRequest().body(
                Map.of("error", "Format token không hợp lệ")
            );
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Token validation thất bại: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thông tin profile của user hiện tại
     */
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
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Cập nhật thông tin profile của user
     */
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
                        // Log warning but continue
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
                        // Log warning but continue
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
                        // Log warning but continue
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
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Upload avatar cho user
     */
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
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Avatar uploaded successfully",
                "avatarUrl", avatarUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Reset password cho user (admin function)
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            
            if (email == null || email.isEmpty() || newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Email and new password are required"
                ));
            }
            
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }
            
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.save(user);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password reset successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Kiểm tra user có tồn tại không
     */
    @GetMapping("/check-user/{email}")
    public ResponseEntity<?> checkUser(@PathVariable String email) {
        try {
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "exists", true,
                    "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "firstName", user.getFirstName(),
                        "lastName", user.getLastName(),
                        "role", user.getRole()
                    )
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "exists", false
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
} 