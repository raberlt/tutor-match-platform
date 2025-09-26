package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.dto.MessageDTO;
import fsa.training.tutormatch.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {
    
    private final MessageService messageService;
    
    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@Valid @RequestBody MessageDTO messageDTO) {
        log.info("Sending message from user {} to user {}", messageDTO.getSenderId(), messageDTO.getReceiverId());
        
        // Lấy user ID từ authentication context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer currentUserId = getCurrentUserId(auth);
        
        // Đảm bảo người dùng chỉ có thể gửi tin nhắn với tư cách của mình
        messageDTO.setSenderId(currentUserId);
        
        MessageDTO sentMessage = messageService.sendMessage(messageDTO);
        return ResponseEntity.ok(sentMessage);
    }
    
    @GetMapping("/between/{userId}")
    public ResponseEntity<List<MessageDTO>> getMessagesBetweenUsers(@PathVariable Integer userId) {
        log.info("Getting messages between current user and user {}", userId);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer currentUserId = getCurrentUserId(auth);
        
        List<MessageDTO> messages = messageService.getMessagesBetweenUsers(currentUserId, userId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/between/{userId}/paged")
    public ResponseEntity<Page<MessageDTO>> getMessagesBetweenUsersPaged(
            @PathVariable Integer userId, 
            Pageable pageable) {
        log.info("Getting messages between current user and user {} with pagination", userId);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer currentUserId = getCurrentUserId(auth);
        
        Page<MessageDTO> messages = messageService.getMessagesBetweenUsers(currentUserId, userId, pageable);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadMessageCount() {
        log.info("Getting unread message count for current user");
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer currentUserId = getCurrentUserId(auth);
        
        Long count = messageService.getUnreadMessageCount(currentUserId);
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/mark-read/{userId}")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable Integer userId) {
        log.info("Marking messages as read from user {} to current user", userId);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer currentUserId = getCurrentUserId(auth);
        
        messageService.markMessagesAsRead(userId, currentUserId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Integer messageId) {
        log.info("Deleting message {}", messageId);
        
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }
    
    // Admin endpoints
    @GetMapping("/admin/all")
    public ResponseEntity<List<MessageDTO>> getAllMessages() {
        log.info("Getting all messages (admin)");
        
        List<MessageDTO> messages = messageService.getAllMessages();
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/admin/all/paged")
    public ResponseEntity<Page<MessageDTO>> getAllMessagesPaged(Pageable pageable) {
        log.info("Getting all messages with pagination (admin)");
        
        Page<MessageDTO> messages = messageService.getAllMessages(pageable);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/admin/user/{userId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByUser(@PathVariable Integer userId) {
        log.info("Getting messages for user {} (admin)", userId);
        
        List<MessageDTO> messages = messageService.getMessagesByUser(userId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/admin/search")
    public ResponseEntity<List<MessageDTO>> searchMessages(@RequestParam String searchTerm) {
        log.info("Searching messages with term: {} (admin)", searchTerm);
        
        List<MessageDTO> messages = messageService.searchMessages(searchTerm);
        return ResponseEntity.ok(messages);
    }
    
    private Integer getCurrentUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        
        try {
            return Integer.parseInt(auth.getName());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid user ID format");
        }
    }
}

