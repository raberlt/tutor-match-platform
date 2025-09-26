package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.MessageDTO;
import fsa.training.tutormatch.entity.Message;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.MessageRepository;
import fsa.training.tutormatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public MessageDTO sendMessage(MessageDTO messageDTO) {
        log.info("Sending message from user {} to user {}", messageDTO.getSenderId(), messageDTO.getReceiverId());
        
        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User receiver = userRepository.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(messageDTO.getContent());
        message.setIsRead(false);
        
        Message savedMessage = messageRepository.save(message);
        log.info("Message sent successfully with ID: {}", savedMessage.getId());
        
        return convertToDTO(savedMessage);
    }
    
    @Transactional(readOnly = true)
    public List<MessageDTO> getMessagesBetweenUsers(Integer userId1, Integer userId2) {
        log.info("Getting messages between users {} and {}", userId1, userId2);
        
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User 1 not found"));
        
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User 2 not found"));
        
        List<Message> messages = messageRepository.findMessagesBetweenUsers(user1, user2);
        
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<MessageDTO> getMessagesBetweenUsers(Integer userId1, Integer userId2, Pageable pageable) {
        log.info("Getting messages between users {} and {} with pagination", userId1, userId2);
        
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User 1 not found"));
        
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User 2 not found"));
        
        Page<Message> messages = messageRepository.findMessagesBetweenUsers(user1, user2, pageable);
        
        return messages.map(this::convertToDTO);
    }
    
    // Admin methods
    @Transactional(readOnly = true)
    public List<MessageDTO> getAllMessages() {
        log.info("Getting all messages (admin)");
        
        List<Message> messages = messageRepository.findAllMessagesOrderByCreatedAtDesc();
        
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<MessageDTO> getAllMessages(Pageable pageable) {
        log.info("Getting all messages with pagination (admin)");
        
        Page<Message> messages = messageRepository.findAllMessagesOrderByCreatedAtDesc(pageable);
        
        return messages.map(this::convertToDTO);
    }
    
    @Transactional(readOnly = true)
    public List<MessageDTO> getMessagesByUser(Integer userId) {
        log.info("Getting messages for user {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Message> messages = messageRepository.findMessagesByUser(user);
        
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<MessageDTO> searchMessages(String searchTerm) {
        log.info("Searching messages with term: {}", searchTerm);
        
        List<Message> messages = messageRepository.searchMessagesByContent(searchTerm);
        
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Long getUnreadMessageCount(Integer userId) {
        log.info("Getting unread message count for user {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return messageRepository.countUnreadMessagesByUser(user);
    }
    
    @Transactional
    public void markMessagesAsRead(Integer senderId, Integer receiverId) {
        log.info("Marking messages as read from user {} to user {}", senderId, receiverId);
        
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        messageRepository.markMessagesAsRead(sender, receiver);
    }
    
    @Transactional
    public void deleteMessage(Integer messageId) {
        log.info("Deleting message {}", messageId);
        
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        messageRepository.delete(message);
    }
    
    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSenderId());
        dto.setSenderName(message.getSenderName());
        dto.setSenderRole(message.getSenderRole());
        dto.setReceiverId(message.getReceiverId());
        dto.setReceiverName(message.getReceiverName());
        dto.setReceiverRole(message.getReceiverRole());
        dto.setContent(message.getContent());
        dto.setIsRead(message.getIsRead());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());
        return dto;
    }
}

