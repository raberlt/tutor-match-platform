package fsa.training.tutormatch.service.interfaces;

import fsa.training.tutormatch.entity.User;
import java.util.List;
import java.util.Optional;

public interface IUserService {
    User save(User user);
    Optional<User> findById(Integer id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    void deleteById(Integer id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean changePassword(String user, String oldPassword, String newPassword);
    User createUser(String username, String email, String password, String firstName, String lastName, User.Role role);

    List<User> getAllTutors();
}