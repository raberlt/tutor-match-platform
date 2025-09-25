package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.TutorProfile;
import org.springframework.stereotype.Service;

/**
 * Simple profile validation service
 */
@Service
public class ProfileValidationService {
    
    /**
     * Validate profile
     */
    public ValidationResult validateProfile(Profile profile) {
        if (profile instanceof TutorProfile) {
            return validateTutorProfile((TutorProfile) profile);
        } else {
            return new ValidationResult(false, "Unknown profile type");
        }
    }
    
    /**
     * Check if profile is valid
     */
    public boolean isProfileValid(Profile profile) {
        return validateProfile(profile).isValid();
    }
    
    /**
     * Get validation message
     */
    public String getValidationMessage(Profile profile) {
        return validateProfile(profile).getMessage();
    }
    
    
    private ValidationResult validateTutorProfile(TutorProfile profile) {
        if (profile.getUser() == null) {
            return new ValidationResult(false, "User is required");
        }
        if (profile.getUser().getUsername() == null || profile.getUser().getUsername().trim().isEmpty()) {
            return new ValidationResult(false, "Username is required");
        }
        if (profile.getBio() == null || profile.getBio().trim().isEmpty()) {
            return new ValidationResult(false, "Bio is required for tutor");
        }
        return new ValidationResult(true, "Tutor profile is valid");
    }
    
    /**
     * Bulk validation for multiple profiles
     */
    public ValidationSummary validateMultipleProfiles(java.util.List<Profile> profiles) {
        int validCount = 0;
        int invalidCount = 0;
        java.util.List<String> errors = new java.util.ArrayList<>();
        
        for (Profile profile : profiles) {
            ValidationResult result = validateProfile(profile);
            if (result.isValid()) {
                validCount++;
            } else {
                invalidCount++;
                errors.add(profile.getDisplayName() + ": " + result.getMessage());
            }
        }
        
        return new ValidationSummary(validCount, invalidCount, errors);
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final String message;
        
        public ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
    }
    
    public static class ValidationSummary {
        private final int validCount;
        private final int invalidCount;
        private final java.util.List<String> errors;
        
        public ValidationSummary(int validCount, int invalidCount, java.util.List<String> errors) {
            this.validCount = validCount;
            this.invalidCount = invalidCount;
            this.errors = errors;
        }
        
        public int getValidCount() { return validCount; }
        public int getInvalidCount() { return invalidCount; }
        public java.util.List<String> getErrors() { return errors; }
        
        public boolean hasErrors() { return invalidCount > 0; }
        
        @Override
        public String toString() {
            return String.format("Validation Summary: Valid=%d, Invalid=%d, Errors=%d", 
                               validCount, invalidCount, errors.size());
        }
    }
} 
 
 