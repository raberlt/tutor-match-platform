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
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepo.findByUsername(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + email));

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole())
        );

        Integer profileId = user.getProfile() != null ? user.getProfile().getId().intValue() : null;
        String profileName = user.getProfile() != null ? user.getProfile().getFullName() : null;


        return new CustomUserDetails(
                user.getUsername(),
                user.getPassword(),
                authorities,
                profileId,
                profileName
        );
    }
}
