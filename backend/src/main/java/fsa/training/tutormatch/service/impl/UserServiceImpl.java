package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;


    @Override
    public Optional<User> findById(Integer id){
        return userRepository.findById(id);
    }

    @Override
    public User save(User user){
        // Chỉ encode password nếu nó chưa được encode (không bắt đầu với $2a$)
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        // Default role
        if (user.getRole() == null) {
            user.setRole(UserRole.STUDENT); // Hoặc default role khác
        }

        return userRepository.save(user);
    }
    
    public List<User> getAllTutors() {
        return userRepository.findByRole(UserRole.TUTOR);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Đổi mật khẩu
     *
     * @return
     */
    @Override
    public boolean changePassword(String username, String oldPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return false;
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return true;
    }
    
    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    @Override
    public void deleteById(Integer id) {
        userRepository.deleteById(id);
    }
    
    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    public User createUser(String username, String email, String password, String firstName, String lastName, UserRole role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        return save(user);
    }
}
