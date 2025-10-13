package fsa.training.tutormatch.controller.message;

import fsa.training.tutormatch.entity.Message;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.MessageRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.MessageService;
import fsa.training.tutormatch.dto.MessageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    // Send a message (new endpoint for frontend)
    @PostMapping("/send")
    public ResponseEntity<?> sendMessageNew(
            @RequestBody Map<String, Object> messageData,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
            Integer receiverId = Integer.valueOf(messageData.get("receiverId").toString());
            String content = messageData.get("content").toString();

            User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Người nhận không tồn tại"));

            MessageDTO message = messageService.sendMessage(currentUser, receiver, content);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tin nhắn đã được gửi",
                "data", message
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Không thể gửi tin nhắn: " + e.getMessage()
            ));
        }
    }

    // Send a message (compatible with old API)
    @PostMapping
    public ResponseEntity<?> sendMessage(
            @RequestBody Map<String, Object> messageData,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
            Integer receiverId = Integer.valueOf(messageData.get("receiverId").toString());
            String content = messageData.get("content").toString();

            User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Người nhận không tồn tại"));

            MessageDTO message = messageService.sendMessage(currentUser, receiver, content);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tin nhắn đã được gửi",
                "data", message
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Không thể gửi tin nhắn: " + e.getMessage()
            ));
        }
    }

    // Send message using DTO (for admin compatibility)
    @PostMapping("/dto")
    public ResponseEntity<MessageDTO> sendMessageDTO(@RequestBody MessageDTO messageDTO) {
        MessageDTO sentMessage = messageService.sendMessage(messageDTO);
        return ResponseEntity.ok(sentMessage);
    }

    // Get conversations for current user
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Authentication authentication) {
        try {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
            List<Message> messages = messageRepository.findMessagesByUser(currentUser);

            // Group messages by conversation partner
            Map<Integer, Map<String, Object>> conversations = new HashMap<>();
            
            for (Message message : messages) {
                User partner = message.getSender().getId().equals(currentUser.getId()) 
                    ? message.getReceiver() 
                    : message.getSender();
                
                Integer partnerId = partner.getId();
                
                if (!conversations.containsKey(partnerId)) {
                    conversations.put(partnerId, new HashMap<>());
                    conversations.get(partnerId).put("participantId", partnerId);
                    conversations.get(partnerId).put("participantName", partner.getFirstName() + " " + partner.getLastName());
                    conversations.get(partnerId).put("participantRole", partner.getRole().toString());
                    conversations.get(partnerId).put("lastMessage", message.getContent());
                    conversations.get(partnerId).put("lastMessageTime", message.getCreatedAt().toLocalDateTime());
                    conversations.get(partnerId).put("unreadCount", messageRepository.countByReceiverAndSenderAndIsReadFalse(
                        currentUser, partner
                    ));
                }
            }

            return ResponseEntity.ok(conversations.values());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Không thể tải danh sách cuộc trò chuyện: " + e.getMessage()
            ));
        }
    }

    // Get messages in a conversation with specific user
    @GetMapping("/conversation/{userId}")
    public ResponseEntity<?> getConversationMessages(
            @PathVariable Integer userId,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
            User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
            Page<Message> messagePage = messageRepository.findBySenderAndReceiverOrReceiverAndSenderOrderByCreatedAtDesc(
                currentUser, otherUser, pageable
            );

            // Mark messages as read
            messageService.markMessagesAsRead(currentUser.getId(), otherUser.getId());

            // Convert to DTOs
            List<MessageDTO> messageDTOs = messagePage.getContent().stream()
                .map(messageService::convertToDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(messageDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Không thể tải tin nhắn: " + e.getMessage()
            ));
        }
    }

    // Get messages between current user and another user
    @GetMapping("/between/{userId}")
    public ResponseEntity<?> getMessagesBetween(
            @PathVariable Long userId,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
            User otherUser = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
            Page<Message> messagePage = messageRepository.findBySenderAndReceiverOrReceiverAndSenderOrderByCreatedAtDesc(
                currentUser, otherUser, pageable
            );

            // Mark messages as read
            messageService.markMessagesAsRead(currentUser.getId(), otherUser.getId());

            return ResponseEntity.ok(Map.of(
                "content", messagePage.getContent(),
                "totalElements", messagePage.getTotalElements(),
                "totalPages", messagePage.getTotalPages(),
                "currentPage", messagePage.getNumber()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Không thể tải tin nhắn: " + e.getMessage()
            ));
        }
    }

    // Get messages between users (compatible with old API)
    @GetMapping("/between/{userId}/old")
    public ResponseEntity<List<MessageDTO>> getMessagesBetweenUsersOld(@PathVariable Integer userId) {
        // This method is for backward compatibility
        List<MessageDTO> messages = messageService.getMessagesBetweenUsers(userId, userId);
        return ResponseEntity.ok(messages);
    }

    // Mark messages as read
    @PutMapping("/read")
    public ResponseEntity<?> markAsRead(
            @RequestParam Integer senderId,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
            User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Người gửi không tồn tại"));

            messageService.markMessagesAsRead(currentUser.getId(), sender.getId());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tin nhắn đã được đánh dấu là đã đọc"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Không thể đánh dấu tin nhắn: " + e.getMessage()
            ));
        }
    }

    // Get unread message count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
            long unreadCount = messageRepository.countByReceiverAndIsReadFalse(currentUser);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "unreadCount", unreadCount
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Không thể lấy số tin nhắn chưa đọc: " + e.getMessage()
            ));
        }
    }

    // Admin endpoints
    @GetMapping("/admin/all")
    public ResponseEntity<List<MessageDTO>> getAllMessages() {
        List<MessageDTO> messages = messageService.getAllMessages();
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/admin/all/paged")
    public ResponseEntity<Page<MessageDTO>> getAllMessagesPaged(Pageable pageable) {
        Page<MessageDTO> messages = messageService.getAllMessages(pageable);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/admin/user/{userId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByUser(@PathVariable Integer userId) {
        List<MessageDTO> messages = messageService.getMessagesByUser(userId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/admin/search")
    public ResponseEntity<List<MessageDTO>> searchMessages(@RequestParam String searchTerm) {
        List<MessageDTO> messages = messageService.searchMessages(searchTerm);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadMessageCount() {
        // This method is for backward compatibility
        Long count = messageService.getUnreadMessageCount(1); // Placeholder
        return ResponseEntity.ok(count);
    }

    @PutMapping("/mark-read/{userId}")
    public ResponseEntity<Void> markMessagesAsReadOld(@PathVariable Integer userId) {
        // This method is for backward compatibility
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Integer messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }
}
