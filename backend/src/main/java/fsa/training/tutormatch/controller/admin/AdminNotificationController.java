package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Gửi thông báo cho tất cả người dùng
     */
    @PostMapping("/broadcast")
    public ResponseEntity<?> sendBroadcastNotification(@RequestBody Map<String, Object> notificationData) {
        try {
            String title = (String) notificationData.get("title");
            String message = (String) notificationData.get("message");
            String type = (String) notificationData.getOrDefault("type", "info");
            String priority = (String) notificationData.getOrDefault("priority", "normal");
            
            // In a real implementation, you would:
            // 1. Save notification to database
            // 2. Send push notifications
            // 3. Send emails if needed
            // 4. Send SMS if needed
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã gửi thông báo cho tất cả người dùng");
            response.put("recipients", userRepository.count());
            response.put("notification", Map.of(
                "title", title,
                "message", message,
                "type", type,
                "priority", priority,
                "sentAt", ZonedDateTime.now()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi gửi thông báo: " + e.getMessage())
            );
        }
    }

    /**
     * Gửi thông báo cho nhóm cụ thể
     */
    @PostMapping("/group")
    public ResponseEntity<?> sendGroupNotification(@RequestBody Map<String, Object> notificationData) {
        try {
            String title = (String) notificationData.get("title");
            String message = (String) notificationData.get("message");
            String targetGroup = (String) notificationData.get("targetGroup");
            String type = (String) notificationData.getOrDefault("type", "info");
            
            long recipientCount = 0;
            
            if ("students".equals(targetGroup)) {
                recipientCount = userRepository.countByRole(UserRole.STUDENT);
            } else if ("tutors".equals(targetGroup)) {
                recipientCount = userRepository.countByRole(UserRole.TUTOR);
            } else if ("all".equals(targetGroup)) {
                recipientCount = userRepository.count();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã gửi thông báo cho nhóm " + targetGroup);
            response.put("recipients", recipientCount);
            response.put("notification", Map.of(
                "title", title,
                "message", message,
                "targetGroup", targetGroup,
                "type", type,
                "sentAt", ZonedDateTime.now()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi gửi thông báo nhóm: " + e.getMessage())
            );
        }
    }

    /**
     * Gửi thông báo khuyến mãi
     */
    @PostMapping("/promotional")
    public ResponseEntity<?> sendPromotionalNotification(@RequestBody Map<String, Object> notificationData) {
        try {
            String title = (String) notificationData.get("title");
            String message = (String) notificationData.get("message");
            String couponCode = (String) notificationData.get("couponCode");
            String discountAmount = (String) notificationData.get("discountAmount");
            String validUntil = (String) notificationData.get("validUntil");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã gửi thông báo khuyến mãi");
            response.put("recipients", userRepository.count());
            response.put("promotion", Map.of(
                "title", title,
                "message", message,
                "couponCode", couponCode,
                "discountAmount", discountAmount,
                "validUntil", validUntil,
                "sentAt", ZonedDateTime.now()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi gửi thông báo khuyến mãi: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy danh sách phản hồi từ người dùng
     */
    @GetMapping("/feedback")
    public ResponseEntity<?> getFeedback(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        try {
            // In a real implementation, you would have a Feedback entity
            // For now, return mock data
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> feedback1 = new HashMap<>();
            feedback1.put("id", 1);
            feedback1.put("userName", "Nguyễn Văn A");
            feedback1.put("userEmail", "user1@example.com");
            feedback1.put("subject", "Vấn đề với thanh toán");
            feedback1.put("message", "Tôi không thể thanh toán được, xin hỗ trợ");
            feedback1.put("status", "pending");
            feedback1.put("createdAt", ZonedDateTime.now().minusDays(1));
            feedback1.put("priority", "high");
            
            Map<String, Object> feedback2 = new HashMap<>();
            feedback2.put("id", 2);
            feedback2.put("userName", "Trần Thị B");
            feedback2.put("userEmail", "user2@example.com");
            feedback2.put("subject", "Đề xuất cải tiến");
            feedback2.put("message", "Tôi muốn đề xuất thêm tính năng tìm kiếm nâng cao");
            feedback2.put("status", "in_progress");
            feedback2.put("createdAt", ZonedDateTime.now().minusDays(2));
            feedback2.put("priority", "medium");
            
            response.put("feedback", List.of(feedback1, feedback2));
            response.put("totalElements", 2);
            response.put("totalPages", 1);
            response.put("currentPage", 0);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy phản hồi: " + e.getMessage())
            );
        }
    }

    /**
     * Xử lý khiếu nại
     */
    @PutMapping("/feedback/{feedbackId}/resolve")
    public ResponseEntity<?> resolveFeedback(
            @PathVariable Long feedbackId,
            @RequestBody Map<String, Object> resolutionData) {
        try {
            String status = (String) resolutionData.get("status");
            String response = (String) resolutionData.get("response");
            String priority = (String) resolutionData.getOrDefault("priority", "medium");
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã xử lý khiếu nại thành công");
            result.put("feedbackId", feedbackId);
            result.put("status", status);
            result.put("response", response);
            result.put("priority", priority);
            result.put("resolvedAt", ZonedDateTime.now());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi xử lý khiếu nại: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy danh sách hỗ trợ khách hàng
     */
    @GetMapping("/support")
    public ResponseEntity<?> getSupportTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        try {
            // In a real implementation, you would have a SupportTicket entity
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> ticket1 = new HashMap<>();
            ticket1.put("id", 1);
            ticket1.put("ticketNumber", "TKT-001");
            ticket1.put("userName", "Lê Văn C");
            ticket1.put("userEmail", "user3@example.com");
            ticket1.put("subject", "Không nhận được email xác nhận");
            ticket1.put("description", "Tôi đã đăng ký nhưng không nhận được email xác nhận");
            ticket1.put("status", "open");
            ticket1.put("priority", "high");
            ticket1.put("category", "technical");
            ticket1.put("createdAt", ZonedDateTime.now().minusHours(2));
            ticket1.put("assignedTo", "Admin Support");
            
            Map<String, Object> ticket2 = new HashMap<>();
            ticket2.put("id", 2);
            ticket2.put("ticketNumber", "TKT-002");
            ticket2.put("userName", "Phạm Thị D");
            ticket2.put("userEmail", "user4@example.com");
            ticket2.put("subject", "Yêu cầu hoàn tiền");
            ticket2.put("description", "Tôi muốn hoàn tiền cho booking đã hủy");
            ticket2.put("status", "in_progress");
            ticket2.put("priority", "medium");
            ticket2.put("category", "billing");
            ticket2.put("createdAt", ZonedDateTime.now().minusDays(1));
            ticket2.put("assignedTo", "Billing Support");
            
            response.put("tickets", List.of(ticket1, ticket2));
            response.put("totalElements", 2);
            response.put("totalPages", 1);
            response.put("currentPage", 0);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy danh sách hỗ trợ: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật trạng thái ticket hỗ trợ
     */
    @PutMapping("/support/{ticketId}")
    public ResponseEntity<?> updateSupportTicket(
            @PathVariable Long ticketId,
            @RequestBody Map<String, Object> updateData) {
        try {
            String status = (String) updateData.get("status");
            String response = (String) updateData.get("response");
            String assignedTo = (String) updateData.get("assignedTo");
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã cập nhật ticket hỗ trợ thành công");
            result.put("ticketId", ticketId);
            result.put("status", status);
            result.put("response", response);
            result.put("assignedTo", assignedTo);
            result.put("updatedAt", ZonedDateTime.now());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi cập nhật ticket: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thống kê thông báo
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getNotificationStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Mock data - in real implementation, query from notification tables
            stats.put("totalNotifications", 150);
            stats.put("sentToday", 25);
            stats.put("sentThisWeek", 120);
            stats.put("sentThisMonth", 450);
            
            stats.put("broadcastNotifications", 50);
            stats.put("groupNotifications", 80);
            stats.put("promotionalNotifications", 20);
            
            stats.put("openTickets", 15);
            stats.put("inProgressTickets", 8);
            stats.put("resolvedTickets", 45);
            
            stats.put("pendingFeedback", 12);
            stats.put("resolvedFeedback", 38);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy thống kê thông báo: " + e.getMessage())
            );
        }
    }
}
