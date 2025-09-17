package fsa.training.tutormatch.controller.api.auth;

import fsa.training.tutormatch.dto.JwtResponse;
import fsa.training.tutormatch.dto.LoginRequest;
import fsa.training.tutormatch.dto.SimpleRegisterRequest;
import fsa.training.tutormatch.entity.BaseProfile;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.StudentProfileRepository;
import fsa.training.tutormatch.repository.TutorProfileRepository;
import fsa.training.tutormatch.security.JwtUtil;
import fsa.training.tutormatch.service.interfaces.IUserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"})
public class AuthApiController {

    @Autowired
    private IUserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private TutorProfileRepository tutorProfileRepository;

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
                user.setRole(User.Role.valueOf(roleStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(User.Role.STUDENT);
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
            BaseProfile profile;
            if (savedUser.getRole() == User.Role.TUTOR) {
                TutorProfile tutorProfile = new TutorProfile();
                tutorProfile.setUser(savedUser);
                tutorProfile.setProfileStatus(BaseProfile.ProfileStatus.PENDING_VERIFICATION);

                // Default giá trị rỗng, tránh null
                tutorProfile.setBio("");
                tutorProfile.setHeadline("");
                tutorProfile.setExperience("");
                tutorProfile.setTeachingLevel("");
                tutorProfile.setFees(0);

                profile = tutorProfile;
            } else {
                StudentProfile studentProfile = new StudentProfile();
                studentProfile.setUser(savedUser);
                studentProfile.setProfileStatus(BaseProfile.ProfileStatus.ACTIVE);

                // Default giá trị rỗng
                studentProfile.setLearningGoals("");
                studentProfile.setPreferredSubjects("");
                studentProfile.setLearningStyle("");
                studentProfile.setPreferredTimeSlots("");

                profile = studentProfile;
            }

            // Lưu profile vào repository phù hợp
            if (profile instanceof StudentProfile) {
                studentProfileRepository.save((StudentProfile) profile);
            } else if (profile instanceof TutorProfile) {
                tutorProfileRepository.save((TutorProfile) profile);
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
                        && profileOpt.get().getProfileStatus() == BaseProfile.ProfileStatus.ACTIVE;
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
} 