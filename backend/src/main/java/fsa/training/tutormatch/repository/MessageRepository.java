package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Message;
import fsa.training.tutormatch.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    
    // Lấy tin nhắn giữa 2 người dùng
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findMessagesBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    // Lấy tin nhắn giữa 2 người dùng với phân trang
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.createdAt ASC")
    Page<Message> findMessagesBetweenUsers(@Param("user1") User user1, @Param("user2") User user2, Pageable pageable);
    
    // Lấy tất cả tin nhắn (cho admin)
    @Query("SELECT m FROM Message m ORDER BY m.createdAt DESC")
    List<Message> findAllMessagesOrderByCreatedAtDesc();
    
    // Lấy tất cả tin nhắn với phân trang (cho admin)
    @Query("SELECT m FROM Message m ORDER BY m.createdAt DESC")
    Page<Message> findAllMessagesOrderByCreatedAtDesc(Pageable pageable);
    
    // Lấy tin nhắn của một người dùng (tất cả cuộc trò chuyện)
    @Query("SELECT m FROM Message m WHERE m.sender = :user OR m.receiver = :user ORDER BY m.createdAt DESC")
    List<Message> findMessagesByUser(@Param("user") User user);
    
    // Lấy tin nhắn của một người dùng với phân trang
    @Query("SELECT m FROM Message m WHERE m.sender = :user OR m.receiver = :user ORDER BY m.createdAt DESC")
    Page<Message> findMessagesByUser(@Param("user") User user, Pageable pageable);
    
    // Lấy tin nhắn chưa đọc của một người dùng
    @Query("SELECT m FROM Message m WHERE m.receiver = :user AND m.isRead = false ORDER BY m.createdAt ASC")
    List<Message> findUnreadMessagesByUser(@Param("user") User user);
    
    // Đếm tin nhắn chưa đọc của một người dùng
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :user AND m.isRead = false")
    Long countUnreadMessagesByUser(@Param("user") User user);
    
    // Đánh dấu tin nhắn là đã đọc
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender = :sender AND m.receiver = :receiver AND m.isRead = false")
    void markMessagesAsRead(@Param("sender") User sender, @Param("receiver") User receiver);
    
    // Lấy tin nhắn cuối cùng giữa 2 người dùng
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.createdAt DESC")
    List<Message> findLastMessageBetweenUsers(@Param("user1") User user1, @Param("user2") User user2, Pageable pageable);
    
    // Lấy danh sách cuộc trò chuyện của một người dùng (người đã nhắn tin với họ)
    @Query("SELECT DISTINCT u FROM User u WHERE u IN " +
           "(SELECT CASE WHEN m.sender = :user THEN m.receiver ELSE m.sender END " +
           "FROM Message m WHERE m.sender = :user OR m.receiver = :user) " +
           "ORDER BY u.firstName, u.lastName")
    List<User> findConversationParticipants(@Param("user") User user);
    
    // Tìm kiếm tin nhắn theo nội dung (cho admin)
    @Query("SELECT m FROM Message m WHERE m.content LIKE %:searchTerm% ORDER BY m.createdAt DESC")
    List<Message> searchMessagesByContent(@Param("searchTerm") String searchTerm);
    
    // Lấy tin nhắn theo khoảng thời gian (cho admin)
    @Query("SELECT m FROM Message m WHERE m.createdAt BETWEEN :startDate AND :endDate ORDER BY m.createdAt DESC")
    List<Message> findMessagesByDateRange(@Param("startDate") java.time.LocalDateTime startDate, 
                                        @Param("endDate") java.time.LocalDateTime endDate);

    // Methods needed by MessageController
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :receiver AND m.sender = :sender AND m.isRead = false")
    Long countByReceiverAndSenderAndIsReadFalse(@Param("receiver") User receiver, @Param("sender") User sender);

    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :sender AND m.receiver = :receiver) OR " +
           "(m.sender = :receiver AND m.receiver = :sender)")
    Page<Message> findBySenderAndReceiverOrReceiverAndSenderOrderByCreatedAtDesc(@Param("sender") User sender, @Param("receiver") User receiver, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :receiver AND m.isRead = false")
    Long countByReceiverAndIsReadFalse(@Param("receiver") User receiver);
}
