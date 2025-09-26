package fsa.training.tutormatch.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Integer id;
    
    @NotNull(message = "Sender ID is required")
    private Integer senderId;
    
    private String senderName;
    private String senderRole;
    
    @NotNull(message = "Receiver ID is required")
    private Integer receiverId;
    
    private String receiverName;
    private String receiverRole;
    
    @NotBlank(message = "Message content is required")
    @Size(max = 1000, message = "Message content must not exceed 1000 characters")
    private String content;
    
    private Boolean isRead;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

