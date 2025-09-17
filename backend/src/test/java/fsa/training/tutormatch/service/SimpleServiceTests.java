package fsa.training.tutormatch.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.*;

/**
 * 🧪 Simple Unit Tests - Basic testing trước khi fix Lombok
 * 
 * Chỉ test logic đơn giản không cần Entity/Repository
 */
@SpringBootTest
class SimpleServiceTests {

    // =============== TEST CASE 1: Basic String Logic ===============
    
    @Test
    @DisplayName("🧪 Test Case 1.1: Email validation logic")
    void testEmailValidation() {
        // Given
        String validEmail = "test@example.com";
        String invalidEmail = "invalid-email";
        String nullEmail = null;
        
        // When & Then
        assertThat(isValidEmail(validEmail)).isTrue();
        assertThat(isValidEmail(invalidEmail)).isFalse();
        assertThat(isValidEmail(nullEmail)).isFalse();
    }
    
    @Test
    @DisplayName("🧪 Test Case 1.2: Role validation logic")
    void testRoleValidation() {
        // Given
        String validRole1 = "STUDENT";
        String validRole2 = "TUTOR";
        String validRole3 = "ADMIN";
        String invalidRole = "INVALID_ROLE";
        String nullRole = null;
        
        // When & Then
        assertThat(isValidRole(validRole1)).isTrue();
        assertThat(isValidRole(validRole2)).isTrue();
        assertThat(isValidRole(validRole3)).isTrue();
        assertThat(isValidRole(invalidRole)).isFalse();
        assertThat(isValidRole(nullRole)).isFalse();
    }
    
    @Test
    @DisplayName("🧪 Test Case 1.3: Password strength validation")
    void testPasswordStrength() {
        // Given
        String strongPassword = "StrongPass123!";
        String weakPassword = "123";
        String nullPassword = null;
        String emptyPassword = "";
        
        // When & Then
        assertThat(isStrongPassword(strongPassword)).isTrue();
        assertThat(isStrongPassword(weakPassword)).isFalse();
        assertThat(isStrongPassword(nullPassword)).isFalse();
        assertThat(isStrongPassword(emptyPassword)).isFalse();
    }

    // =============== TEST CASE 2: Business Logic Calculations ===============
    
    @Test
    @DisplayName("🧪 Test Case 2.1: Fee calculation logic")
    void testFeeCalculation() {
        // Given
        int baseFee = 100000;
        double premiumMultiplier = 1.5;
        double discountRate = 0.1;
        
        // When
        int premiumFee = calculatePremiumFee(baseFee, premiumMultiplier);
        int discountedFee = calculateDiscountedFee(baseFee, discountRate);
        
        // Then
        assertThat(premiumFee).isEqualTo(150000);
        assertThat(discountedFee).isEqualTo(90000);
    }
    
    @Test
    @DisplayName("🧪 Test Case 2.2: Rating calculation logic")
    void testRatingCalculation() {
        // Given
        double[] ratings = {4.5, 5.0, 4.0, 4.8, 4.2};
        
        // When
        double averageRating = calculateAverageRating(ratings);
        
        // Then
        assertThat(averageRating).isEqualTo(4.5);
    }
    
    @Test
    @DisplayName("🧪 Test Case 2.3: Budget range validation")
    void testBudgetRangeValidation() {
        // Given
        int minBudget1 = 100000;
        int maxBudget1 = 500000;
        
        int minBudget2 = 500000;
        int maxBudget2 = 100000; // Invalid: min > max
        
        // When & Then
        assertThat(isValidBudgetRange(minBudget1, maxBudget1)).isTrue();
        assertThat(isValidBudgetRange(minBudget2, maxBudget2)).isFalse();
        assertThat(isValidBudgetRange(-1, 100000)).isFalse(); // Negative min
        assertThat(isValidBudgetRange(100000, -1)).isFalse(); // Negative max
    }

    // =============== TEST CASE 3: Design Pattern Logic ===============
    
