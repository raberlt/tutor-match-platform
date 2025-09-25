package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.BecomeTutorRequest;
import fsa.training.tutormatch.dto.TutorDraftRequest;
import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TutorProfileDraftService {
    
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;
    private final EducationRepository educationRepository;
    private final CertificateRepository certificateRepository;
    private final ScheduleRepository scheduleRepository;
    private final ProfileSubjectRepository profileSubjectRepository;
    private final SubjectRepository subjectRepository;
    private final TeachingAudienceRepository teachingAudienceRepository;

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
        draftProfile.setEnable(false);
        // draft field removed from TutorProfile
        
        TutorProfile saved = tutorProfileRepository.save(draftProfile);
        
        return Map.of(
            "success", true,
            "message", "Đã lưu nháp thành công!",
            "profileId", saved.getId(),
            // isDraft field removed
            "status", saved.getEnable() ? "ENABLED" : "DISABLED"
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
        draftProfile.setEnable(false);
        // draft field removed from TutorProfile
        
        TutorProfile saved = tutorProfileRepository.save(draftProfile);
        
        return Map.of(
            "success", true,
            "message", "Đã gửi hồ sơ thành công! Vui lòng chờ admin duyệt.",
            "profileId", saved.getId(),
            // isDraft field removed
            "status", saved.getEnable() ? "ENABLED" : "DISABLED"
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
        draftProfile.setEnable(true); // Tutor vẫn giữ status ACTIVE
        
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
        draftProfile.setEnable(false);
        
        // Auto-update một số field sang public profile
        autoUpdatePublicProfile(publicProfile, request);
        
        tutorProfileRepository.save(draftProfile);
        tutorProfileRepository.save(publicProfile);
        
        return Map.of(
            "success", true,
            "message", "Đã gửi cập nhật thành công! Vui lòng chờ admin duyệt.",
            "draftProfileId", draftProfile.getId(),
            "publicProfileId", publicProfile.getId(),
            "status", draftProfile.getEnable() ? "ENABLED" : "DISABLED"
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
        
        if (Boolean.TRUE.equals(draftProfile.getEnable())) {
            throw new RuntimeException("Invalid profile state for approval");
        }
        
        User student = draftProfile.getUser();
        
        // Tạo bản ghi public (isDraft=false)
        TutorProfile publicProfile = createPublicProfileFromDraft(draftProfile);
        
        // Cập nhật draft profile
        draftProfile.setEnable(true);
        
        // Chuyển user thành TUTOR và đồng bộ thông tin
        student.setRole(UserRole.TUTOR);
        student.setVerified(true);
        
        // Đồng bộ thông tin từ User sang TutorProfile
        syncUserInfoToTutorProfile(student, draftProfile);
        syncUserInfoToTutorProfile(student, publicProfile);
        
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
        
        if (Boolean.TRUE.equals(draftProfile.getEnable())) {
            throw new RuntimeException("Invalid profile state for approval");
        }
        
        User tutor = draftProfile.getUser();
        TutorProfile publicProfile = getPublicProfile(tutor);
        
        // Copy thông tin từ draft sang public
        copyDraftToPublic(draftProfile, publicProfile);
        
        // Reset draft về ENABLED
        draftProfile.setEnable(true);
        
        // Đồng bộ thông tin từ User sang TutorProfile
        syncUserInfoToTutorProfile(tutor, draftProfile);
        syncUserInfoToTutorProfile(tutor, publicProfile);
        
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
    private void syncUserInfoToTutorProfile(User user, TutorProfile tutorProfile) {
        // Đồng bộ thông tin cơ bản từ User sang TutorProfile
        // Các thông tin này sẽ được hiển thị trong hồ sơ công khai
        tutorProfile.setUser(user);
        
        // Các thông tin khác như bio, headline, experience đã được set từ form
        // Chỉ cần đảm bảo enable = true cho hồ sơ công khai
        tutorProfile.setEnable(true);
    }
    
    private TutorProfile findOrCreateDraftProfile(User user) {
        return tutorProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    TutorProfile newProfile = new TutorProfile();
                    newProfile.setUser(user);
                    // draft field removed
                    newProfile.setEnable(false);
                    return newProfile;
                });
    }
    
    private TutorProfile getDraftProfile(User user) {
        return tutorProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Draft profile not found"));
    }
    
    private TutorProfile getPublicProfile(User user) {
        return tutorProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Public profile not found"));
    }
    
    private void updateProfileFromRequest(TutorProfile profile, BecomeTutorRequest request) {
        // Copy logic từ TutorApplicationServiceImpl
        if (request.getBio() != null) profile.setBio(request.getBio().trim());
        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline().trim());
        if (request.getExperience() != null) profile.setExperience(request.getExperience().trim());
        // teachingLevel field removed
        if (request.getCvFileUrl() != null) profile.setCvFileUrl(request.getCvFileUrl().trim());
        
        // User fields
        if (request.getFirstName() != null) profile.getUser().setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) profile.getUser().setLastName(request.getLastName().trim());
        if (request.getAddress() != null) profile.getUser().setAddress(request.getAddress().trim());
        if (request.getTimezone() != null) profile.getUser().setTimezone(request.getTimezone().trim());
        if (request.getAvatar() != null) profile.getUser().setImageAvatar(request.getAvatar().trim());
        
        // Handle teaching audiences
        if (request.getTeachingAudiences() != null && !request.getTeachingAudiences().isEmpty()) {
            // Convert string names to TeachingAudience entities
            Set<TeachingAudience> teachingAudienceSet = new HashSet<>();
            for (String audienceName : request.getTeachingAudiences()) {
                // Find TeachingAudience by name
                TeachingAudience audience = teachingAudienceRepository.findByName(audienceName).orElse(null);
                if (audience != null) {
                    teachingAudienceSet.add(audience);
                } else {
                    log.warn("TeachingAudience not found with name: {}", audienceName);
                }
            }
            profile.setTeachingAudiences(teachingAudienceSet);
        }
        
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
        
        // teachingLevel field removed
        
        // TODO: Cập nhật schedules và fees (cần implement riêng)
        // updateSchedules(publicProfile, request.getSchedules());
        // updateSubjectFees(publicProfile, request.getSubjectFees());
    }
    
    private TutorProfile createPublicProfileFromDraft(TutorProfile draftProfile) {
        TutorProfile publicProfile = new TutorProfile();
        copyDraftToPublic(draftProfile, publicProfile);
        // draft field removed
        publicProfile.setEnable(true);
        return publicProfile;
    }
    
    private void copyDraftToPublic(TutorProfile source, TutorProfile target) {
        target.setUser(source.getUser());
        
        // Personal info (firstName, lastName, imageAvatar) is now in User entity
        // No need to copy as both profiles share the same User
        
        // Copy tutor-specific fields
        target.setBio(source.getBio());
        target.setHeadline(source.getHeadline());
        target.setExperience(source.getExperience());
        // teachingLevel field removed
        target.setCvFileUrl(source.getCvFileUrl());
        target.setVideoIntro(source.getVideoIntro());
        
        // Copy related entities
        copyRelatedEntities(source, target);
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
                .findByUser(user)
                .orElse(null);
        
        if (draftProfile == null) {
            // Create new draft tutor profile for student
            draftProfile = new TutorProfile();
            draftProfile.setUser(user);
            // draft field removed from TutorProfile
            draftProfile.setEnable(false);
            log.info("Created new tutor profile draft for student: {}", username);
        } else {
            log.info("Updating existing tutor profile draft for student: {}", username);
        }

        // Update basic profile fields first (excluding related entities)
        updateProfileBasicFields(draftProfile, request);
        
        // Save profile first to get ID for related entities
        draftProfile = tutorProfileRepository.saveAndFlush(draftProfile);
        
        // Now update related entities with managed entity
        updateRelatedEntities(draftProfile, request);
        
        // Save again after updating related entities
        draftProfile = tutorProfileRepository.save(draftProfile);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Tutor profile draft saved successfully for student");
        result.put("profileId", draftProfile.getId());
        // isDraft field removed
        result.put("status", draftProfile.getEnable() ? "ENABLED" : "DISABLED");
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
                .findByUser(user)
                .orElseThrow(() -> new RuntimeException("Draft profile not found for tutor"));

        // Update basic profile fields first (excluding related entities)
        updateProfileBasicFields(draftProfile, request);
        
        // Save draft profile first to get ID for related entities
        draftProfile = tutorProfileRepository.saveAndFlush(draftProfile);
        
        // Now update related entities with managed entity
        updateRelatedEntities(draftProfile, request);
        
        // Save again after updating related entities
        draftProfile = tutorProfileRepository.save(draftProfile);
        
        // Auto-update public profile for certain fields (address, schedule, fees, teaching level)
        TutorProfile publicProfile = tutorProfileRepository
                .findByUser(user)
                .orElse(null);
        
        if (publicProfile != null) {
            autoUpdatePublicProfileFromDraft(publicProfile, draftProfile, request);
            tutorProfileRepository.save(publicProfile);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Tutor draft saved successfully");
        result.put("profileId", draftProfile.getId());
        // isDraft field removed
        result.put("status", draftProfile.getEnable() ? "ENABLED" : "DISABLED");
        result.put("autoUpdatedPublic", publicProfile != null);
        
        return result;
    }

    /**
     * Update basic profile fields (excluding related entities)
     */
    private void updateProfileBasicFields(TutorProfile profile, TutorDraftRequest request) {
        // Update tutor-specific fields in profile
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline());
        if (request.getExperience() != null) profile.setExperience(request.getExperience());
        // teachingLevel field removed
        if (request.getCvFileUrl() != null) profile.setCvFileUrl(request.getCvFileUrl());
        if (request.getVideoIntro() != null) profile.setVideoIntro(request.getVideoIntro());
        
        // Update user info - firstName, lastName, imageAvatar now go to User entity
        User user = profile.getUser();
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getAvatar() != null) user.setImageAvatar(request.getAvatar());
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty() && 
            request.getPhoneNumber().matches("^[0-9]{9,15}$")) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getTimezone() != null) user.setTimezone(request.getTimezone());
        
        // Handle teaching audiences
        if (request.getTeachingAudiences() != null && !request.getTeachingAudiences().isEmpty()) {
            // Convert string names to TeachingAudience entities
            Set<TeachingAudience> teachingAudienceSet = new HashSet<>();
            for (String audienceName : request.getTeachingAudiences()) {
                // Find TeachingAudience by name
                TeachingAudience audience = teachingAudienceRepository.findByName(audienceName).orElse(null);
                if (audience != null) {
                    teachingAudienceSet.add(audience);
                } else {
                    log.warn("TeachingAudience not found with name: {}", audienceName);
                }
            }
            profile.setTeachingAudiences(teachingAudienceSet);
        }
    }

    /**
     * Update related entities (must be called after profile is saved)
     */
    private void updateRelatedEntities(TutorProfile profile, TutorDraftRequest request) {
        // Handle related entities
        updateEducations(profile, request.getEducations());
        updateCertificates(profile, request.getCertificates());
        updateSchedules(profile, request.getSchedules());
        updateSubjectFees(profile, request.getSubjectFees());
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
                .findByUser(user)
                .orElseThrow(() -> new RuntimeException("Draft profile not found"));
        
        // Change status to PENDING_VERIFICATION for admin approval
        draftProfile.setEnable(false);
        tutorProfileRepository.save(draftProfile);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Application submitted for admin review");
        result.put("profileId", draftProfile.getId());
        result.put("status", draftProfile.getEnable() ? "ENABLED" : "DISABLED");
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
                .findByUser(user)
                .orElseThrow(() -> new RuntimeException("Draft profile not found"));
        
        // Change status to PENDING_VERIFICATION for admin approval
        draftProfile.setEnable(false);
        tutorProfileRepository.save(draftProfile);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Tutor profile changes submitted for admin review");
        result.put("profileId", draftProfile.getId());
        result.put("status", draftProfile.getEnable() ? "ENABLED" : "DISABLED");
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
                    .findByUser(user)
                    .orElse(null);
            
            if (draftProfile != null) {
                result.put("hasDraft", true);
                result.put("draftId", draftProfile.getId());
                result.put("status", draftProfile.getEnable() ? "ENABLED" : "DISABLED");
                // isDraft field removed
                
                // Personal info from profile (subject to admin approval)
                result.put("firstName", draftProfile.getFirstName());
                result.put("lastName", draftProfile.getLastName());
                result.put("imageAvatar", draftProfile.getImageAvatar());
                
                // Tutor-specific fields
                result.put("bio", draftProfile.getBio());
                result.put("headline", draftProfile.getHeadline());
                result.put("experience", draftProfile.getExperience());
                // teachingLevel field removed
                result.put("cvFileUrl", draftProfile.getCvFileUrl());
                result.put("videoIntro", draftProfile.getVideoIntro());
                
                // User info (can be updated directly)
                result.put("phoneNumber", user.getPhoneNumber());
                result.put("address", user.getAddress());
                result.put("dateOfBirth", user.getDateOfBirth());
                result.put("gender", user.getGender());
                result.put("timezone", user.getTimezone());
                
                result.put("createdAt", draftProfile.getCreatedAt());
                result.put("updatedAt", draftProfile.getUpdatedAt());
                
                // Load related data
                result.put("educations", getEducationsForProfile(draftProfile.getId()));
                result.put("certificates", getCertificatesForProfile(draftProfile.getId()));
                result.put("schedules", getSchedulesForProfile(draftProfile.getId()));
                result.put("subjectFees", getSubjectFeesForProfile(draftProfile.getId()));
                result.put("teachingAudiences", getTeachingAudiencesForProfile(draftProfile.getId()));
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
                    .findByUser(user)
                    .orElse(null);
            
            TutorProfile publicProfile = tutorProfileRepository
                    .findByUser(user)
                    .orElse(null);
            
            if (draftProfile != null) {
                result.put("hasDraft", true);
                result.put("draftId", draftProfile.getId());
                result.put("status", draftProfile.getEnable() ? "ENABLED" : "DISABLED");
                
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
                // teachingLevel field removed
                result.put("cvFileUrl", draftProfile.getCvFileUrl());
                result.put("videoIntro", draftProfile.getVideoIntro());
                
                // Load related data
                result.put("educations", getEducationsForProfile(draftProfile.getId()));
                result.put("certificates", getCertificatesForProfile(draftProfile.getId()));
                result.put("schedules", getSchedulesForProfile(draftProfile.getId()));
                result.put("subjectFees", getSubjectFeesForProfile(draftProfile.getId()));
                result.put("teachingAudiences", getTeachingAudiencesForProfile(draftProfile.getId()));
                
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
                // teachingLevel field removed
                result.put("cvFileUrl", publicProfile.getCvFileUrl());
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

    /**
     * Update educations for profile
     */
    private void updateEducations(TutorProfile profile, List<TutorDraftRequest.EducationRequest> educationRequests) {
        if (educationRequests == null) return;
        
        // Ensure profile has an ID (should be saved already)
        if (profile.getId() == null) {
            throw new RuntimeException("Profile must be saved before updating educations");
        }
        
        // Delete existing educations for this profile
        educationRepository.deleteByProfileId(profile.getId());
        
        // Refresh the profile entity to ensure it's managed
        profile = tutorProfileRepository.findById(profile.getId()).orElse(profile);
        
        // Add new educations
        for (TutorDraftRequest.EducationRequest eduRequest : educationRequests) {
            Education education = new Education();
            education.setProfile(profile);
            education.setSchoolName(eduRequest.getSchoolName());
            education.setDegree(eduRequest.getDegree());
            education.setMajor(eduRequest.getMajor());
            education.setFromTime(eduRequest.getFromTime());
            education.setToTime(eduRequest.getToTime());
            education.setDegreeFileName(eduRequest.getDegreeFileName());
            education.setDegreeFileUrl(eduRequest.getDegreeFileUrl());
            education.setValid(false); // Will be validated by admin
            
            educationRepository.save(education);
        }
        
        log.info("Updated {} educations for profile {}", educationRequests.size(), profile.getId());
    }

    /**
     * Update certificates for profile
     */
    private void updateCertificates(TutorProfile profile, List<TutorDraftRequest.CertificateRequest> certificateRequests) {
        if (certificateRequests == null) return;
        
        // Ensure profile has an ID (should be saved already)
        if (profile.getId() == null) {
            throw new RuntimeException("Profile must be saved before updating certificates");
        }
        
        // Delete existing certificates for this profile
        certificateRepository.deleteByProfileId(profile.getId());
        
        // Refresh the profile entity to ensure it's managed
        profile = tutorProfileRepository.findById(profile.getId()).orElse(profile);
        
        // Add new certificates
        for (TutorDraftRequest.CertificateRequest certRequest : certificateRequests) {
            Certificate certificate = new Certificate();
            certificate.setProfile(profile);
            certificate.setName(certRequest.getName());
            certificate.setIssuedBy(certRequest.getIssuedBy());
            certificate.setDescription(certRequest.getDescription());
            certificate.setCertFileName(certRequest.getCertFileName());
            certificate.setCertFileUrl(certRequest.getCertFileUrl());            certificate.setValid(false); // Will be validated by admin
            
            certificateRepository.save(certificate);
        }
        
        log.info("Updated {} certificates for profile {}", certificateRequests.size(), profile.getId());
    }

    /**
     * Update schedules for profile
     */
    private void updateSchedules(TutorProfile profile, List<TutorDraftRequest.ScheduleRequest> scheduleRequests) {
        if (scheduleRequests == null) return;
        
        // Ensure profile has an ID (should be saved already)
        if (profile.getId() == null) {
            throw new RuntimeException("Profile must be saved before updating schedules");
        }
        
        // Delete existing schedules for this profile
        scheduleRepository.deleteByProfileId(profile.getId());
        
        // Refresh the profile entity to ensure it's managed
        profile = tutorProfileRepository.findById(profile.getId()).orElse(profile);
        
        // Add new schedules
        for (TutorDraftRequest.ScheduleRequest schedRequest : scheduleRequests) {
            Schedule schedule = new Schedule();
            schedule.setProfile(profile);
            schedule.setDayOfWeek(schedRequest.getDayOfWeek());
            
            // Parse time strings to LocalTime
            try {
                schedule.setFromTime(LocalTime.parse(schedRequest.getFromTime()));
                schedule.setToTime(LocalTime.parse(schedRequest.getToTime()));
            } catch (Exception e) {
                log.warn("Invalid time format for schedule: {} - {}", schedRequest.getFromTime(), schedRequest.getToTime());
                continue;
            }
            
            schedule.setEnable(schedRequest.isEnable());
            
            scheduleRepository.save(schedule);
        }
        
        log.info("Updated {} schedules for profile {}", scheduleRequests.size(), profile.getId());
    }

    /**
     * Update subject fees for profile
     */
    private void updateSubjectFees(TutorProfile profile, List<TutorDraftRequest.SubjectFeeRequest> subjectFeeRequests) {
        if (subjectFeeRequests == null) return;
        
        // Ensure profile has an ID (should be saved already)
        if (profile.getId() == null) {
            throw new RuntimeException("Profile must be saved before updating subject fees");
        }
        
        // Delete existing subject fees for this profile
        profileSubjectRepository.deleteByProfileId(profile.getId());
        
        // Refresh the profile entity to ensure it's managed
        profile = tutorProfileRepository.findById(profile.getId()).orElse(profile);
        
        // Add new subject fees
        for (TutorDraftRequest.SubjectFeeRequest feeRequest : subjectFeeRequests) {
            // Find subject by ID
            Subject subject = subjectRepository.findById(feeRequest.getSubjectId()).orElse(null);
            if (subject == null) {
                log.warn("Subject not found with ID: {}", feeRequest.getSubjectId());
                continue;
            }
            
            TutorProfileSubject tutorProfileSubject = new TutorProfileSubject();
            tutorProfileSubject.setProfile(profile);
            tutorProfileSubject.setSubject(subject);
            tutorProfileSubject.setFees(feeRequest.getFees());
            
            profileSubjectRepository.save(tutorProfileSubject);
        }
        
        log.info("Updated {} subject fees for profile {}", subjectFeeRequests.size(), profile.getId());
    }

    /**
     * Get educations for profile
     */
    private List<Map<String, Object>> getEducationsForProfile(Integer profileId) {
        List<Education> educations = educationRepository.findByProfileId(profileId);
        return educations.stream().map(education -> {
            Map<String, Object> eduData = new HashMap<>();
            eduData.put("id", education.getId());
            eduData.put("schoolName", education.getSchoolName());
            eduData.put("degree", education.getDegree());
            eduData.put("major", education.getMajor());
            eduData.put("fromTime", education.getFromTime());
            eduData.put("toTime", education.getToTime());
            eduData.put("degreeFileName", education.getDegreeFileName());
            eduData.put("degreeFileUrl", education.getDegreeFileUrl());
            eduData.put("valid", education.getValid());
            return eduData;
        }).collect(Collectors.toList());
    }

    /**
     * Get certificates for profile
     */
    private List<Map<String, Object>> getCertificatesForProfile(Integer profileId) {
        List<Certificate> certificates = certificateRepository.findByProfileId(profileId);
        return certificates.stream().map(certificate -> {
            Map<String, Object> certData = new HashMap<>();
            certData.put("id", certificate.getId());
            certData.put("name", certificate.getName());
            certData.put("issuedBy", certificate.getIssuedBy());
            certData.put("description", certificate.getDescription());
            certData.put("certFileName", certificate.getCertFileName());
            certData.put("certFileUrl", certificate.getCertFileUrl());
            certData.put("valid", certificate.getValid());
            return certData;
        }).collect(Collectors.toList());
    }

    /**
     * Get schedules for profile
     */
    private List<Map<String, Object>> getSchedulesForProfile(Integer profileId) {
        List<Schedule> schedules = scheduleRepository.findByProfileId(profileId);
        return schedules.stream().map(schedule -> {
            Map<String, Object> schedData = new HashMap<>();
            schedData.put("id", schedule.getId());
            schedData.put("dayOfWeek", schedule.getDayOfWeek());
            schedData.put("fromTime", schedule.getFromTime().toString());
            schedData.put("toTime", schedule.getToTime().toString());
            schedData.put("enable", schedule.getEnable());
            return schedData;
        }).collect(Collectors.toList());
    }

    /**
     * Get subject fees for profile
     */
    private List<Map<String, Object>> getSubjectFeesForProfile(Integer profileId) {
        List<TutorProfileSubject> subjectFees = profileSubjectRepository.findByProfileId(profileId);
        return subjectFees.stream().map(subjectFee -> {
            Map<String, Object> feeData = new HashMap<>();
            feeData.put("id", subjectFee.getId());
            feeData.put("subjectId", subjectFee.getSubject().getId());
            feeData.put("subjectName", subjectFee.getSubject().getName());
            feeData.put("fees", subjectFee.getFees());
            return feeData;
        }).collect(Collectors.toList());
    }

    /**
     * Copy all related entities from source profile to target profile
     */
    private void copyRelatedEntities(TutorProfile source, TutorProfile target) {
        log.info("Copying related entities from profile {} to profile {}", source.getId(), target.getId());
        
        // Copy educations
        List<Education> sourceEducations = educationRepository.findByProfileId(source.getId());
        for (Education sourceEdu : sourceEducations) {
            Education targetEdu = new Education();
            targetEdu.setProfile(target);
            targetEdu.setSchoolName(sourceEdu.getSchoolName());
            targetEdu.setDegree(sourceEdu.getDegree());
            targetEdu.setMajor(sourceEdu.getMajor());
            targetEdu.setFromTime(sourceEdu.getFromTime());
            targetEdu.setToTime(sourceEdu.getToTime());
            targetEdu.setDegreeFileName(sourceEdu.getDegreeFileName());
            targetEdu.setDegreeFileUrl(sourceEdu.getDegreeFileUrl());            targetEdu.setValid(true); // Mark as valid when approved by admin
            
            educationRepository.save(targetEdu);
        }
        
        // Copy certificates
        List<Certificate> sourceCertificates = certificateRepository.findByProfileId(source.getId());
        for (Certificate sourceCert : sourceCertificates) {
            Certificate targetCert = new Certificate();
            targetCert.setProfile(target);
            targetCert.setName(sourceCert.getName());
            targetCert.setIssuedBy(sourceCert.getIssuedBy());
            targetCert.setDescription(sourceCert.getDescription());
            targetCert.setCertFileName(sourceCert.getCertFileName());
            targetCert.setCertFileUrl(sourceCert.getCertFileUrl());            targetCert.setValid(true); // Mark as valid when approved by admin
            
            certificateRepository.save(targetCert);
        }
        
        // Copy schedules
        List<Schedule> sourceSchedules = scheduleRepository.findByProfileId(source.getId());
        for (Schedule sourceSchedule : sourceSchedules) {
            Schedule targetSchedule = new Schedule();
            targetSchedule.setProfile(target);
            targetSchedule.setDayOfWeek(sourceSchedule.getDayOfWeek());
            targetSchedule.setFromTime(sourceSchedule.getFromTime());
            targetSchedule.setToTime(sourceSchedule.getToTime());
            targetSchedule.setEnable(sourceSchedule.getEnable());
            
            scheduleRepository.save(targetSchedule);
        }
        
        // Copy subject fees
        List<TutorProfileSubject> sourceSubjectFees = profileSubjectRepository.findByProfileId(source.getId());
        for (TutorProfileSubject sourceSubjectFee : sourceSubjectFees) {
            TutorProfileSubject targetSubjectFee = new TutorProfileSubject();
            targetSubjectFee.setProfile(target);
            targetSubjectFee.setSubject(sourceSubjectFee.getSubject());
            targetSubjectFee.setFees(sourceSubjectFee.getFees());
            
            profileSubjectRepository.save(targetSubjectFee);
        }
        
        log.info("Successfully copied {} educations, {} certificates, {} schedules, {} subject fees",
                sourceEducations.size(), sourceCertificates.size(), sourceSchedules.size(), sourceSubjectFees.size());
    }
    
    /**
     * Get teaching audiences for profile
     */
    private List<Map<String, Object>> getTeachingAudiencesForProfile(Integer profileId) {
        TutorProfile profile = tutorProfileRepository.findById(profileId).orElse(null);
        if (profile == null || profile.getTeachingAudiences() == null) {
            return new ArrayList<>();
        }
        
        return profile.getTeachingAudiences().stream().map(audience -> {
            Map<String, Object> audienceData = new HashMap<>();
            audienceData.put("id", audience.getId());
            audienceData.put("name", audience.getName());
            return audienceData;
        }).collect(Collectors.toList());
    }

    /**
     * Đồng bộ dữ liệu từ ProfileApplication sang User và TutorProfile
     */
    @Transactional
    public void syncDataFromProfileApplication(ProfileApplication application, User user, TutorProfile tutorProfile) {
        log.info("Syncing data from ProfileApplication {} to User {} and TutorProfile {}", 
                application.getId(), user.getId(), tutorProfile.getId());
        
        // Đồng bộ dữ liệu cá nhân từ ProfileApplication sang User
        if (application.getFirstName() != null && !application.getFirstName().isEmpty()) {
            user.setFirstName(application.getFirstName());
        }
        if (application.getLastName() != null && !application.getLastName().isEmpty()) {
            user.setLastName(application.getLastName());
        }
        if (application.getPhoneNumber() != null && !application.getPhoneNumber().isEmpty()) {
            user.setPhoneNumber(application.getPhoneNumber());
        }
        if (application.getAddress() != null && !application.getAddress().isEmpty()) {
            user.setAddress(application.getAddress());
        }
        if (application.getImageAvatar() != null && !application.getImageAvatar().isEmpty()) {
            user.setImageAvatar(application.getImageAvatar());
        }
        
        // Đồng bộ dữ liệu tutor-specific từ ProfileApplication sang TutorProfile
        if (application.getBio() != null && !application.getBio().isEmpty()) {
            tutorProfile.setBio(application.getBio());
        }
        if (application.getHeadline() != null && !application.getHeadline().isEmpty()) {
            tutorProfile.setHeadline(application.getHeadline());
        }
        if (application.getExperience() != null && !application.getExperience().isEmpty()) {
            tutorProfile.setExperience(application.getExperience());
        }
        if (application.getCvFileUrl() != null && !application.getCvFileUrl().isEmpty()) {
            tutorProfile.setCvFileUrl(application.getCvFileUrl());
        }
        if (application.getVideoIntro() != null && !application.getVideoIntro().isEmpty()) {
            tutorProfile.setVideoIntro(application.getVideoIntro());
        }
        
        // Đồng bộ teaching audiences
        if (application.getTeachingAudiences() != null && !application.getTeachingAudiences().isEmpty()) {
            tutorProfile.setTeachingAudiences(new HashSet<>(application.getTeachingAudiences()));
        }
        
        // Đồng bộ educations từ ApplicationEducation sang Education
        if (application.getEducations() != null && !application.getEducations().isEmpty()) {
            syncEducationsFromApplication(application, tutorProfile);
        }
        
        // Đồng bộ certificates từ ApplicationCertificate sang Certificate
        if (application.getCertificates() != null && !application.getCertificates().isEmpty()) {
            syncCertificatesFromApplication(application, tutorProfile);
        }
        
        // Đồng bộ schedules từ ApplicationSchedule sang Schedule
        if (application.getSchedules() != null && !application.getSchedules().isEmpty()) {
            syncSchedulesFromApplication(application, tutorProfile);
        }
        
        // Đồng bộ subject fees từ ApplicationSubjectFee sang TutorProfileSubject
        if (application.getSubjectFees() != null && !application.getSubjectFees().isEmpty()) {
            syncSubjectFeesFromApplication(application, tutorProfile);
        }
        
        log.info("Successfully synced data from ProfileApplication to User and TutorProfile");
    }
    
    /**
     * Đồng bộ educations từ ApplicationEducation sang Education
     */
    private void syncEducationsFromApplication(ProfileApplication application, TutorProfile tutorProfile) {
        // Xóa educations cũ
        List<Education> existingEducations = educationRepository.findByProfileId(tutorProfile.getId());
        educationRepository.deleteAll(existingEducations);
        
        // Tạo educations mới từ application
        for (ApplicationEducation appEdu : application.getEducations()) {
            Education education = new Education();
            education.setProfile(tutorProfile);
            education.setSchoolName(appEdu.getSchoolName());
            education.setMajor(appEdu.getMajor());
            education.setDegree(appEdu.getDegree());
            education.setFromTime(appEdu.getFromTime());
            education.setToTime(appEdu.getToTime());
            education.setDegreeFileName(appEdu.getDegreeFileName());
            education.setDegreeFileUrl(appEdu.getDegreeFileUrl());
            
            educationRepository.save(education);
        }
    }
    
    /**
     * Đồng bộ certificates từ ApplicationCertificate sang Certificate
     */
    private void syncCertificatesFromApplication(ProfileApplication application, TutorProfile tutorProfile) {
        // Xóa certificates cũ
        List<Certificate> existingCertificates = certificateRepository.findByProfileId(tutorProfile.getId());
        certificateRepository.deleteAll(existingCertificates);
        
        // Tạo certificates mới từ application
        for (ApplicationCertificate appCert : application.getCertificates()) {
            Certificate certificate = new Certificate();
            certificate.setProfile(tutorProfile);
            certificate.setName(appCert.getName());
            certificate.setIssuedBy(appCert.getIssuedBy());
            certificate.setDescription(appCert.getDescription());
            certificate.setValid(appCert.getValid());
            certificate.setCertFileName(appCert.getCertFileName());
            certificate.setCertFileUrl(appCert.getCertFileUrl());
            
            certificateRepository.save(certificate);
        }
    }
    
    /**
     * Đồng bộ schedules từ ApplicationSchedule sang Schedule
     */
    private void syncSchedulesFromApplication(ProfileApplication application, TutorProfile tutorProfile) {
        // Xóa schedules cũ
        List<Schedule> existingSchedules = scheduleRepository.findByProfileId(tutorProfile.getId());
        scheduleRepository.deleteAll(existingSchedules);
        
        // Tạo schedules mới từ application
        for (ApplicationSchedule appSchedule : application.getSchedules()) {
            Schedule schedule = new Schedule();
            schedule.setProfile(tutorProfile);
            schedule.setDayOfWeek(appSchedule.getDayOfWeek());
            schedule.setFromTime(appSchedule.getFromTime());
            schedule.setToTime(appSchedule.getToTime());
            schedule.setEnable(appSchedule.getEnable());
            
            scheduleRepository.save(schedule);
        }
    }
    
    /**
     * Đồng bộ subject fees từ ApplicationSubjectFee sang TutorProfileSubject
     */
    private void syncSubjectFeesFromApplication(ProfileApplication application, TutorProfile tutorProfile) {
        // Xóa subject fees cũ
        List<TutorProfileSubject> existingSubjectFees = profileSubjectRepository.findByProfileId(tutorProfile.getId());
        profileSubjectRepository.deleteAll(existingSubjectFees);
        
        // Tạo subject fees mới từ application
        for (ApplicationSubjectFee appSubjectFee : application.getSubjectFees()) {
            TutorProfileSubject subjectFee = new TutorProfileSubject();
            subjectFee.setProfile(tutorProfile);
            subjectFee.setSubject(appSubjectFee.getSubject());
            subjectFee.setFees(appSubjectFee.getFees().intValue());
            
            profileSubjectRepository.save(subjectFee);
        }
    }
}
