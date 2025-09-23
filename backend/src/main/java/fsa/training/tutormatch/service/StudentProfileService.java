package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.StudentProfileRequest;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.ProfileStatus;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.repository.StudentProfileRepository;
import fsa.training.tutormatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentProfileService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    /**
     * Save/Update Student profile draft
     */
    @Transactional
    public Map<String, Object> saveStudentProfileDraft(String username, StudentProfileRequest request) {
        log.info("Saving student profile draft for: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("Only students can update student profiles");
        }

        // Find existing student profile or create new one
        StudentProfile studentProfile = studentProfileRepository
                .findByUserId(user.getId())
                .orElse(null);
        
        if (studentProfile == null) {
            // Create new student profile
            studentProfile = new StudentProfile();
            studentProfile.setUser(user);
            studentProfile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
            log.info("Created new student profile for: {}", username);
        } else {
            log.info("Updating existing student profile for: {}", username);
            // Set status to PENDING_VERIFICATION when updating personal info
            if (request.getFirstName() != null || request.getLastName() != null || request.getImageAvatar() != null) {
                studentProfile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
            }
        }

        // Update profile from request (firstName, lastName, imageAvatar stored in profile for admin approval)
        updateStudentProfileFromRequest(studentProfile, request);
        
        // Save profile
        studentProfile = studentProfileRepository.save(studentProfile);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Student profile saved successfully");
        result.put("profileId", studentProfile.getId());
        result.put("status", studentProfile.getProfileStatus());
        result.put("needsApproval", studentProfile.getProfileStatus() == ProfileStatus.PENDING_VERIFICATION);
        
        return result;
    }

    /**
     * Submit Student profile for admin approval
     */
    @Transactional
    public Map<String, Object> submitStudentProfile(String username, StudentProfileRequest request) {
        log.info("Submitting student profile for admin approval: {}", username);
        
        // First save the profile
        Map<String, Object> saveResult = saveStudentProfileDraft(username, request);
        
        // Get the saved profile 
        User user = userRepository.findByUsername(username).orElseThrow();
        StudentProfile studentProfile = studentProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        
        // Change status to PENDING_VERIFICATION for admin approval
        studentProfile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
        studentProfileRepository.save(studentProfile);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Student profile submitted for admin review");
        result.put("profileId", studentProfile.getId());
        result.put("status", studentProfile.getProfileStatus());
        
        return result;
    }

    /**
     * Admin approve Student profile changes
     */
    @Transactional
    public Map<String, Object> approveStudentProfile(Integer profileId, String adminUsername) {
        log.info("Admin {} approving student profile {}", adminUsername, profileId);
        
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        StudentProfile studentProfile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        
        if (studentProfile.getProfileStatus() != ProfileStatus.PENDING_VERIFICATION) {
            throw new RuntimeException("Invalid profile state for approval");
        }
        
        User student = studentProfile.getUser();
        
        // Update User info from approved profile
        if (studentProfile.getFirstName() != null) {
            student.setFirstName(studentProfile.getFirstName());
        }
        if (studentProfile.getLastName() != null) {
            student.setLastName(studentProfile.getLastName());
        }
        if (studentProfile.getImageAvatar() != null) {
            student.setImageAvatar(studentProfile.getImageAvatar());
        }
        
        // Update profile status
        studentProfile.setProfileStatus(ProfileStatus.ACTIVE);
        studentProfile.setApprovedBy(admin);
        studentProfile.setApprovedAt(java.time.ZonedDateTime.now());
        
        // Set user as verified
        student.setVerified(true);
        
        studentProfileRepository.save(studentProfile);
        userRepository.save(student);
        
        return Map.of(
            "success", true,
            "message", "Student profile approved successfully!",
            "profileId", studentProfile.getId(),
            "status", studentProfile.getProfileStatus()
        );
    }

    /**
     * Update StudentProfile from request
     */
    private void updateStudentProfileFromRequest(StudentProfile profile, StudentProfileRequest request) {
        // Update profile info (stored in profile for admin approval)
        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getImageAvatar() != null) profile.setImageAvatar(request.getImageAvatar());
        
        // Update student-specific fields
        if (request.getEducationLevel() != null) profile.setEducationLevel(request.getEducationLevel());
        
        // Update user info (these can be updated directly as they're not subject to admin approval)
        User user = profile.getUser();
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty() && 
            request.getPhoneNumber().matches("^[0-9]{9,15}$")) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getTimezone() != null) user.setTimezone(request.getTimezone());
    }

    /**
     * Get student profile data for form initialization
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentProfileData(String username) {
        log.info("Getting student profile data for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        if (user.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("Only students can access student profile data");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("userRole", user.getRole());
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        
        // Find existing student profile
        StudentProfile studentProfile = studentProfileRepository
                .findByUserId(user.getId())
                .orElse(null);
        
        if (studentProfile != null) {
            result.put("hasProfile", true);
            result.put("profileId", studentProfile.getId());
            result.put("status", studentProfile.getProfileStatus());
            
            // Personal info from profile (subject to admin approval if pending)
            result.put("firstName", studentProfile.getFirstName() != null ? studentProfile.getFirstName() : user.getFirstName());
            result.put("lastName", studentProfile.getLastName() != null ? studentProfile.getLastName() : user.getLastName());
            result.put("imageAvatar", studentProfile.getImageAvatar() != null ? studentProfile.getImageAvatar() : user.getImageAvatar());
            
            // Student-specific fields
            result.put("educationLevel", studentProfile.getEducationLevel());
            
            result.put("createdAt", studentProfile.getCreatedAt());
            result.put("updatedAt", studentProfile.getUpdatedAt());
            
            if (studentProfile.getApprovedBy() != null) {
                result.put("approvedBy", studentProfile.getApprovedBy().getUsername());
                result.put("approvedAt", studentProfile.getApprovedAt());
            }
        } else {
            result.put("hasProfile", false);
            
            // Return user info as fallback data
            result.put("firstName", user.getFirstName());
            result.put("lastName", user.getLastName());
            result.put("imageAvatar", user.getImageAvatar());
        }
        
        // Always include user info
        result.put("phoneNumber", user.getPhoneNumber());
        result.put("address", user.getAddress());
        result.put("dateOfBirth", user.getDateOfBirth());
        result.put("gender", user.getGender());
        result.put("timezone", user.getTimezone());
        result.put("email", user.getEmail());
        result.put("verified", user.isVerified());
        
        result.put("message", "Student profile data retrieved successfully");
        return result;
    }
}
