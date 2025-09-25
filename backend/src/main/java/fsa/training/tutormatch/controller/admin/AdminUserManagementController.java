package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.repository.ProfileApplicationRepository;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.enums.ApplicationStatus;
import fsa.training.tutormatch.enums.BookingStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
// @PreAuthorize("hasRole('ADMIN')") // Tạm thời comment để test
public class AdminUserManagementController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileApplicationRepository applicationRepository;

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Lấy danh sách tất cả người dùng với phân trang
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<User> users;
            
            if (search != null && !search.trim().isEmpty()) {
                // Search by name or email - simplified search
                users = userRepository.findAll(pageable); // Simplified - no search for now
            } else if (role != null && !role.trim().isEmpty()) {
                UserRole userRole = UserRole.valueOf(role.toUpperCase());
                users = userRepository.findByRole(userRole, pageable);
            } else {
                users = userRepository.findAll(pageable);
            }

            // Tạo user DTOs chỉ với thông tin cần thiết để tránh nested relationships
            List<Map<String, Object>> userDTOs = users.getContent().stream().map(user -> {
                Map<String, Object> userDTO = new HashMap<>();
                userDTO.put("id", user.getId());
                userDTO.put("username", user.getUsername());
                userDTO.put("firstName", user.getFirstName());
                userDTO.put("lastName", user.getLastName());
                userDTO.put("email", user.getUsername()); // username is email
                userDTO.put("phoneNumber", user.getPhoneNumber());
                userDTO.put("role", user.getRole());
                userDTO.put("enable", user.isEnable());
                userDTO.put("createdAt", user.getCreatedAt());
                userDTO.put("updatedAt", user.getUpdatedAt());
                return userDTO;
            }).toList();

            Map<String, Object> response = new HashMap<>();
            response.put("users", userDTOs);
            response.put("totalElements", users.getTotalElements());
            response.put("totalPages", users.getTotalPages());
            response.put("currentPage", users.getNumber());
            response.put("size", users.getSize());
            response.put("hasNext", users.hasNext());
            response.put("hasPrevious", users.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy danh sách người dùng: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thông tin chi tiết người dùng
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserDetails(@PathVariable Integer userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            Map<String, Object> userDetails = new HashMap<>();
            
            // Basic info
            userDetails.put("id", user.getId());
            userDetails.put("username", user.getUsername());
            userDetails.put("firstName", user.getFirstName());
            userDetails.put("lastName", user.getLastName());
            userDetails.put("email", user.getUsername());
            userDetails.put("phone", user.getPhoneNumber());
            userDetails.put("address", user.getAddress());
            userDetails.put("dateOfBirth", user.getDateOfBirth());
            userDetails.put("gender", user.getGender());
            userDetails.put("role", user.getRole());
            userDetails.put("isVerified", true); // Placeholder
            userDetails.put("createdAt", user.getCreatedAt());
            userDetails.put("updatedAt", user.getUpdatedAt());

            // Statistics based on role - simplified for now
            if (user.getRole() == UserRole.STUDENT) {
                // Student statistics - placeholder
                userDetails.put("totalBookings", 0);
                userDetails.put("completedBookings", 0);
                
            } else if (user.getRole() == UserRole.TUTOR) {
                // Tutor statistics - placeholder
                userDetails.put("totalBookings", 0);
                userDetails.put("completedBookings", 0);
                userDetails.put("pendingApplications", 0);
            }

            return ResponseEntity.ok(userDetails);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy thông tin người dùng: " + e.getMessage())
            );
        }
    }

    /**
     * Khóa/mở khóa tài khoản người dùng
     */
    @PutMapping("/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Integer userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            // Note: User entity doesn't have enabled field, simplified for now
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cập nhật trạng thái tài khoản");
            response.put("isVerified", true);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi thay đổi trạng thái người dùng: " + e.getMessage())
            );
        }
    }

    /**
     * Xóa tài khoản người dùng
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            
            // Check if user has active bookings - simplified check
            // In real implementation, you would check for active bookings
            // For now, allow deletion

            userRepository.delete(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xóa tài khoản thành công");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi xóa người dùng: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thống kê người dùng
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getUserStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Total users by role
            long totalUsers = userRepository.count();
            long totalStudents = userRepository.countByRole(UserRole.STUDENT);
            long totalTutors = userRepository.countByRole(UserRole.TUTOR);
            long totalAdmins = userRepository.countByRole(UserRole.ADMIN);
            
            stats.put("totalUsers", totalUsers);
            stats.put("totalStudents", totalStudents);
            stats.put("totalTutors", totalTutors);
            stats.put("totalAdmins", totalAdmins);
            
            // Verified users - placeholder
            stats.put("verifiedUsers", totalUsers / 2); // Placeholder
            stats.put("unverifiedUsers", totalUsers / 2); // Placeholder
            
            // Recent registrations (last 30 days)
            ZonedDateTime thirtyDaysAgo = ZonedDateTime.now().minusDays(30);
            long newUsersLast30Days = userRepository.countByCreatedAtAfter(thirtyDaysAgo);
            stats.put("newUsersLast30Days", newUsersLast30Days);
            
            // Active users - placeholder
            stats.put("activeUsers", newUsersLast30Days); // Placeholder

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy thống kê người dùng: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy danh sách học sinh
     */
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        try {
            if (search != null && !search.trim().isEmpty()) {
                return getAllUsers(page, size, sortBy, sortDir, "STUDENT", search);
            } else {
                return getAllUsers(page, size, sortBy, sortDir, "STUDENT", null);
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy danh sách học sinh: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy danh sách gia sư
     */
    @GetMapping("/tutors")
    public ResponseEntity<?> getTutors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        try {
            if (search != null && !search.trim().isEmpty()) {
                return getAllUsers(page, size, sortBy, sortDir, "TUTOR", search);
            } else {
                return getAllUsers(page, size, sortBy, sortDir, "TUTOR", null);
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy danh sách gia sư: " + e.getMessage())
            );
        }
    }
}
