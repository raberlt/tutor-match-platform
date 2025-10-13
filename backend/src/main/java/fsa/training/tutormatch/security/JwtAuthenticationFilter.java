package fsa.training.tutormatch.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import fsa.training.tutormatch.security.JwtUtil;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        // JWT Token format: "Bearer token"
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwtToken);
            } catch (Exception e) {
                logger.warn("Unable to get JWT Token or JWT Token has expired: " + e.getMessage());
            }
        }

        // Validate token và set authentication context
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // Validate token
                if (jwtUtil.validateToken(jwtToken, userDetails)) {
                // Extract role from JWT token for additional verification
                String roleFromToken = jwtUtil.extractRole(jwtToken);
                
                // Create authentication token
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, 
                        null, 
                        userDetails.getAuthorities()
                    );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set authentication context
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                // Add custom attributes to request for role-based access
                request.setAttribute("jwt.username", username);
                request.setAttribute("jwt.role", roleFromToken);
                }
            } catch (Exception e) {
                logger.warn("User not found or invalid token for username: " + username + ", error: " + e.getMessage());
                // Clear any existing authentication
                SecurityContextHolder.clearContext();
            }
        }
        
        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // Bypass JWT filter for public endpoints
        return path.startsWith("/api/auth/login") || 
               path.startsWith("/api/auth/register") ||
               path.startsWith("/api/public/") ||
               path.startsWith("/api/booking/types") ||
               path.startsWith("/api/booking/statuses") ||
               path.startsWith("/api/booking/info") ||
               path.startsWith("/api/booking/all") ||
               path.startsWith("/api/booking/create") ||
               path.startsWith("/api/booking/") && path.matches(".*/\\d+$") ||
               path.startsWith("/css/") ||
               path.startsWith("/js/") ||
               path.startsWith("/images/") ||
               path.equals("/favicon.ico");
    }
} 