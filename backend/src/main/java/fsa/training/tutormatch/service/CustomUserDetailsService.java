package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.CustomUserDetails;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("userDetailsService")
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        // Cho phép đăng nhập bằng username hoặc email
        User user = userRepo.findByUsername(login)
                .orElseGet(() -> userRepo.findByEmail(login)
                        .orElseGet(() -> userRepo.findByPhoneNumber(login)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found with username/email/phone: " + login))));

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        // With multi-profiles, we may not have a single profileId to attach
        Integer profileId = null;

        return new CustomUserDetails(
                // Principal luôn là username để đồng nhất các chỗ authentication.getName()
                user.getUsername(),
                user.getPassword(),
                authorities,
                profileId
        );
    }
}
