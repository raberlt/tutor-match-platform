package fsa.training.tutormatch.controller.authentication;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"})
public class PasswordResetController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Reset password cho user (admin function)
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("password");

            if (email == null || newPassword == null) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Email và password là bắt buộc")
                );
            }

            // Tìm user
            Optional<User> userOpt = userService.findByUsername(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Không tìm thấy user với email: " + email)
                );
            }

            User user = userOpt.get();
            
            // Encode password mới
            user.setPassword(newPassword); // UserService.save() sẽ encode
            User updatedUser = userService.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password đã được reset thành công");
            response.put("email", updatedUser.getEmail());
            response.put("username", updatedUser.getUsername());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi reset password: " + e.getMessage())
            );
        }
    }

    /**
     * Kiểm tra thông tin user
     */
    @GetMapping("/check-user/{email}")
    public ResponseEntity<?> checkUser(@PathVariable String email) {
        try {
            Optional<User> userOpt = userService.findByUsername(email);
            
            Map<String, Object> response = new HashMap<>();
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                response.put("exists", true);
                response.put("email", user.getEmail());
                response.put("username", user.getUsername());
                response.put("role", user.getRole());
                response.put("enabled", user.isEnable());
                response.put("verified", user.isVerified());
                response.put("passwordLength", user.getPassword() != null ? user.getPassword().length() : 0);
                response.put("passwordStartsWith", user.getPassword() != null && user.getPassword().startsWith("$2a$") ? "BCrypt" : "Plain text or other");
            } else {
                response.put("exists", false);
                response.put("message", "User không tồn tại");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi kiểm tra user: " + e.getMessage())
            );
        }
    }
}
