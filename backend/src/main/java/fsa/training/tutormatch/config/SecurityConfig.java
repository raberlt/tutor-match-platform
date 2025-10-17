package fsa.training.tutormatch.config;

import fsa.training.tutormatch.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                // Public resources
                .requestMatchers("/css/**", "/images/**", "/js/**", "/favicon.ico").permitAll()
                .requestMatchers("/fragment/**").permitAll()
                
                // Swagger/OpenAPI endpoints
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**").permitAll()
                
                // Auth endpoints - public
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/validate").permitAll()
                .requestMatchers("/showRegister", "/register", "/showLogin", "/login").permitAll()
                
                // Public API endpoints - chỉ thông tin cơ bản
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/booking/types").permitAll()
                .requestMatchers("/api/booking/statuses").permitAll()
                .requestMatchers("/api/booking/info").permitAll()
                
                // Booking endpoints cần phân quyền
                .requestMatchers("/api/booking/all").hasRole("ADMIN") // Chỉ admin xem tất cả
                .requestMatchers("/api/booking/create").authenticated() // Cần đăng nhập để tạo
                .requestMatchers("/api/booking/{id}").authenticated() // Cần đăng nhập để xem chi tiết
                .requestMatchers("/api/booking/{id}/status").hasAnyRole("ADMIN", "TUTOR") // Admin và tutor cập nhật status
                
                // Role-based API endpoints
                .requestMatchers("/api/booking/tutor/**").hasRole("TUTOR")
                .requestMatchers("/api/booking/student/**").hasAnyRole("STUDENT", "TUTOR")
                .requestMatchers("/api/booking/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/refresh", "/api/auth/change-password", "/api/auth/logout").authenticated()
                .requestMatchers("/api/profile/**").authenticated()
                .requestMatchers("/api/admin/**").permitAll() // Tạm thời disable authentication để test
                .requestMatchers("/api/applications/admin/**").permitAll() // Tạm thời disable authentication để test
                .requestMatchers("/api/tutor/draft/**").hasAnyRole("STUDENT", "TUTOR")
                .requestMatchers("/api/auth/profile").permitAll() // Tạm thời disable authentication để test
                .requestMatchers("/api/tutor/**").hasRole("TUTOR")
                .requestMatchers("/api/student/**").hasAnyRole("STUDENT", "TUTOR")
                .requestMatchers("/api/tutors/**").hasAnyRole("STUDENT", "TUTOR")
                .requestMatchers("/api/messages/**").authenticated() // Message endpoints cần đăng nhập
                
                // Web pages with role-based access
                .requestMatchers("/profile-setup").hasAnyRole("STUDENT", "TUTOR")
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/student/**").hasRole("STUDENT")
                .requestMatchers("/tutor/**").hasRole("TUTOR")
                .requestMatchers("/messages", "/my-sessions", "/teaching-schedule", "/students", "/reviews", "/profile", "/settings").authenticated()
                
                .anyRequest().permitAll()
            )
            .formLogin(form -> form
                .loginPage("/showLogin")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/", true)
                .failureUrl("/showLogin?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .permitAll()
            );

        // Add JWT filter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}