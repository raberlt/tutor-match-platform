package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.BecomeTutorRequest;
import fsa.training.tutormatch.dto.TutorDraftRequest;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.ProfileStatus;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.repository.TutorProfileRepository;
import fsa.training.tutormatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TutorProfileDraftService {
    
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;

    /**
     * Lưu nháp cho Student (chưa là tutor)
     * Tạo hoặc cập nhật bản ghi isDraft=true với status=INACTIVE
     */
    @Transactional
    public Map<String, Object> saveDraftForStudent(String username, BecomeTutorRequest request) {
        log.info("Saving draft for student: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("Only students can create new tutor profiles");
        }
        
        // Tìm hoặc tạo bản ghi draft
        TutorProfile draftProfile = findOrCreateDraftProfile(user);
        
        // Cập nhật thông tin từ request
        updateProfileFromRequest(draftProfile, request);
        draftProfile.setProfileStatus(ProfileStatus.INACTIVE);
        draftProfile.setDraft(true);
        
        TutorProfile saved = tutorProfileRepository.save(draftProfile);
        
        return Map.of(
            "success", true,
            "message", "Đã lưu nháp thành công!",
            "profileId", saved.getId(),
            "isDraft", saved.isDraft(),
            "status", saved.getProfileStatus()
        );
    }

    /**
     * Gửi hồ sơ cho Student (chuyển từ draft sang pending)
     */
    @Transactional
    public Map<String, Object> submitApplicationForStudent(String username, BecomeTutorRequest request) {
        log.info("Submitting application for student: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("Only students can submit tutor applications");
        }
        
        // Tìm hoặc tạo bản ghi draft
        TutorProfile draftProfile = findOrCreateDraftProfile(user);
        
        // Cập nhật thông tin từ request
        updateProfileFromRequest(draftProfile, request);
        draftProfile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
        draftProfile.setDraft(true);
        
        TutorProfile saved = tutorProfileRepository.save(draftProfile);
        
        return Map.of(
            "success", true,
            "message", "Đã gửi hồ sơ thành công! Vui lòng chờ admin duyệt.",
            "profileId", saved.getId(),
            "isDraft", saved.isDraft(),
            "status", saved.getProfileStatus()
        );
    }

    /**
     * Lưu nháp cho Tutor (đã có 2 hồ sơ)
     * Cập nhật bản ghi isDraft=true + auto-update một số field sang isDraft=false
     */
    @Transactional
    public Map<String, Object> saveDraftForTutor(String username, BecomeTutorRequest request) {
        log.info("Saving draft for tutor: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.TUTOR) {
            throw new RuntimeException("Only tutors can update existing profiles");
        }
        
        // Lấy cả 2 bản ghi
        TutorProfile draftProfile = getDraftProfile(user);
        TutorProfile publicProfile = getPublicProfile(user);
        
        // Cập nhật bản draft
        updateProfileFromRequest(draftProfile, request);
        draftProfile.setProfileStatus(ProfileStatus.ACTIVE); // Tutor vẫn giữ status ACTIVE
        
        // Auto-update một số field sang public profile (không cần admin duyệt)
        autoUpdatePublicProfile(publicProfile, request);
        
        tutorProfileRepository.save(draftProfile);
        tutorProfileRepository.save(publicProfile);
        
        return Map.of(
            "success", true,
            "message", "Đã lưu nháp thành công! Một số thông tin đã được cập nhật công khai.",
            "draftProfileId", draftProfile.getId(),
            "publicProfileId", publicProfile.getId()
        );
    }

    /**
     * Gửi hồ sơ cho Tutor (chuyển draft sang pending)
     */
    @Transactional
    public Map<String, Object> submitUpdateForTutor(String username, BecomeTutorRequest request) {
        log.info("Submitting update for tutor: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.TUTOR) {
            throw new RuntimeException("Only tutors can submit profile updates");
        }
        
        // Lấy cả 2 bản ghi
        TutorProfile draftProfile = getDraftProfile(user);
        TutorProfile publicProfile = getPublicProfile(user);
        
        // Cập nhật bản draft và chuyển sang pending
        updateProfileFromRequest(draftProfile, request);
        draftProfile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
        
        // Auto-update một số field sang public profile
        autoUpdatePublicProfile(publicProfile, request);
        
        tutorProfileRepository.save(draftProfile);
        tutorProfileRepository.save(publicProfile);
        
        return Map.of(
            "success", true,
            "message", "Đã gửi cập nhật thành công! Vui lòng chờ admin duyệt.",
            "draftProfileId", draftProfile.getId(),
            "publicProfileId", publicProfile.getId(),
            "status", draftProfile.getProfileStatus()
        );
    }

    /**
     * Admin duyệt hồ sơ Student
     */
    @Transactional
    public Map<String, Object> approveStudentApplication(Integer profileId, String adminUsername) {
        log.info("Admin {} approving student application {}", adminUsername, profileId);
        
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        TutorProfile draftProfile = tutorProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (!draftProfile.isDraft() || draftProfile.getProfileStatus() != ProfileStatus.PENDING_VERIFICATION) {
            throw new RuntimeException("Invalid profile state for approval");
        }
        
        User student = draftProfile.getUser();
        
        // Tạo bản ghi public (isDraft=false)
        TutorProfile publicProfile = createPublicProfileFromDraft(draftProfile);
        publicProfile.setApprovedBy(admin);
        publicProfile.setApprovedAt(java.time.ZonedDateTime.now());
        
        // Cập nhật draft profile
        draftProfile.setProfileStatus(ProfileStatus.ACTIVE);
        draftProfile.setApprovedBy(admin);
        draftProfile.setApprovedAt(java.time.ZonedDateTime.now());
        
        // Update User info from approved profile
        if (draftProfile.getFirstName() != null) {
            student.setFirstName(draftProfile.getFirstName());
        }
        if (draftProfile.getLastName() != null) {
            student.setLastName(draftProfile.getLastName());
        }
        if (draftProfile.getImageAvatar() != null) {
            student.setImageAvatar(draftProfile.getImageAvatar());
        }
        
        // Chuyển user thành TUTOR
        student.setRole(UserRole.TUTOR);
        student.setVerified(true);
        
        tutorProfileRepository.save(draftProfile);
        tutorProfileRepository.save(publicProfile);
        userRepository.save(student);
        
        return Map.of(
            "success", true,
            "message", "Đã duyệt hồ sơ thành công!",
            "draftProfileId", draftProfile.getId(),
            "publicProfileId", publicProfile.getId(),
            "newRole", student.getRole()
        );
    }

    /**
     * Admin duyệt cập nhật của Tutor
     */
    @Transactional
    public Map<String, Object> approveTutorUpdate(Integer profileId, String adminUsername) {
        log.info("Admin {} approving tutor update {}", adminUsername, profileId);
        
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        TutorProfile draftProfile = tutorProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (!draftProfile.isDraft() || draftProfile.getProfileStatus() != ProfileStatus.PENDING_VERIFICATION) {
            throw new RuntimeException("Invalid profile state for approval");
        }
        
        User tutor = draftProfile.getUser();
        TutorProfile publicProfile = getPublicProfile(tutor);
        
        // Copy thông tin từ draft sang public
        copyDraftToPublic(draftProfile, publicProfile);
        publicProfile.setApprovedBy(admin);
        publicProfile.setApprovedAt(java.time.ZonedDateTime.now());
        
        // Reset draft về ACTIVE
        draftProfile.setProfileStatus(ProfileStatus.ACTIVE);
        draftProfile.setApprovedBy(admin);
        draftProfile.setApprovedAt(java.time.ZonedDateTime.now());
        
        tutorProfileRepository.save(draftProfile);
        tutorProfileRepository.save(publicProfile);
        
        return Map.of(
            "success", true,
            "message", "Đã duyệt cập nhật thành công!",
            "draftProfileId", draftProfile.getId(),
            "publicProfileId", publicProfile.getId()
        );
    }

    // Helper methods
    private TutorProfile findOrCreateDraftProfile(User user) {
        return tutorProfileRepository.findByUserAndIsDraft(user, true)
                .orElseGet(() -> {
                    TutorProfile newProfile = new TutorProfile();
                    newProfile.setUser(user);
                    newProfile.setDraft(true);
                    newProfile.setProfileStatus(ProfileStatus.INACTIVE);
                    return newProfile;
                });
    }
    
    private TutorProfile getDraftProfile(User user) {
        return tutorProfileRepository.findByUserAndIsDraft(user, true)
                .orElseThrow(() -> new RuntimeException("Draft profile not found"));
    }
    
    private TutorProfile getPublicProfile(User user) {
        return tutorProfileRepository.findByUserAndIsDraft(user, false)
                .orElseThrow(() -> new RuntimeException("Public profile not found"));
    }
    
    private void updateProfileFromRequest(TutorProfile profile, BecomeTutorRequest request) {
        // Copy logic từ TutorApplicationServiceImpl
        if (request.getBio() != null) profile.setBio(request.getBio().trim());
        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline().trim());
        if (request.getExperience() != null) profile.setExperience(request.getExperience().trim());
        if (request.getTeachingLevel() != null) profile.setTeachingLevel(request.getTeachingLevel().getDisplayName());
        if (request.getCvUrl() != null) profile.setCvUrl(request.getCvUrl().trim());
        
        // User fields
        if (request.getFirstName() != null) profile.getUser().setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) profile.getUser().setLastName(request.getLastName().trim());
        if (request.getAddress() != null) profile.getUser().setAddress(request.getAddress().trim());
        if (request.getTimezone() != null) profile.getUser().setTimezone(request.getTimezone().trim());
        if (request.getAvatar() != null) profile.getUser().setImageAvatar(request.getAvatar().trim());
        
        // TODO: Handle schedules, subjects, certificates, educations
    }
    
    /**
     * Auto-update các field không cần admin duyệt
     * - address, schedules, fees, teachingLevel
     */
    private void autoUpdatePublicProfile(TutorProfile publicProfile, BecomeTutorRequest request) {
        // Cập nhật address
        if (request.getAddress() != null) {
            publicProfile.getUser().setAddress(request.getAddress().trim());
        }
        
        // Cập nhật teaching level
        if (request.getTeachingLevel() != null) {
            publicProfile.setTeachingLevel(request.getTeachingLevel().getDisplayName());
        }
        
        // TODO: Cập nhật schedules và fees (cần implement riêng)
        // updateSchedules(publicProfile, request.getSchedules());
        // updateSubjectFees(publicProfile, request.getSubjectFees());
    }
    
    private TutorProfile createPublicProfileFromDraft(TutorProfile draftProfile) {
        TutorProfile publicProfile = new TutorProfile();
        copyDraftToPublic(draftProfile, publicProfile);
        publicProfile.setDraft(false);
        publicProfile.setProfileStatus(ProfileStatus.ACTIVE);
        return publicProfile;
    }
    
    private void copyDraftToPublic(TutorProfile source, TutorProfile target) {
        target.setUser(source.getUser());
        
        // Copy personal info (firstName, lastName, imageAvatar)
        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setImageAvatar(source.getImageAvatar());
        
        // Copy tutor-specific fields
        target.setBio(source.getBio());
        target.setHeadline(source.getHeadline());
        target.setExperience(source.getExperience());
        target.setTeachingLevel(source.getTeachingLevel());
        target.setCvUrl(source.getCvUrl());
        target.setVideoIntro(source.getVideoIntro());
        // TODO: Copy schedules, subjects, certificates, educations
    }

    /**
     * Save draft using TutorDraftRequest
     */
    @Transactional
    public Map<String, Object> saveDraftRequest(String username, TutorDraftRequest request) {
        log.info("Saving draft request for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // Check if user is STUDENT or TUTOR
        if (user.getRole() == UserRole.STUDENT) {
            return saveDraftForStudent(username, request);
        } else if (user.getRole() == UserRole.TUTOR) {
            return saveDraftForTutor(username, request);
        } else {
            throw new RuntimeException("Invalid role for this operation");
        }
    }

    /**
     * Save draft for STUDENT (creates new tutor profile draft for student becoming tutor)
     */
    @Transactional 
    public Map<String, Object> saveDraftForStudent(String username, TutorDraftRequest request) {
        log.info("Saving tutor profile draft for student: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("Only students can create new tutor profiles");
        }

        // Find existing draft tutor profile or create new one
        TutorProfile draftProfile = tutorProfileRepository
                .findByUserAndIsDraft(user, true)
                .orElse(null);
        
        if (draftProfile == null) {
            // Create new draft tutor profile for student
            draftProfile = new TutorProfile();
            draftProfile.setUser(user);
            draftProfile.setDraft(true);
            draftProfile.setProfileStatus(ProfileStatus.INACTIVE);
            log.info("Created new tutor profile draft for student: {}", username);
        } else {
            log.info("Updating existing tutor profile draft for student: {}", username);
        }

        // Update profile from request (firstName, lastName, imageAvatar stored in profile for admin approval)
        updateProfileFromDraftRequest(draftProfile, request);
        
        // Save profile
        draftProfile = tutorProfileRepository.save(draftProfile);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Tutor profile draft saved successfully for student");
        result.put("profileId", draftProfile.getId());
        result.put("isDraft", draftProfile.isDraft());
        result.put("status", draftProfile.getProfileStatus());
        result.put("userRole", user.getRole());
        
        return result;
    }

    /**
     * Save draft for TUTOR (updates existing draft profile)
     */
    @Transactional
    public Map<String, Object> saveDraftForTutor(String username, TutorDraftRequest request) {
        log.info("Saving draft for tutor: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.TUTOR) {
            throw new RuntimeException("Only tutors can update existing profiles");
        }

        // Find existing draft profile (must exist for tutors)
        TutorProfile draftProfile = tutorProfileRepository
                .findByUserAndIsDraft(user, true)
                .orElseThrow(() -> new RuntimeException("Draft profile not found for tutor"));

        // Update profile from request
        updateProfileFromDraftRequest(draftProfile, request);
        
        // Auto-update public profile for certain fields (address, schedule, fees, teaching level)
        TutorProfile publicProfile = tutorProfileRepository
                .findByUserAndIsDraft(user, false)
                .orElse(null);
        
        if (publicProfile != null) {
            autoUpdatePublicProfileFromDraft(publicProfile, draftProfile, request);
            tutorProfileRepository.save(publicProfile);
        }
        
        // Save draft profile
        draftProfile = tutorProfileRepository.save(draftProfile);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Tutor draft saved successfully");
        result.put("profileId", draftProfile.getId());
        result.put("isDraft", draftProfile.isDraft());
        result.put("status", draftProfile.getProfileStatus());
        result.put("autoUpdatedPublic", publicProfile != null);
        
        return result;
    }

    /**
     * Update profile from TutorDraftRequest
     */
    private void updateProfileFromDraftRequest(TutorProfile profile, TutorDraftRequest request) {
        // Update profile info (stored in profile for admin approval)
        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getAvatar() != null) profile.setImageAvatar(request.getAvatar());
        
        // Update tutor-specific fields
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline());
        if (request.getExperience() != null) profile.setExperience(request.getExperience());
        if (request.getTeachingLevel() != null) profile.setTeachingLevel(request.getTeachingLevel().toString());
        if (request.getCvUrl() != null) profile.setCvUrl(request.getCvUrl());
        if (request.getVideoIntro() != null) profile.setVideoIntro(request.getVideoIntro());
        
        // Update user info (these can be updated directly as they're not subject to admin approval)
        User user = profile.getUser();
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty() && 
            request.getPhoneNumber().matches("^[0-9]{9,15}$")) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getTimezone() != null) user.setTimezone(request.getTimezone());
        
        // TODO: Handle subjectFees, schedules, educations, certificates
        // For now, just log them
        if (request.getSubjectFees() != null) {
            log.info("SubjectFees received: {}", request.getSubjectFees().size());
        }
        if (request.getSchedules() != null) {
            log.info("Schedules received: {}", request.getSchedules().size());
        }
        if (request.getEducations() != null) {
            log.info("Educations received: {}", request.getEducations().size());
        }
        if (request.getCertificates() != null) {
            log.info("Certificates received: {}", request.getCertificates().size());
        }
    }

    /**
     * Auto-update public profile for certain fields (tutor only)
     */
    private void autoUpdatePublicProfileFromDraft(TutorProfile publicProfile, TutorProfile draftProfile, TutorDraftRequest request) {
        // Auto-update fields that don't need admin approval
        if (request.getAddress() != null) {
            publicProfile.getUser().setAddress(request.getAddress());
        }
        // TODO: Auto-update schedules, fees, teaching level
        log.info("Auto-updated public profile for tutor");
    }


    /**
     * Submit draft for approval/processing 
     */
    @Transactional
    public Map<String, Object> submitDraftRequest(String username, TutorDraftRequest request) {
        log.info("Submit draft request for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // Check if user is STUDENT or TUTOR
        if (user.getRole() == UserRole.STUDENT) {
            return submitDraftForStudent(username, request);
        } else if (user.getRole() == UserRole.TUTOR) {
            return submitDraftForTutor(username, request);
        } else {
            throw new RuntimeException("Invalid role for this operation");
        }
    }

    /**
     * Submit draft for STUDENT (changes status to PENDING_VERIFICATION)
     */
    @Transactional
    public Map<String, Object> submitDraftForStudent(String username, TutorDraftRequest request) {
        log.info("Submitting draft for student: {}", username);
        
        // First save the draft 
        Map<String, Object> saveResult = saveDraftForStudent(username, request);
        
        // Get the saved profile 
        User user = userRepository.findByUsername(username).orElseThrow();
        TutorProfile draftProfile = tutorProfileRepository
                .findByUserAndIsDraft(user, true)
                .orElseThrow(() -> new RuntimeException("Draft profile not found"));
        
        // Change status to PENDING_VERIFICATION for admin approval
        draftProfile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
        tutorProfileRepository.save(draftProfile);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Application submitted for admin review");
        result.put("profileId", draftProfile.getId());
        result.put("status", draftProfile.getProfileStatus());
        result.put("nextStep", "Admin review required");
        
        log.info("Student application submitted - Status: PENDING_VERIFICATION");
        return result;
    }

    /**
     * Submit draft for TUTOR (changes status to PENDING)
     */
    @Transactional
    public Map<String, Object> submitDraftForTutor(String username, TutorDraftRequest request) {
        log.info("Submitting draft for tutor: {}", username);
        
        // First save the draft
        Map<String, Object> saveResult = saveDraftForTutor(username, request);
        
        // Get the saved profile
        User user = userRepository.findByUsername(username).orElseThrow();
        TutorProfile draftProfile = tutorProfileRepository
                .findByUserAndIsDraft(user, true)
                .orElseThrow(() -> new RuntimeException("Draft profile not found"));
        
        // Change status to PENDING_VERIFICATION for admin approval
        draftProfile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
        tutorProfileRepository.save(draftProfile);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Tutor profile changes submitted for admin review");
        result.put("profileId", draftProfile.getId());
        result.put("status", draftProfile.getProfileStatus());
        result.put("nextStep", "Admin review required");
        
        log.info("Tutor profile changes submitted - Status: PENDING");
        return result;
    }

    /**
     * Get draft profile data for form initialization
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDraftProfileData(String username) {
        log.info("Getting draft profile data for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("userRole", user.getRole());
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        
        if (user.getRole() == UserRole.STUDENT) {
            // For students becoming tutors - get draft tutor profile
            TutorProfile draftProfile = tutorProfileRepository
                    .findByUserAndIsDraft(user, true)
                    .orElse(null);
            
            if (draftProfile != null) {
                result.put("hasDraft", true);
                result.put("draftId", draftProfile.getId());
                result.put("status", draftProfile.getProfileStatus());
                result.put("isDraft", draftProfile.isDraft());
                
                // Personal info from profile (subject to admin approval)
                result.put("firstName", draftProfile.getFirstName());
                result.put("lastName", draftProfile.getLastName());
                result.put("imageAvatar", draftProfile.getImageAvatar());
                
                // Tutor-specific fields
                result.put("bio", draftProfile.getBio());
                result.put("headline", draftProfile.getHeadline());
                result.put("experience", draftProfile.getExperience());
                result.put("teachingLevel", draftProfile.getTeachingLevel());
                result.put("cvUrl", draftProfile.getCvUrl());
                result.put("videoIntro", draftProfile.getVideoIntro());
                
                // User info (can be updated directly)
                result.put("phoneNumber", user.getPhoneNumber());
                result.put("address", user.getAddress());
                result.put("dateOfBirth", user.getDateOfBirth());
                result.put("gender", user.getGender());
                result.put("timezone", user.getTimezone());
                
                result.put("createdAt", draftProfile.getCreatedAt());
                result.put("updatedAt", draftProfile.getUpdatedAt());
            } else {
                result.put("hasDraft", false);
                
                // Return user info as fallback data
                result.put("firstName", user.getFirstName());
                result.put("lastName", user.getLastName());
                result.put("imageAvatar", user.getImageAvatar());
                result.put("phoneNumber", user.getPhoneNumber());
                result.put("address", user.getAddress());
                result.put("dateOfBirth", user.getDateOfBirth());
                result.put("gender", user.getGender());
                result.put("timezone", user.getTimezone());
            }
            
        } else if (user.getRole() == UserRole.TUTOR) {
            // For existing tutors - get draft tutor profile
            TutorProfile draftProfile = tutorProfileRepository
                    .findByUserAndIsDraft(user, true)
                    .orElse(null);
            
            TutorProfile publicProfile = tutorProfileRepository
                    .findByUserAndIsDraft(user, false)
                    .orElse(null);
            
            if (draftProfile != null) {
                result.put("hasDraft", true);
                result.put("draftId", draftProfile.getId());
                result.put("status", draftProfile.getProfileStatus());
                
                // Use draft data if available, fallback to public profile
                result.put("firstName", draftProfile.getFirstName() != null ? draftProfile.getFirstName() : 
                          (publicProfile != null ? publicProfile.getFirstName() : user.getFirstName()));
                result.put("lastName", draftProfile.getLastName() != null ? draftProfile.getLastName() : 
                          (publicProfile != null ? publicProfile.getLastName() : user.getLastName()));
                result.put("imageAvatar", draftProfile.getImageAvatar() != null ? draftProfile.getImageAvatar() : 
                          (publicProfile != null ? publicProfile.getImageAvatar() : user.getImageAvatar()));
                
                result.put("bio", draftProfile.getBio());
                result.put("headline", draftProfile.getHeadline());
                result.put("experience", draftProfile.getExperience());
                result.put("teachingLevel", draftProfile.getTeachingLevel());
                result.put("cvUrl", draftProfile.getCvUrl());
                result.put("videoIntro", draftProfile.getVideoIntro());
                
            } else if (publicProfile != null) {
                result.put("hasDraft", false);
                result.put("hasPublicProfile", true);
                result.put("publicProfileId", publicProfile.getId());
                
                // Use public profile data
                result.put("firstName", publicProfile.getFirstName() != null ? publicProfile.getFirstName() : user.getFirstName());
                result.put("lastName", publicProfile.getLastName() != null ? publicProfile.getLastName() : user.getLastName());
                result.put("imageAvatar", publicProfile.getImageAvatar() != null ? publicProfile.getImageAvatar() : user.getImageAvatar());
                
                result.put("bio", publicProfile.getBio());
                result.put("headline", publicProfile.getHeadline());
                result.put("experience", publicProfile.getExperience());
                result.put("teachingLevel", publicProfile.getTeachingLevel());
                result.put("cvUrl", publicProfile.getCvUrl());
                result.put("videoIntro", publicProfile.getVideoIntro());
            } else {
                result.put("hasDraft", false);
                result.put("hasPublicProfile", false);
                
                // Fallback to user data
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
        }
        
        result.put("message", "Draft profile data retrieved successfully");
        return result;
    }
}
