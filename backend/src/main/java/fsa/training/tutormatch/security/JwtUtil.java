package fsa.training.tutormatch.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:tutormatch-secret-key-for-jwt-authentication-and-authorization-system}")
    private String secret;

    @Value("${jwt.expiration:86400}") // 24 hours in seconds
    private int jwtExpiration;

    private SecretKey key;

    @PostConstruct
    public void init() {
        // Create a secure key from the secret string
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Generate JWT token từ UserDetails
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        // Add role to claims
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        claims.put("role", role);
        claims.put("authorities", userDetails.getAuthorities());
        
        return createToken(claims, userDetails.getUsername());
    }


    /**
     * Tạo JWT token
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration * 1000L))
                .signWith(key)
                .compact();
    }

    /**
     * Extract username từ JWT token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract role từ JWT token
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Extract expiration date từ JWT token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract specific claim từ JWT token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract tất cả claims từ JWT token
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new JwtException("JWT token đã hết hạn", e);
        } catch (UnsupportedJwtException e) {
            throw new JwtException("JWT token không được hỗ trợ", e);
        } catch (MalformedJwtException e) {
            throw new JwtException("JWT token không hợp lệ", e);
        } catch (SecurityException e) {
            throw new JwtException("JWT signature không hợp lệ", e);
        } catch (IllegalArgumentException e) {
            throw new JwtException("JWT claims string rỗng", e);
        }
    }

    /**
     * Kiểm tra JWT token đã hết hạn chưa
     */
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validate JWT token
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (JwtException e) {
            return false;
        }
    }

    /**
     * Validate JWT token mà không cần UserDetails
     */
    public Boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    /**
     * Get JWT expiration time in milliseconds
     */
    public long getExpirationTime() {
        return jwtExpiration * 1000L;
    }

} 