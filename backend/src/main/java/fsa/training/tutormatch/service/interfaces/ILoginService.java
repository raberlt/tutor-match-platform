package fsa.training.tutormatch.service.interfaces;

import fsa.training.tutormatch.dto.JwtResponse;
import fsa.training.tutormatch.dto.LoginRequest;
import org.springframework.security.core.Authentication;

/**
 * Component interface trong Decorator Pattern
 * Định nghĩa operations cho login service
 */
public interface ILoginService {
    
    /**
     * Thực hiện đăng nhập
     */
    JwtResponse login(LoginRequest request);
    
    /**
     * Authenticate user
     */
    Authentication authenticate(String username, String password);
}