    @Test
    @DisplayName("🧪 Test Case 3.1: Singleton Pattern validation")
    void testSingletonPattern() {
        // Given & When
        Object instance1 = getSingletonInstance();
        Object instance2 = getSingletonInstance();
        
        // Then
        assertThat(instance1).isNotNull();
        assertThat(instance2).isNotNull();
        assertThat(instance1).isSameAs(instance2);
        assertThat(instance1.hashCode()).isEqualTo(instance2.hashCode());
    }
    
    @Test
    @DisplayName("🧪 Test Case 3.2: Factory Pattern validation")
    void testFactoryPattern() {
        // Given
        String profileType1 = "STUDENT";
        String profileType2 = "TUTOR";
        String invalidType = "INVALID";
        
        // When
        String profile1 = createProfile(profileType1);
        String profile2 = createProfile(profileType2);
        String profile3 = createProfile(invalidType);
        
        // Then
        assertThat(profile1).isEqualTo("StudentProfile");
        assertThat(profile2).isEqualTo("TutorProfile");
        assertThat(profile3).isNull();
    }
    
    @Test
    @DisplayName("🧪 Test Case 3.3: Builder Pattern validation")
    void testBuilderPattern() {
        // Given & When
        String profile = buildProfile()
                .withName("John Doe")
                .withEmail("john@example.com")
                .withBudget(100000, 500000)
                .build();
        
        // Then
        assertThat(profile).isNotNull();
        assertThat(profile).contains("John Doe");
        assertThat(profile).contains("john@example.com");
        assertThat(profile).contains("100000");
        assertThat(profile).contains("500000");
    }

    // =============== HELPER METHODS ===============
    
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return email.contains("@") && email.contains(".");
    }
    
    private boolean isValidRole(String role) {
        if (role == null) {
            return false;
        }
        return role.equals("STUDENT") || role.equals("TUTOR") || role.equals("ADMIN");
    }
    
    private boolean isStrongPassword(String password) {
        if (password == null || password.length() < 6) {
            return false;
        }
        return password.length() >= 8 && 
               password.matches(".*[A-Z].*") && 
               password.matches(".*[a-z].*") && 
               password.matches(".*[0-9].*");
    }
    
    private int calculatePremiumFee(int baseFee, double multiplier) {
        return (int) (baseFee * multiplier);
    }
    
    private int calculateDiscountedFee(int baseFee, double discountRate) {
        return (int) (baseFee * (1 - discountRate));
    }
    
    private double calculateAverageRating(double[] ratings) {
        if (ratings.length == 0) return 0.0;
        double sum = 0;
        for (double rating : ratings) {
            sum += rating;
        }
        return sum / ratings.length;
    }
    
    private boolean isValidBudgetRange(int min, int max) {
        return min >= 0 && max >= 0 && min <= max;
    }
    
    private Object getSingletonInstance() {
        // Simulate singleton pattern
        return SingletonSimulator.getInstance();
    }
    
    private String createProfile(String type) {
        // Simulate factory pattern
        switch (type) {
            case "STUDENT": return "StudentProfile";
            case "TUTOR": return "TutorProfile";
            default: return null;
        }
    }
    
    private ProfileBuilder buildProfile() {
        return new ProfileBuilder();
    }
    
    // =============== HELPER CLASSES ===============
    
    private static class SingletonSimulator {
        private static final SingletonSimulator INSTANCE = new SingletonSimulator();
        
        private SingletonSimulator() {}
        
        public static SingletonSimulator getInstance() {
            return INSTANCE;
        }
    }
    
    private static class ProfileBuilder {
        private StringBuilder profile = new StringBuilder();
        
        public ProfileBuilder withName(String name) {
            profile.append("Name: ").append(name).append("; ");
            return this;
        }
        
        public ProfileBuilder withEmail(String email) {
            profile.append("Email: ").append(email).append("; ");
            return this;
        }
        
        public ProfileBuilder withBudget(int min, int max) {
            profile.append("Budget: ").append(min).append("-").append(max).append("; ");
            return this;
        }
        
        public String build() {
            return profile.toString();
        }
    }
}
