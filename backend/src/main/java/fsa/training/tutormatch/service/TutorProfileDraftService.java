package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.BecomeTutorRequest;
import fsa.training.tutormatch.dto.BecomeTutorDraftRequest;
import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.enums.ApplicationStatus;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.ZonedDateTime;
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
    // Removed repositories for ApplicationSchedule, ApplicationSubjectFee, ApplicationTeachingAudience
    // These are now managed by ProfileApplicationService
    private final SubjectRepository subjectRepository;
    private final TeachingAudienceRepository teachingAudienceRepository;
    private final ApplicationTeachingAudienceRepository applicationTeachingAudienceRepository;
    private final ApplicationSubjectFeeRepository applicationSubjectFeeRepository;
    private final ApplicationScheduleRepository applicationScheduleRepository;
    private final ApplicationEducationRepository applicationEducationRepository;
    private final ApplicationCertificateRepository applicationCertificateRepository;
    private final ProfileApplicationRepository applicationRepository;

    /**
     * Lưu nháp cho Student (chưa là tutor)
     * Tạo hoặc cập nhật bản ghi isDraft=true với status=INACTIVE
     */
    @Transactional
    public Map<String, Object> saveDraftForStudent(String username, BecomeTutorDraftRequest request) {
        log.info("Saving draft for student: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("Only students can create new tutor profiles");
        }
        
        // Tìm hoặc tạo bản ghi draft trong ProfileApplication
        ProfileApplication draftApplication = findOrCreateDraftApplication(user);
        
        // Cập nhật thông tin cơ bản từ request (không bao gồm related entities)
        updateBasicApplicationFromRequest(draftApplication, request);
        
        // Save ProfileApplication trước để có ID
        ProfileApplication saved = applicationRepository.saveAndFlush(draftApplication);
        
        // Sau đó cập nhật các related entities
        updateRelatedEntitiesFromRequest(saved, request);
        
        return Map.of(
            "success", true,
            "message", "Đã lưu nháp thành công!",
            "applicationId", saved.getId(),
            "status", saved.getStatus().toString()
        );
    }

    /**
     * Gửi hồ sơ cho Student (chuyển từ draft sang pending)
     */
    @Transactional
    public Map<String, Object> submitApplicationForStudent(String username, BecomeTutorDraftRequest request) {
        log.info("Submitting application for student: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("Only students can submit tutor applications");
        }
        
        // Tìm hoặc tạo bản ghi draft trong ProfileApplication
        ProfileApplication draftApplication = findOrCreateDraftApplication(user);
        
        // Cập nhật thông tin cơ bản từ request (không bao gồm related entities)
        updateBasicApplicationFromRequest(draftApplication, request);
        draftApplication.setStatus(ApplicationStatus.SUBMITTED);
        draftApplication.setSubmittedAt(ZonedDateTime.now());
        
        // Save ProfileApplication trước để có ID
        ProfileApplication saved = applicationRepository.saveAndFlush(draftApplication);
        
        // Sau đó cập nhật các related entities
        updateRelatedEntitiesFromRequest(saved, request);
        
        return Map.of(
            "success", true,
            "message", "Đã gửi hồ sơ thành công! Vui lòng chờ admin duyệt.",
            "applicationId", saved.getId(),
            "status", saved.getStatus().toString()
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
    private void syncUserInfoToTutorProfile(User user, TutorProfile tutor) {
        // Đồng bộ thông tin cơ bản từ User sang TutorProfile
        // Các thông tin này sẽ được hiển thị trong hồ sơ công khai
        tutor.setUser(user);
        
        // Các thông tin khác như bio, headline, experience đã được set từ form
        // Chỉ cần đảm bảo enable = true cho hồ sơ công khai
        tutor.setEnable(true);
    }
    
    private ProfileApplication findOrCreateDraftApplication(User user) {
        // Tìm application hiện tại (DRAFT, SUBMITTED, hoặc REJECTED)
        List<ProfileApplication> applications = applicationRepository
                .findByUserOrderByCreatedAtDesc(user);
        
        ProfileApplication existingApplication = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.DRAFT || 
                              app.getStatus() == ApplicationStatus.SUBMITTED ||
                              app.getStatus() == ApplicationStatus.REJECTED)
                .findFirst()
                .orElse(null);
        
        if (existingApplication != null) {
            // Nếu status là REJECTED, tạo application mới
            if (existingApplication.getStatus() == ApplicationStatus.REJECTED) {
                ProfileApplication newApplication = new ProfileApplication();
                newApplication.setUser(user);
                newApplication.setStatus(ApplicationStatus.DRAFT);
                return newApplication;
            } else {
                // Cập nhật application hiện tại, giữ nguyên status
                return existingApplication;
            }
        } else {
            // Tạo application mới khi chưa có application nào
            ProfileApplication newApplication = new ProfileApplication();
            newApplication.setUser(user);
            newApplication.setStatus(ApplicationStatus.DRAFT);
            return newApplication;
        }
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
    
    private void updateBasicApplicationFromRequest(ProfileApplication application, BecomeTutorDraftRequest request) {
        // Copy logic từ TutorApplicationServiceImpl
        if (request.getBio() != null) application.setBio(request.getBio().trim());
        if (request.getHeadline() != null) application.setHeadline(request.getHeadline().trim());
        if (request.getExperience() != null) application.setExperience(request.getExperience().trim());
        if (request.getCvFileUrl() != null) application.setCvFileUrl(request.getCvFileUrl().trim());
        if (request.getVideoIntro() != null) application.setVideoIntro(request.getVideoIntro().trim());
        
        // Application fields
        if (request.getFirstName() != null) application.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) application.setLastName(request.getLastName().trim());
        if (request.getAddress() != null) application.setAddress(request.getAddress().trim());
        if (request.getPhoneNumber() != null) application.setPhoneNumber(request.getPhoneNumber().trim());
        if (request.getAvatar() != null) application.setImageAvatar(request.getAvatar().trim());
        
        // User fields (for direct updates)
        if (request.getAddress() != null) application.getUser().setAddress(request.getAddress().trim());
        if (request.getTimezone() != null) application.getUser().setTimezone(request.getTimezone().trim());
        if (request.getAvatar() != null) application.getUser().setImageAvatar(request.getAvatar().trim());
        if (request.getPhoneNumber() != null) application.getUser().setPhoneNumber(request.getPhoneNumber().trim());
    }
    
    private void updateRelatedEntitiesFromRequest(ProfileApplication application, BecomeTutorDraftRequest request) {
        
        // Handle teaching audiences - save to ApplicationTeachingAudience
        if (request.getTeachingAudiences() != null && !request.getTeachingAudiences().isEmpty()) {
            log.info("Processing {} teaching audiences for application {}", request.getTeachingAudiences().size(), application.getId());
            // Clear existing teaching audiences for this application
            applicationTeachingAudienceRepository.deleteByApplication(application);
            
            for (String audienceName : request.getTeachingAudiences()) {
                TeachingAudience audience = teachingAudienceRepository.findByName(audienceName).orElse(null);
                if (audience != null) {
                    ApplicationTeachingAudience appAudience = new ApplicationTeachingAudience();
                    appAudience.setApplication(application);
                    appAudience.setTeachingAudience(audience);
                    ApplicationTeachingAudience saved = applicationTeachingAudienceRepository.save(appAudience);
                    log.info("Saved ApplicationTeachingAudience: {} for application {}", saved.getId(), application.getId());
                } else {
                    log.warn("TeachingAudience not found with name: {}", audienceName);
                }
            }
        } else {
            log.info("No teaching audiences to process for application {}", application.getId());
        }
        
        // Handle schedules - save to ApplicationSchedule
        if (request.getSchedules() != null && !request.getSchedules().isEmpty()) {
            // Clear existing schedules for this application
            applicationScheduleRepository.deleteByApplication(application);
            
            for (BecomeTutorDraftRequest.ScheduleRequest scheduleRequest : request.getSchedules()) {
                ApplicationSchedule schedule = new ApplicationSchedule();
                schedule.setApplication(application);
                schedule.setDayOfWeek(scheduleRequest.getDayOfWeek());
                schedule.setFromTime(LocalTime.parse(scheduleRequest.getFromTime()));
                schedule.setToTime(LocalTime.parse(scheduleRequest.getToTime()));
                schedule.setEnable(true);
                applicationScheduleRepository.save(schedule);
            }
        }
        
        // Handle subject fees - save to ApplicationSubjectFee
        if (request.getSubjectFees() != null && !request.getSubjectFees().isEmpty()) {
            // Clear existing subject fees for this application
            applicationSubjectFeeRepository.deleteByApplication(application);
            
            for (BecomeTutorDraftRequest.SubjectFeeRequest feeRequest : request.getSubjectFees()) {
                Subject subject = subjectRepository.findById(feeRequest.getSubjectId()).orElse(null);
                if (subject != null) {
                    ApplicationSubjectFee subjectFee = new ApplicationSubjectFee();
                    subjectFee.setApplication(application);
                    subjectFee.setSubject(subject);
                    subjectFee.setFees(BigDecimal.valueOf(feeRequest.getFees()));
                    applicationSubjectFeeRepository.save(subjectFee);
                } else {
                    log.warn("Subject not found with id: {}", feeRequest.getSubjectId());
                }
            }
        }
        
        // Handle educations - save to ApplicationEducation
        if (request.getEducations() != null && !request.getEducations().isEmpty()) {
            // Clear existing educations for this application
            applicationEducationRepository.deleteByApplication(application);
            
            for (BecomeTutorDraftRequest.EducationRequest educationRequest : request.getEducations()) {
                // Skip empty educations
                if (educationRequest.getSchoolName() == null || educationRequest.getSchoolName().trim().isEmpty()) {
                    continue;
                }
                
                ApplicationEducation education = new ApplicationEducation();
                education.setApplication(application);
                education.setSchoolName(educationRequest.getSchoolName().trim());
                education.setDegree(educationRequest.getDegree() != null ? educationRequest.getDegree().trim() : "");
                education.setMajor(educationRequest.getMajor() != null ? educationRequest.getMajor().trim() : "");
                education.setFromTime(educationRequest.getFromTime());
                education.setToTime(educationRequest.getToTime());
                education.setDegreeFileName(educationRequest.getDegreeFileName() != null ? educationRequest.getDegreeFileName().trim() : "");
                education.setDegreeFileUrl(educationRequest.getDegreeFileUrl() != null ? educationRequest.getDegreeFileUrl().trim() : "");
                education.setVerified(false); // Default to not verified
                applicationEducationRepository.save(education);
            }
        }
        
        // Handle certificates - save to ApplicationCertificate
        if (request.getCertificates() != null && !request.getCertificates().isEmpty()) {
            // Clear existing certificates for this application
            applicationCertificateRepository.deleteByApplication(application);
            
            for (BecomeTutorDraftRequest.CertificateRequest certificateRequest : request.getCertificates()) {
                // Skip empty certificates
                if (certificateRequest.getName() == null || certificateRequest.getName().trim().isEmpty()) {
                    continue;
                }
                
                ApplicationCertificate certificate = new ApplicationCertificate();
                certificate.setApplication(application);
                certificate.setName(certificateRequest.getName().trim());
                certificate.setDescription(certificateRequest.getDescription() != null ? certificateRequest.getDescription().trim() : "");
                certificate.setIssuedBy(certificateRequest.getIssuedBy() != null ? certificateRequest.getIssuedBy().trim() : "");
                certificate.setCertFileName(certificateRequest.getCertFileName() != null ? certificateRequest.getCertFileName().trim() : "");
                certificate.setCertFileUrl(certificateRequest.getCertFileUrl() != null ? certificateRequest.getCertFileUrl().trim() : "");
                certificate.setVerified(false); // Default to not verified
                applicationCertificateRepository.save(certificate);
            }
        }
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
            // Teaching audiences are now managed separately through ApplicationTeachingAudience
            // This method is kept for backward compatibility but does nothing
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
     * Save draft using BecomeTutorDraftRequest
     */
    @Transactional
    public Map<String, Object> saveDraftRequest(String username, BecomeTutorDraftRequest request) {
        log.info("Saving draft request for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // Only STUDENT can use this endpoint
        if (user.getRole() == UserRole.STUDENT) {
            return saveDraftForStudent(username, request);
        } else {
            throw new RuntimeException("Only students can use this endpoint");
        }
    }



    /**
     * Update basic profile fields (excluding related entities)
     */
    private void updateProfileBasicFields(TutorProfile profile, BecomeTutorDraftRequest request) {
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
        
        // Teaching audiences will be handled in updateRelatedEntities after profile is saved
    }

    /**
     * Update related entities (must be called after profile is saved)
     */
    private void updateRelatedEntities(TutorProfile profile, BecomeTutorDraftRequest request) {
        // Handle related entities
        updateEducations(profile, request.getEducations());
        updateCertificates(profile, request.getCertificates());
        updateSchedules(profile, request.getSchedules());
        updateSubjectFees(profile, request.getSubjectFees());
        updateTeachingAudiences(profile, request.getTeachingAudiences());
    }

    /**
     * Auto-update public profile for certain fields (tutor only)
     */
    private void autoUpdatePublicProfileFromDraft(TutorProfile publicProfile, TutorProfile draftProfile, BecomeTutorDraftRequest request) {
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

    /**
     * Submit draft for STUDENT (changes status to PENDING_VERIFICATION)
     */
    @Transactional
    public Map<String, Object> submitDraftForStudent(String username, BecomeTutorDraftRequest request) {
        log.info("Submitting draft for student: {}", username);
        
        // First save the draft 
        Map<String, Object> saveResult = saveDraftForStudent(username, request);
        
        // Get the saved application 
        User user = userRepository.findByUsername(username).orElseThrow();
        List<ProfileApplication> applications = applicationRepository
                .findByUserOrderByCreatedAtDesc(user);
        
        ProfileApplication draftApplication = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.DRAFT || 
                              app.getStatus() == ApplicationStatus.SUBMITTED ||
                              app.getStatus() == ApplicationStatus.REJECTED)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        // Logic submit:
        // - Nếu status hiện tại là DRAFT → chuyển thành SUBMITTED
        // - Nếu status hiện tại là SUBMITTED → giữ nguyên SUBMITTED
        // - Nếu status hiện tại là REJECTED → chuyển thành SUBMITTED
        if (draftApplication.getStatus() == ApplicationStatus.DRAFT || 
            draftApplication.getStatus() == ApplicationStatus.REJECTED) {
            draftApplication.setStatus(ApplicationStatus.SUBMITTED);
            applicationRepository.save(draftApplication);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Application submitted for admin review");
        result.put("applicationId", draftApplication.getId());
        result.put("status", draftApplication.getStatus().toString());
        result.put("nextStep", "Admin review required");
        
        log.info("Student application submitted - Status: PENDING_VERIFICATION");
        return result;
    }

    /**
     * Submit draft for TUTOR (changes status to PENDING)
     */
    @Transactional
    public Map<String, Object> submitDraftRequest(String username, BecomeTutorDraftRequest request) {
        log.info("Submitting draft request for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // Only STUDENT can use this endpoint
        if (user.getRole() == UserRole.STUDENT) {
            return submitApplicationForStudent(username, request);
        } else {
            throw new RuntimeException("Only students can use this endpoint");
        }
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
            // For students becoming tutors - get latest application (DRAFT or SUBMITTED)
            List<ProfileApplication> applications = applicationRepository
                    .findByUserOrderByCreatedAtDesc(user);
            
            ProfileApplication latestApplication = applications.stream()
                    .filter(app -> app.getStatus() == ApplicationStatus.DRAFT || 
                                  app.getStatus() == ApplicationStatus.SUBMITTED ||
                                  app.getStatus() == ApplicationStatus.REJECTED)
                    .findFirst()
                    .orElse(null);
            
            if (latestApplication != null) {
                result.put("hasDraft", true);
                result.put("applicationId", latestApplication.getId());
                result.put("status", latestApplication.getStatus().toString());
                
                // Personal info from application
                result.put("firstName", latestApplication.getFirstName());
                result.put("lastName", latestApplication.getLastName());
                result.put("imageAvatar", latestApplication.getImageAvatar());
                
                // Tutor-specific fields
                result.put("bio", latestApplication.getBio());
                result.put("headline", latestApplication.getHeadline());
                result.put("experience", latestApplication.getExperience());
                result.put("cvFileUrl", latestApplication.getCvFileUrl());
                result.put("videoIntro", latestApplication.getVideoIntro());
                
                // User info (can be updated directly)
                result.put("phoneNumber", user.getPhoneNumber());
                result.put("address", user.getAddress());
                result.put("dateOfBirth", user.getDateOfBirth());
                result.put("gender", user.getGender());
                result.put("timezone", user.getTimezone());
                
                result.put("createdAt", latestApplication.getCreatedAt());
                result.put("updatedAt", latestApplication.getUpdatedAt());
                
                // Load related data from application
                result.put("educations", getEducationsForApplication(latestApplication.getId()));
                result.put("certificates", getCertificatesForApplication(latestApplication.getId()));
                result.put("teachingAudiences", getTeachingAudiencesForApplication(latestApplication.getId()));
                result.put("schedules", getSchedulesForApplication(latestApplication.getId()));
                result.put("subjectFees", getSubjectFeesForApplication(latestApplication.getId()));
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
            
        }
        
        result.put("message", "Draft profile data retrieved successfully");
        return result;
    }

    /**
     * Update educations for profile
     */
    private void updateEducations(TutorProfile profile, List<BecomeTutorDraftRequest.EducationRequest> educationRequests) {
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
        for (BecomeTutorDraftRequest.EducationRequest eduRequest : educationRequests) {
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
            education.setVerified(eduRequest.isVerified());
            
            educationRepository.save(education);
        }
        
        log.info("Updated {} educations for profile {}", educationRequests.size(), profile.getId());
    }

    /**
     * Update certificates for profile
     */
    private void updateCertificates(TutorProfile profile, List<BecomeTutorDraftRequest.CertificateRequest> certificateRequests) {
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
        for (BecomeTutorDraftRequest.CertificateRequest certRequest : certificateRequests) {
            Certificate certificate = new Certificate();
            certificate.setProfile(profile);
            certificate.setName(certRequest.getName());
            certificate.setIssuedBy(certRequest.getIssuedBy());
            certificate.setDescription(certRequest.getDescription());
            certificate.setCertFileName(certRequest.getCertFileName());
            certificate.setCertFileUrl(certRequest.getCertFileUrl());
            certificate.setValid(false); // Will be validated by admin
            certificate.setVerified(certRequest.isVerified());
            
            certificateRepository.save(certificate);
        }
        
        log.info("Updated {} certificates for profile {}", certificateRequests.size(), profile.getId());
    }

    /**
     * Update schedules for profile
     */
    private void updateSchedules(TutorProfile profile, List<BecomeTutorDraftRequest.ScheduleRequest> scheduleRequests) {
        if (scheduleRequests == null) return;
        
        // Ensure profile has an ID (should be saved already)
        if (profile.getId() == null) {
            throw new RuntimeException("Profile must be saved before updating schedules");
        }
        
        // Delete existing schedules for this profile
        // Schedules are now managed through ProfileApplication, not TutorProfile
        // This method is kept for backward compatibility but does nothing
        
        // Refresh the profile entity to ensure it's managed
        profile = tutorProfileRepository.findById(profile.getId()).orElse(profile);
        
        // Add new schedules
        for (BecomeTutorDraftRequest.ScheduleRequest schedRequest : scheduleRequests) {
            ApplicationSchedule schedule = new ApplicationSchedule();
            // ApplicationSchedule now links to ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
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
            
            // Schedules are now managed through ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
        }
        
        log.info("Updated {} schedules for profile {}", scheduleRequests.size(), profile.getId());
    }

    /**
     * Update subject fees for profile
     */
    private void updateSubjectFees(TutorProfile profile, List<BecomeTutorDraftRequest.SubjectFeeRequest> subjectFeeRequests) {
        if (subjectFeeRequests == null) return;
        
        // Ensure profile has an ID (should be saved already)
        if (profile.getId() == null) {
            throw new RuntimeException("Profile must be saved before updating subject fees");
        }
        
        // Delete existing subject fees for this profile
        // Subject fees are now managed through ProfileApplication, not TutorProfile
        // This method is kept for backward compatibility but does nothing
        
        // Refresh the profile entity to ensure it's managed
        profile = tutorProfileRepository.findById(profile.getId()).orElse(profile);
        
        // Add new subject fees
        for (BecomeTutorDraftRequest.SubjectFeeRequest feeRequest : subjectFeeRequests) {
            // Find subject by ID
            Subject subject = subjectRepository.findById(feeRequest.getSubjectId()).orElse(null);
            if (subject == null) {
                log.warn("Subject not found with ID: {}", feeRequest.getSubjectId());
                continue;
            }
            
            ApplicationSubjectFee applicationSubjectFee = new ApplicationSubjectFee();
            // ApplicationSubjectFee now links to ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
            applicationSubjectFee.setSubject(subject);
            applicationSubjectFee.setFees(BigDecimal.valueOf(feeRequest.getFees()));
            
            // Subject fees are now managed through ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
        }
        
        log.info("Updated {} subject fees for profile {}", subjectFeeRequests.size(), profile.getId());
    }

    /**
     * Update teaching audiences for profile
     */
    private void updateTeachingAudiences(TutorProfile profile, List<String> teachingAudienceNames) {
        if (teachingAudienceNames == null) return;
        
        // Ensure profile has an ID (should be saved already)
        if (profile.getId() == null) {
            throw new RuntimeException("Profile must be saved before updating teaching audiences");
        }
        
        // Delete existing teaching audiences for this profile
        // Teaching audiences are now managed through ProfileApplication, not TutorProfile
        // This method is kept for backward compatibility but does nothing
        
        // Refresh the profile entity to ensure it's managed
        profile = tutorProfileRepository.findById(profile.getId()).orElse(profile);
        
        // Add new teaching audiences
        for (String audienceName : teachingAudienceNames) {
            // Find TeachingAudience by name
            TeachingAudience audience = teachingAudienceRepository.findByName(audienceName).orElse(null);
            if (audience != null) {
                ApplicationTeachingAudience appAudience = new ApplicationTeachingAudience();
                // ApplicationTeachingAudience now links to ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
                appAudience.setTeachingAudience(audience);
                // Teaching audiences are now managed through ProfileApplication, not TutorProfile
                // This method is kept for backward compatibility but does nothing
            } else {
                log.warn("TeachingAudience not found with name: {}", audienceName);
            }
        }
        
        log.info("Updated {} teaching audiences for profile {}", teachingAudienceNames.size(), profile.getId());
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
        // Schedules are now managed through ProfileApplication, not TutorProfile
        List<ApplicationSchedule> schedules = new ArrayList<>();
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
        // Subject fees are now managed through ProfileApplication, not TutorProfile
        List<ApplicationSubjectFee> subjectFees = new ArrayList<>();
        return subjectFees.stream().map(subjectFee -> {
            Map<String, Object> feeData = new HashMap<>();
            feeData.put("id", subjectFee.getId());
            feeData.put("subjectId", subjectFee.getSubject().getId());
            feeData.put("subjectName", subjectFee.getSubject().getName());
            feeData.put("fees", subjectFee.getFees().intValue());
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
            targetEdu.setDegreeFileUrl(sourceEdu.getDegreeFileUrl());
            targetEdu.setValid(true); // Mark as valid when approved by admin
            targetEdu.setVerified(sourceEdu.isVerified());
            
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
            targetCert.setCertFileUrl(sourceCert.getCertFileUrl());
            targetCert.setValid(true); // Mark as valid when approved by admin
            targetCert.setVerified(sourceCert.isVerified());
            
            certificateRepository.save(targetCert);
        }
        
        // Copy schedules
        // Schedules are now managed through ProfileApplication, not TutorProfile
        List<ApplicationSchedule> sourceSchedules = new ArrayList<>();
        for (ApplicationSchedule sourceSchedule : sourceSchedules) {
            ApplicationSchedule targetSchedule = new ApplicationSchedule();
            // ApplicationSchedule now links to ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
            targetSchedule.setDayOfWeek(sourceSchedule.getDayOfWeek());
            targetSchedule.setFromTime(sourceSchedule.getFromTime());
            targetSchedule.setToTime(sourceSchedule.getToTime());
            targetSchedule.setEnable(sourceSchedule.getEnable());
            
            // Schedules are now managed through ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
        }
        
        // Copy subject fees
        // Subject fees are now managed through ProfileApplication, not TutorProfile
        List<ApplicationSubjectFee> sourceSubjectFees = new ArrayList<>();
        for (ApplicationSubjectFee sourceSubjectFee : sourceSubjectFees) {
            ApplicationSubjectFee targetSubjectFee = new ApplicationSubjectFee();
            // ApplicationSubjectFee now links to ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
            targetSubjectFee.setSubject(sourceSubjectFee.getSubject());
            targetSubjectFee.setFees(sourceSubjectFee.getFees());
            
            // Subject fees are now managed through ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
        }
        
        // Copy teaching audiences
        // Teaching audiences are now managed through ProfileApplication, not TutorProfile
        List<ApplicationTeachingAudience> sourceTeachingAudiences = new ArrayList<>();
        for (ApplicationTeachingAudience sourceAppAudience : sourceTeachingAudiences) {
            ApplicationTeachingAudience targetAppAudience = new ApplicationTeachingAudience();
            // ApplicationTeachingAudience now links to ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
            targetAppAudience.setTeachingAudience(sourceAppAudience.getTeachingAudience());
            
            // Teaching audiences are now managed through ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
        }
        
        log.info("Successfully copied {} educations, {} certificates, {} schedules, {} subject fees, {} teaching audiences",
                sourceEducations.size(), sourceCertificates.size(), sourceSchedules.size(), sourceSubjectFees.size(), sourceTeachingAudiences.size());
    }
    
    /**
     * Get teaching audiences for profile
     */
    private List<Map<String, Object>> getTeachingAudiencesForProfile(Integer profileId) {
        List<ApplicationTeachingAudience> applicationTeachingAudiences = 
            applicationTeachingAudienceRepository.findByTutorProfileId(profileId);
        
        return applicationTeachingAudiences.stream().map(appAudience -> {
            TeachingAudience audience = appAudience.getTeachingAudience();
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
    public void syncDataFromProfileApplication(ProfileApplication application, User user, TutorProfile tutor) {
        log.info("Syncing data from ProfileApplication {} to User {} and TutorProfile {}", 
                application.getId(), user.getId(), tutor.getId());
        
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
            tutor.setBio(application.getBio());
        }
        if (application.getHeadline() != null && !application.getHeadline().isEmpty()) {
            tutor.setHeadline(application.getHeadline());
        }
        if (application.getExperience() != null && !application.getExperience().isEmpty()) {
            tutor.setExperience(application.getExperience());
        }
        if (application.getCvFileUrl() != null && !application.getCvFileUrl().isEmpty()) {
            tutor.setCvFileUrl(application.getCvFileUrl());
        }
        if (application.getVideoIntro() != null && !application.getVideoIntro().isEmpty()) {
            tutor.setVideoIntro(application.getVideoIntro());
        }
        
        // Đồng bộ teaching audiences
        if (application.getTeachingAudiences() != null && !application.getTeachingAudiences().isEmpty()) {
            syncTeachingAudiencesFromApplication(application, tutor);
        }
        
        // Đồng bộ educations từ ApplicationEducation sang Education
        if (application.getEducations() != null && !application.getEducations().isEmpty()) {
            syncEducationsFromApplication(application, tutor);
        }
        
        // Đồng bộ certificates từ ApplicationCertificate sang Certificate
        if (application.getCertificates() != null && !application.getCertificates().isEmpty()) {
            syncCertificatesFromApplication(application, tutor);
        }
        
        // Đồng bộ schedules từ ApplicationSchedule sang Schedule
        if (application.getSchedules() != null && !application.getSchedules().isEmpty()) {
            syncSchedulesFromApplication(application, tutor);
        }
        
        // Đồng bộ subject fees từ ApplicationSubjectFee sang ApplicationSubjectFee
        if (application.getSubjectFees() != null && !application.getSubjectFees().isEmpty()) {
            syncSubjectFeesFromApplication(application, tutor);
        }
        
        log.info("Successfully synced data from ProfileApplication to User and TutorProfile");
    }
    
    /**
     * Đồng bộ teaching audiences từ ApplicationTeachingAudience sang ApplicationTeachingAudience
     */
    private void syncTeachingAudiencesFromApplication(ProfileApplication application, TutorProfile tutor) {
        // Xóa teaching audiences cũ
        // Teaching audiences are now managed through ProfileApplication, not TutorProfile
        // This method is kept for backward compatibility but does nothing
        
        // Tạo teaching audiences mới từ application
        for (ApplicationTeachingAudience appAudience : application.getTeachingAudiences()) {
            TeachingAudience audience = appAudience.getTeachingAudience();
            ApplicationTeachingAudience newAppAudience = new ApplicationTeachingAudience();
            newAppAudience.setTutorProfile(tutor);
            newAppAudience.setTeachingAudience(audience);
            applicationTeachingAudienceRepository.save(newAppAudience);
        }
    }
    
    /**
     * Đồng bộ educations từ ApplicationEducation sang Education
     */
    private void syncEducationsFromApplication(ProfileApplication application, TutorProfile tutor) {
        // Xóa educations cũ
        List<Education> existingEducations = educationRepository.findByProfileId(tutor.getId());
        educationRepository.deleteAll(existingEducations);
        
        // Tạo educations mới từ application
        for (ApplicationEducation appEdu : application.getEducations()) {
            Education education = new Education();
            education.setProfile(tutor);
            education.setSchoolName(appEdu.getSchoolName());
            education.setMajor(appEdu.getMajor());
            education.setDegree(appEdu.getDegree());
            education.setFromTime(appEdu.getFromTime());
            education.setToTime(appEdu.getToTime());
            education.setDegreeFileName(appEdu.getDegreeFileName());
            education.setDegreeFileUrl(appEdu.getDegreeFileUrl());
            education.setVerified(appEdu.isVerified());
            
            educationRepository.save(education);
        }
    }
    
    /**
     * Đồng bộ certificates từ ApplicationCertificate sang Certificate
     */
    private void syncCertificatesFromApplication(ProfileApplication application, TutorProfile tutor) {
        // Xóa certificates cũ
        List<Certificate> existingCertificates = certificateRepository.findByProfileId(tutor.getId());
        certificateRepository.deleteAll(existingCertificates);
        
        // Tạo certificates mới từ application
        for (ApplicationCertificate appCert : application.getCertificates()) {
            Certificate certificate = new Certificate();
            certificate.setProfile(tutor);
            certificate.setName(appCert.getName());
            certificate.setIssuedBy(appCert.getIssuedBy());
            certificate.setDescription(appCert.getDescription());
            certificate.setValid(appCert.getValid());
            certificate.setCertFileName(appCert.getCertFileName());
            certificate.setCertFileUrl(appCert.getCertFileUrl());
            certificate.setVerified(appCert.isVerified());
            
            certificateRepository.save(certificate);
        }
    }
    
    /**
     * Đồng bộ schedules từ ApplicationSchedule sang Schedule
     */
    private void syncSchedulesFromApplication(ProfileApplication application, TutorProfile tutor) {
        // Xóa schedules cũ
        // Schedules are now managed through ProfileApplication, not TutorProfile
        // This method is kept for backward compatibility but does nothing
        
        // Tạo schedules mới từ application
        for (ApplicationSchedule appSchedule : application.getSchedules()) {
            ApplicationSchedule schedule = new ApplicationSchedule();
            // ApplicationSchedule now links to ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
            schedule.setDayOfWeek(appSchedule.getDayOfWeek());
            schedule.setFromTime(appSchedule.getFromTime());
            schedule.setToTime(appSchedule.getToTime());
            schedule.setEnable(appSchedule.getEnable());
            
            // Schedules are now managed through ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
        }
    }
    
    /**
     * Đồng bộ subject fees từ ApplicationSubjectFee sang ApplicationSubjectFee
     */
    private void syncSubjectFeesFromApplication(ProfileApplication application, TutorProfile tutor) {
        // Xóa subject fees cũ
        // Subject fees are now managed through ProfileApplication, not TutorProfile
        // This method is kept for backward compatibility but does nothing
        
        // Tạo subject fees mới từ application
        for (ApplicationSubjectFee appSubjectFee : application.getSubjectFees()) {
            ApplicationSubjectFee subjectFee = new ApplicationSubjectFee();
            // ApplicationSubjectFee now links to ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
            subjectFee.setSubject(appSubjectFee.getSubject());
            subjectFee.setFees(appSubjectFee.getFees());
            
            // Subject fees are now managed through ProfileApplication, not TutorProfile
            // This method is kept for backward compatibility but does nothing
        }
    }
    
    private List<Map<String, Object>> getEducationsForApplication(Long applicationId) {
        ProfileApplication application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null) return new ArrayList<>();
        
        List<ApplicationEducation> educations = applicationEducationRepository.findByApplicationOrderByFromTimeDesc(application);
        return educations.stream().map(education -> {
            Map<String, Object> educationMap = new HashMap<>();
            educationMap.put("schoolName", education.getSchoolName());
            educationMap.put("degree", education.getDegree());
            educationMap.put("major", education.getMajor());
            educationMap.put("fromTime", education.getFromTime());
            educationMap.put("toTime", education.getToTime());
            educationMap.put("degreeFileName", education.getDegreeFileName());
            educationMap.put("degreeFileUrl", education.getDegreeFileUrl());
            educationMap.put("isVerified", education.isVerified());
            return educationMap;
        }).collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> getCertificatesForApplication(Long applicationId) {
        ProfileApplication application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null) return new ArrayList<>();
        
        List<ApplicationCertificate> certificates = applicationCertificateRepository.findByApplication(application);
        return certificates.stream().map(certificate -> {
            Map<String, Object> certificateMap = new HashMap<>();
            certificateMap.put("name", certificate.getName());
            certificateMap.put("description", certificate.getDescription());
            certificateMap.put("issuedBy", certificate.getIssuedBy());
            certificateMap.put("certFileName", certificate.getCertFileName());
            certificateMap.put("certFileUrl", certificate.getCertFileUrl());
            certificateMap.put("isVerified", certificate.isVerified());
            return certificateMap;
        }).collect(Collectors.toList());
    }
    
    private List<String> getTeachingAudiencesForApplication(Long applicationId) {
        return applicationTeachingAudienceRepository.findByApplicationId(applicationId)
                .stream()
                .map(ata -> ata.getTeachingAudience().getName())
                .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> getSchedulesForApplication(Long applicationId) {
        return applicationScheduleRepository.findByApplicationId(applicationId)
                .stream()
                .map(schedule -> {
                    Map<String, Object> scheduleMap = new HashMap<>();
                    scheduleMap.put("dayOfWeek", schedule.getDayOfWeek());
                    scheduleMap.put("fromTime", schedule.getFromTime().toString());
                    scheduleMap.put("toTime", schedule.getToTime().toString());
                    scheduleMap.put("enable", schedule.getEnable());
                    return scheduleMap;
                })
                .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> getSubjectFeesForApplication(Long applicationId) {
        return applicationSubjectFeeRepository.findByApplicationId(applicationId)
                .stream()
                .map(subjectFee -> {
                    Map<String, Object> feeMap = new HashMap<>();
                    feeMap.put("subjectId", subjectFee.getSubject().getId());
                    feeMap.put("fees", subjectFee.getFees().intValue());
                    return feeMap;
                })
                .collect(Collectors.toList());
    }
}
