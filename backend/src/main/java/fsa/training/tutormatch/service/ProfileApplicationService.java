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
public class ProfileApplicationService {

    private final ProfileApplicationRepository applicationRepository;
    private final ApplicationEducationRepository educationRepository;
    private final ApplicationCertificateRepository certificateRepository;
    private final ApplicationScheduleRepository scheduleRepository;
    private final ApplicationSubjectFeeRepository subjectFeeRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final EducationRepository educationRepositoryMain;
    private final CertificateRepository certificateRepositoryMain;
    private final ApplicationScheduleRepository scheduleRepositoryMain;
    private final ApplicationSubjectFeeRepository applicationSubjectFeeRepository;
    private final ApplicationTeachingAudienceRepository applicationTeachingAudienceRepository;
    
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TeachingAudienceRepository teachingAudienceRepository;

    /**
     * Save draft application for student becoming tutor
     */
    @Transactional
    public Map<String, Object> saveDraftForStudentBecomingTutor(String username, BecomeTutorDraftRequest request) {
        log.info("Saving draft for student becoming tutor: {}", username);
        log.info("Request data: {}", request);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Find latest application by user
        Optional<ProfileApplication> existingApp = applicationRepository
                .findLatestByUser(user);
        
        ProfileApplication application;
        
        // Logic for draft: 
        // - Nếu chưa có hồ sơ -> tạo mới
        // - Nếu có hồ sơ DRAFT/SUBMITTED/APPROVED -> update hồ sơ cũ
        // - Nếu có hồ sơ REJECTED -> tạo bản ghi mới (giữ bản ghi REJECTED để thống kê)
        if (!existingApp.isPresent()) {
            // Create new application
            application = new ProfileApplication();
            application.setUser(user);
        } else if (existingApp.get().getStatus() == ApplicationStatus.REJECTED) {
            // Nếu hồ sơ bị REJECTED, tạo bản ghi mới
            application = new ProfileApplication();
            application.setUser(user);
        } else {
            // Update existing application (DRAFT/SUBMITTED/APPROVED)
            application = existingApp.get();
        }
        
        // Only set status to DRAFT if current status is not SUBMITTED
        // If status is SUBMITTED, keep it as SUBMITTED (admin hasn't reviewed yet)
        if (application.getStatus() != ApplicationStatus.SUBMITTED) {
            application.setStatus(ApplicationStatus.DRAFT);
        }

        try {
            // Update basic fields
            updateApplicationFromRequest(application, request);

            // Validate schedules for overlapping times
            validateSchedules(request.getSchedules());

            // Save application
            application = applicationRepository.save(application);

            // Save related entities
            saveApplicationEducations(application, request.getEducations());
            saveApplicationCertificates(application, request.getCertificates());
            saveApplicationSchedules(application, request.getSchedules());
            saveApplicationSubjectFees(application, request.getSubjectFees());
        } catch (Exception e) {
            log.error("Error in saveDraftForStudentBecomingTutor: ", e);
            throw e;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Draft saved successfully");
        response.put("applicationId", application.getId());
        return response;
    }

    /**
     * Submit application for review
     */
    @Transactional
    public Map<String, Object> submitApplicationForStudentBecomingTutor(String username, BecomeTutorRequest request) {
        log.info("Submitting application for student becoming tutor: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Find latest application by user
        Optional<ProfileApplication> existingApp = applicationRepository
                .findLatestByUser(user);
        
        ProfileApplication application;
        
        // Logic for submit: 
        // - Nếu chưa có hồ sơ -> tạo mới
        // - Nếu có hồ sơ DRAFT/SUBMITTED/APPROVED -> update hồ sơ cũ
        // - Nếu có hồ sơ REJECTED -> tạo bản ghi mới (giữ bản ghi REJECTED để thống kê)
        if (!existingApp.isPresent()) {
            // Create new application
            application = new ProfileApplication();
            application.setUser(user);
        } else if (existingApp.get().getStatus() == ApplicationStatus.REJECTED) {
            // Nếu hồ sơ bị REJECTED, tạo bản ghi mới
            application = new ProfileApplication();
            application.setUser(user);
        } else {
            // Update existing application (DRAFT/SUBMITTED/APPROVED)
            application = existingApp.get();
        }

        // Update with latest data and submit
        updateApplicationFromRequest(application, request);
        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setSubmittedAt(ZonedDateTime.now());

        // Save application
        application = applicationRepository.save(application);

        // Save related entities
        saveApplicationEducationsFromSubmit(application, request.getEducations());
        saveApplicationCertificatesFromSubmit(application, request.getCertificates());
        saveApplicationSchedulesFromSubmit(application, request.getSchedules());
        saveApplicationSubjectFeesFromSubmit(application, request.getSubjectFees());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Application submitted successfully");
        response.put("applicationId", application.getId());
        return response;
    }

    /**
     * Get draft application data
     */
    public Map<String, Object> getDraftApplicationData(String username) {
        log.info("Getting draft application data for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Find latest application by user (DRAFT, SUBMITTED, or REJECTED)
        Optional<ProfileApplication> applicationOpt = applicationRepository
                .findLatestByUser(user);

        Map<String, Object> response = new HashMap<>();
        if (applicationOpt.isEmpty()) {
            response.put("success", true);
            response.put("hasDraft", false);
            response.put("message", "No draft application found");
            return response;
        }

        ProfileApplication application = applicationOpt.get();
        
        // Build response with all data
        response.put("success", true);
        response.put("hasDraft", true);
        
        // Basic fields
        response.put("firstName", application.getFirstName());
        response.put("lastName", application.getLastName());
        response.put("imageAvatar", application.getImageAvatar());
        response.put("phoneNumber", application.getPhoneNumber());
        response.put("address", application.getAddress());
        // Tutor-specific fields
        response.put("bio", application.getBio());
        response.put("headline", application.getHeadline());
        response.put("experience", application.getExperience());
        response.put("cvFileUrl", application.getCvFileUrl());
        response.put("cvFileName", application.getCvFileName());
        response.put("videoIntro", application.getVideoIntro());
        
        // Related entities
        List<ApplicationEducation> educations = educationRepository.findByApplicationOrderByFromTimeDesc(application);
        response.put("educations", buildEducationDTOs(educations));
        
        List<ApplicationCertificate> certificates = certificateRepository.findByApplication(application);
        response.put("certificates", buildCertificateDTOs(certificates));
        
        // Get schedules and subject fees
        List<ApplicationSchedule> schedules = scheduleRepository.findByApplication(application);
        response.put("schedules", buildScheduleDTOs(schedules));
        
        List<ApplicationSubjectFee> subjectFees = subjectFeeRepository.findByApplication(application);
        response.put("subjectFees", buildSubjectFeeDTOs(subjectFees));
        
        // Add teaching audiences
        if (application.getTeachingAudiences() != null) {
            List<Map<String, Object>> teachingAudienceDTOs = application.getTeachingAudiences().stream()
                    .map(audience -> {
                        Map<String, Object> dto = new HashMap<>();
                        dto.put("id", audience.getId().intValue());
                        dto.put("name", audience.getTeachingAudience().getName());
                        return dto;
                    })
                    .collect(Collectors.toList());
            response.put("teachingAudiences", teachingAudienceDTOs);
        } else {
            response.put("teachingAudiences", new ArrayList<>());
        }

        return response;
    }

    /**
     * Get applications for admin review
     */
    public List<Map<String, Object>> getApplicationsForAdminReview() {
        List<ProfileApplication> applications = applicationRepository.findAll().stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SUBMITTED || 
                              app.getStatus() == ApplicationStatus.APPROVED || 
                              app.getStatus() == ApplicationStatus.REJECTED)
                .collect(Collectors.toList());
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (ProfileApplication app : applications) {
            Map<String, Object> appData = new HashMap<>();
            
            // Basic info
            appData.put("id", app.getId());
            appData.put("userId", app.getUser().getId());
            appData.put("firstName", app.getFirstName());
            appData.put("lastName", app.getLastName());
            appData.put("email", app.getUser().getUsername());
            appData.put("phoneNumber", app.getPhoneNumber());
            appData.put("address", app.getAddress());
            appData.put("imageAvatar", app.getImageAvatar());
            
            // Application info
            appData.put("applicationType", "BECOME_TUTOR");
            appData.put("status", app.getStatus().toString());
            appData.put("bio", app.getBio());
            appData.put("headline", app.getHeadline());
            appData.put("experience", app.getExperience());
            appData.put("cvFileUrl", app.getCvFileUrl());
            appData.put("cvFileName", app.getCvFileName());
            appData.put("videoIntro", app.getVideoIntro());
            
            // Timestamps
            appData.put("submittedAt", app.getSubmittedAt());
            appData.put("createdAt", app.getCreatedAt());
            appData.put("updatedAt", app.getUpdatedAt());
            
            // Related entities - Load with minimal data to avoid circular references
            List<ApplicationEducation> educations = educationRepository.findByApplicationOrderByFromTimeDesc(app);
            appData.put("educations", buildEducationDTOs(educations));
            
            List<ApplicationCertificate> certificates = certificateRepository.findByApplication(app);
            appData.put("certificates", buildCertificateDTOs(certificates));
            
            // Note: ApplicationSchedule and ApplicationSubjectFee now use TutorProfile instead of ProfileApplication
            // Return empty lists for backward compatibility
            appData.put("schedules", new ArrayList<>());
            appData.put("subjectFees", new ArrayList<>());
            
            // Teaching audiences - now using @ManyToMany relationship directly
            if (app.getTeachingAudiences() != null) {
                List<Map<String, Object>> teachingAudienceDTOs = app.getTeachingAudiences().stream()
                        .map(audience -> {
                            Map<String, Object> audienceData = new HashMap<>();
                            audienceData.put("id", audience.getId());
                            audienceData.put("name", audience.getTeachingAudience().getName());
                            return audienceData;
                        })
                        .collect(Collectors.toList());
                appData.put("teachingAudiences", teachingAudienceDTOs);
            } else {
                appData.put("teachingAudiences", new ArrayList<>());
            }
            
            result.add(appData);
        }
        
        return result;
    }

    /**
     * Approve application
     */
    @Transactional
    public Map<String, Object> approveApplication(Long applicationId, String adminUsername) {
        ProfileApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin not found: " + adminUsername));

        application.setStatus(ApplicationStatus.APPROVED);
        application.setReviewedBy(admin);
        application.setReviewedAt(ZonedDateTime.now());

        applicationRepository.save(application);

        // Copy data from ProfileApplication to User and create TutorProfile
        User user = application.getUser();
        
        // Update User information from ProfileApplication
        if (application.getFirstName() != null) {
            user.setFirstName(application.getFirstName());
        }
        if (application.getLastName() != null) {
            user.setLastName(application.getLastName());
        }
        if (application.getImageAvatar() != null) {
            user.setImageAvatar(application.getImageAvatar());
        }
        if (application.getPhoneNumber() != null) {
            user.setPhoneNumber(application.getPhoneNumber());
        }
        if (application.getAddress() != null) {
            user.setAddress(application.getAddress());
        }
        
        // Change role to TUTOR and verify
        user.setRole(UserRole.TUTOR);
        user.setVerified(true);
        userRepository.save(user);
        
        // Set application as verified
        application.setVerified(true);
        applicationRepository.save(application);

        // Create or update TutorProfile
        TutorProfile tutor = tutorProfileRepository.findByUser(user)
                .orElse(new TutorProfile());
        
        // Set user relationship
        tutor.setUser(user);
        
        // Copy tutor-specific information from ProfileApplication
        if (application.getBio() != null) {
            tutor.setBio(application.getBio());
        }
        if (application.getHeadline() != null) {
            tutor.setHeadline(application.getHeadline());
        }
        if (application.getExperience() != null) {
            tutor.setExperience(application.getExperience());
        }
        if (application.getCvFileUrl() != null) {
            tutor.setCvFileUrl(application.getCvFileUrl());
        }
        if (application.getVideoIntro() != null) {
            tutor.setVideoIntro(application.getVideoIntro());
        }
        
        // Enable the tutor profile and set as verified
        tutor.setEnable(true);
        tutor.setVerified(true);
        tutorProfileRepository.save(tutor);

        // Copy related data (educations, certificates, etc.)
        copyApplicationDataToTutorProfile(application, tutor);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Application approved successfully");
        return response;
    }

    /**
     * Copy related data from ProfileApplication to TutorProfile
     */
    private void copyApplicationDataToTutorProfile(ProfileApplication application, TutorProfile tutor) {
        // XÓA dữ liệu cũ trước khi copy dữ liệu mới để tránh duplicate
        log.info("Clearing existing data for tutor profile {}", tutor.getId());
        
        // Xóa educations cũ
        educationRepositoryMain.deleteByProfileId(tutor.getId());
        
        // Xóa certificates cũ
        certificateRepositoryMain.deleteByProfileId(tutor.getId());
        
        // Xóa subject fees cũ
        applicationSubjectFeeRepository.deleteByTutorProfileId(tutor.getId());
        
        // Xóa teaching audiences cũ
        applicationTeachingAudienceRepository.deleteByTutorProfileId(tutor.getId());
        
        // Xóa schedules cũ
        scheduleRepositoryMain.deleteByTutorProfileId(tutor.getId());
        
        log.info("Cleared existing data, now copying new data from application {}", application.getId());
        
        // Copy educations
        if (application.getEducations() != null) {
            for (ApplicationEducation appEdu : application.getEducations()) {
                Education education = new Education();
                education.setProfile(tutor);
                education.setSchoolName(appEdu.getSchoolName() != null ? appEdu.getSchoolName() : "N/A");
                education.setDegree(appEdu.getDegree() != null ? appEdu.getDegree() : "N/A");
                education.setMajor(appEdu.getMajor() != null ? appEdu.getMajor() : "N/A");
                education.setFromTime(appEdu.getFromTime() != null ? appEdu.getFromTime() : 2020);
                education.setToTime(appEdu.getToTime() != null ? appEdu.getToTime() : 2024);
                education.setDegreeFileUrl(appEdu.getDegreeFileUrl());
                education.setDegreeFileName(appEdu.getDegreeFileName());
                education.setVerified(false); // Default to false for new educations
                educationRepositoryMain.save(education);
            }
        }

        // Copy certificates
        if (application.getCertificates() != null) {
            for (ApplicationCertificate appCert : application.getCertificates()) {
                Certificate certificate = new Certificate();
                certificate.setProfile(tutor);
                certificate.setName(appCert.getName() != null ? appCert.getName() : "N/A");
                certificate.setIssuedBy(appCert.getIssuedBy() != null ? appCert.getIssuedBy() : "N/A");
                certificate.setCertFileUrl(appCert.getCertFileUrl());
                certificate.setCertFileName(appCert.getCertFileName());
                certificate.setVerified(false); // Default to false for new certificates
                certificateRepositoryMain.save(certificate);
            }
        }

        // Copy subject fees
        if (application.getSubjectFees() != null) {
            for (ApplicationSubjectFee appSubjectFee : application.getSubjectFees()) {
                ApplicationSubjectFee subjectFee = new ApplicationSubjectFee();
                subjectFee.setTutorProfile(tutor);
                subjectFee.setSubject(appSubjectFee.getSubject());
                subjectFee.setFees(appSubjectFee.getFees());
                applicationSubjectFeeRepository.save(subjectFee);
            }
        }

        // Copy teaching audiences
        if (application.getTeachingAudiences() != null) {
            for (ApplicationTeachingAudience appAudience : application.getTeachingAudiences()) {
                ApplicationTeachingAudience audience = new ApplicationTeachingAudience();
                audience.setTutorProfile(tutor);
                audience.setTeachingAudience(appAudience.getTeachingAudience());
                applicationTeachingAudienceRepository.save(audience);
            }
        }
        
        // Copy schedules
        if (application.getSchedules() != null) {
            for (ApplicationSchedule appSchedule : application.getSchedules()) {
                ApplicationSchedule schedule = new ApplicationSchedule();
                schedule.setTutorProfile(tutor);
                schedule.setDayOfWeek(appSchedule.getDayOfWeek());
                schedule.setFromTime(appSchedule.getFromTime());
                schedule.setToTime(appSchedule.getToTime());
                schedule.setEnable(appSchedule.getEnable());
                scheduleRepositoryMain.save(schedule);
            }
        }
        
        log.info("Successfully copied all data from application {} to tutor profile {}", 
                application.getId(), tutor.getId());
    }

      /**
     * Reject application
     */
    @Transactional
    public Map<String, Object> rejectApplication(Long applicationId, String adminUsername, String reason) {
        ProfileApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin not found: " + adminUsername));

        application.setStatus(ApplicationStatus.REJECTED);
        application.setReviewedBy(admin);
        application.setReviewedAt(ZonedDateTime.now());
        application.setAdminNote(reason);

        applicationRepository.save(application);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Application rejected");
        return response;
    }

    // Helper methods
    private void updateApplicationFromRequest(ProfileApplication application, BecomeTutorRequest request) {
        // Personal info
        if (request.getFirstName() != null) application.setFirstName(request.getFirstName());
        if (request.getLastName() != null) application.setLastName(request.getLastName());
        if (request.getAvatar() != null) application.setImageAvatar(request.getAvatar());
        if (request.getPhoneNumber() != null) application.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) application.setAddress(request.getAddress());
        
        // Tutor-specific fields
        if (request.getBio() != null) application.setBio(request.getBio());
        if (request.getHeadline() != null) application.setHeadline(request.getHeadline());
        if (request.getExperience() != null) application.setExperience(request.getExperience());
        if (request.getCvFileUrl() != null) application.setCvFileUrl(request.getCvFileUrl());
        if (request.getCvFileName() != null) application.setCvFileName(request.getCvFileName());
        if (request.getVideoIntro() != null) application.setVideoIntro(request.getVideoIntro());
        
        // Set teaching audiences - now managed through ApplicationTeachingAudience
        // This method is kept for backward compatibility but does nothing
        // Teaching audiences are now managed separately through saveApplicationTeachingAudiences
    }

    private void updateApplicationFromRequest(ProfileApplication application, BecomeTutorDraftRequest request) {
        log.info("Updating application from draft request: {}", request);
        
        // Personal info
        if (request.getFirstName() != null) application.setFirstName(request.getFirstName());
        if (request.getLastName() != null) application.setLastName(request.getLastName());
        if (request.getAvatar() != null) application.setImageAvatar(request.getAvatar());
        if (request.getPhoneNumber() != null) application.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) application.setAddress(request.getAddress());
        
        // Tutor-specific fields
        if (request.getBio() != null) application.setBio(request.getBio());
        if (request.getHeadline() != null) application.setHeadline(request.getHeadline());
        if (request.getExperience() != null) application.setExperience(request.getExperience());
        if (request.getCvFileUrl() != null) application.setCvFileUrl(request.getCvFileUrl());
        if (request.getCvFileName() != null) application.setCvFileName(request.getCvFileName());
        if (request.getVideoIntro() != null) application.setVideoIntro(request.getVideoIntro());
        
        // Set teaching audiences
        if (request.getTeachingAudiences() != null && !request.getTeachingAudiences().isEmpty()) {
            log.info("Processing teaching audiences: {}", request.getTeachingAudiences());
            // Teaching audiences are now managed through ApplicationTeachingAudience
            // This method is kept for backward compatibility but does nothing
            // Teaching audiences are now managed separately through saveApplicationTeachingAudiences
        }
    }

    private void saveApplicationEducations(ProfileApplication application, List<BecomeTutorDraftRequest.EducationRequest> educations) {
        // Clear existing educations
        educationRepository.deleteByApplication(application);
        
        // Save new educations
        if (educations != null) {
            for (BecomeTutorDraftRequest.EducationRequest edu : educations) {
                ApplicationEducation education = new ApplicationEducation();
                education.setApplication(application);
                education.setSchoolName(edu.getSchoolName());
                education.setDegree(edu.getDegree());
                education.setMajor(edu.getMajor());
                education.setFromTime(edu.getFromTime());
                education.setToTime(edu.getToTime());
                education.setDegreeFileName(edu.getDegreeFileName());
                education.setDegreeFileUrl(edu.getDegreeFileUrl());
                educationRepository.save(education);
            }
        }
    }

    private void saveApplicationCertificates(ProfileApplication application, List<BecomeTutorDraftRequest.CertificateRequest> certificates) {
        // Clear existing certificates
        certificateRepository.deleteByApplication(application);
        
        // Save new certificates
        if (certificates != null) {
            for (BecomeTutorDraftRequest.CertificateRequest cert : certificates) {
                ApplicationCertificate certificate = new ApplicationCertificate();
                certificate.setApplication(application);
                certificate.setName(cert.getName());
                certificate.setIssuedBy(cert.getIssuedBy());
                certificate.setDescription(cert.getDescription());
                certificate.setCertFileName(cert.getCertFileName());
                certificate.setCertFileUrl(cert.getCertFileUrl());
                certificate.setValid(true);
                
                certificateRepository.save(certificate);
            }
        }
    }

    private void saveApplicationSchedules(ProfileApplication application, List<BecomeTutorDraftRequest.ScheduleRequest> schedules) {
        // Delete existing schedules for this application
        scheduleRepository.deleteByApplication(application);
        
        // Save new schedules
        if (schedules != null) {
            for (BecomeTutorDraftRequest.ScheduleRequest sched : schedules) {
                ApplicationSchedule schedule = new ApplicationSchedule();
                schedule.setApplication(application);
                schedule.setDayOfWeek(sched.getDayOfWeek());
                schedule.setFromTime(LocalTime.parse(sched.getFromTime()));
                schedule.setToTime(LocalTime.parse(sched.getToTime()));
                schedule.setEnable(sched.isEnable());
                
                scheduleRepository.save(schedule);
            }
        }
    }

    private void saveApplicationSubjectFees(ProfileApplication application, List<BecomeTutorDraftRequest.SubjectFeeRequest> subjectFees) {
        // Delete existing subject fees for this application
        subjectFeeRepository.deleteByApplication(application);
        
        // Save new subject fees
        if (subjectFees != null) {
            for (BecomeTutorDraftRequest.SubjectFeeRequest fee : subjectFees) {
                ApplicationSubjectFee subjectFee = new ApplicationSubjectFee();
                subjectFee.setApplication(application);
                subjectFee.setSubject(subjectRepository.findById(fee.getSubjectId().intValue()).orElse(null));
                subjectFee.setFees(BigDecimal.valueOf(fee.getFees()));
                
                subjectFeeRepository.save(subjectFee);
            }
        }
    }

    // DTO builders
    private List<Map<String, Object>> buildEducationDTOs(List<ApplicationEducation> educations) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ApplicationEducation edu : educations) {
            Map<String, Object> eduData = new HashMap<>();
            eduData.put("id", edu.getId());
            eduData.put("schoolName", edu.getSchoolName());
            eduData.put("degree", edu.getDegree());
            eduData.put("major", edu.getMajor());
            eduData.put("fromTime", edu.getFromTime());
            eduData.put("toTime", edu.getToTime());
            eduData.put("degreeFileName", edu.getDegreeFileName());
            eduData.put("degreeFileUrl", edu.getDegreeFileUrl());
            result.add(eduData);
        }
        return result;
    }

    private List<Map<String, Object>> buildCertificateDTOs(List<ApplicationCertificate> certificates) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ApplicationCertificate cert : certificates) {
            Map<String, Object> certData = new HashMap<>();
            certData.put("id", cert.getId());
            certData.put("name", cert.getName());
            certData.put("issuedBy", cert.getIssuedBy());
            certData.put("description", cert.getDescription());
            certData.put("certFileName", cert.getCertFileName());
            certData.put("certFileUrl", cert.getCertFileUrl());
            certData.put("valid", cert.getValid());
            result.add(certData);
        }
        return result;
    }

    private List<Map<String, Object>> buildScheduleDTOs(List<ApplicationSchedule> schedules) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ApplicationSchedule sched : schedules) {
            Map<String, Object> schedData = new HashMap<>();
            schedData.put("id", sched.getId());
            schedData.put("dayOfWeek", sched.getDayOfWeek());
            schedData.put("fromTime", sched.getFromTime() != null ? sched.getFromTime().toString() : null);
            schedData.put("toTime", sched.getToTime() != null ? sched.getToTime().toString() : null);
            schedData.put("enable", sched.getEnable());
            result.add(schedData);
        }
        return result;
    }

    private List<Map<String, Object>> buildSubjectFeeDTOs(List<ApplicationSubjectFee> subjectFees) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ApplicationSubjectFee fee : subjectFees) {
            Map<String, Object> feeData = new HashMap<>();
            feeData.put("id", fee.getId());
            feeData.put("subjectId", fee.getSubject() != null ? fee.getSubject().getId() : null);
            feeData.put("subjectName", fee.getSubject() != null ? fee.getSubject().getName() : "Unknown Subject");
            feeData.put("fees", fee.getFees());
            result.add(feeData);
        }
        return result;
    }

    private List<Map<String, Object>> buildTeachingAudienceDTOs(List<ApplicationTeachingAudience> teachingAudiences) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ApplicationTeachingAudience ta : teachingAudiences) {
            Map<String, Object> taData = new HashMap<>();
            taData.put("id", ta.getId());
            taData.put("name", ta.getTeachingAudience() != null ? ta.getTeachingAudience().getName() : "Unknown");
            result.add(taData);
        }
        return result;
    }

    // Methods for handling BecomeTutorRequest (submit)
    private void saveApplicationEducationsFromSubmit(ProfileApplication application, List<BecomeTutorRequest.EducationRequest> educations) {
        // Clear existing educations
        educationRepository.deleteByApplication(application);
        
        // Save new educations
        if (educations != null) {
            for (BecomeTutorRequest.EducationRequest edu : educations) {
                ApplicationEducation education = new ApplicationEducation();
                education.setApplication(application);
                education.setSchoolName(edu.getSchoolName());
                education.setDegree(edu.getDegree());
                education.setMajor(edu.getMajor());
                education.setFromTime(edu.getFromTime());
                education.setToTime(edu.getToTime());
                education.setDegreeFileName(edu.getDegreeFileName());
                education.setDegreeFileUrl(edu.getDegreeFileUrl());                
                educationRepository.save(education);
            }
        }
    }

    private void saveApplicationCertificatesFromSubmit(ProfileApplication application, List<BecomeTutorRequest.CertificateRequest> certificates) {
        // Clear existing certificates
        certificateRepository.deleteByApplication(application);
        
        // Save new certificates
        if (certificates != null) {
            for (BecomeTutorRequest.CertificateRequest cert : certificates) {
                ApplicationCertificate certificate = new ApplicationCertificate();
                certificate.setApplication(application);
                certificate.setName(cert.getName());
                certificate.setIssuedBy(cert.getIssuedBy());
                certificate.setDescription(cert.getDescription());
                certificate.setCertFileName(cert.getCertFileName());
                certificate.setCertFileUrl(cert.getCertFileUrl());                certificate.setValid(true);
                
                certificateRepository.save(certificate);
            }
        }
    }

    private void saveApplicationSchedulesFromSubmit(ProfileApplication application, List<BecomeTutorRequest.ScheduleRequest> schedules) {
        // Delete existing schedules for this application
        scheduleRepository.deleteByApplication(application);
        
        // Save new schedules
        if (schedules != null) {
            for (BecomeTutorRequest.ScheduleRequest sched : schedules) {
                ApplicationSchedule schedule = new ApplicationSchedule();
                schedule.setApplication(application);
                schedule.setDayOfWeek(sched.getDayOfWeek());
                schedule.setFromTime(LocalTime.parse(sched.getFromTime()));
                schedule.setToTime(LocalTime.parse(sched.getToTime()));
                schedule.setEnable(sched.isEnable());
                
                scheduleRepository.save(schedule);
            }
        }
    }

    private void saveApplicationSubjectFeesFromSubmit(ProfileApplication application, List<BecomeTutorRequest.SubjectFeeRequest> subjectFees) {
        // Delete existing subject fees for this application
        subjectFeeRepository.deleteByApplication(application);
        
        // Save new subject fees
        if (subjectFees != null) {
            for (BecomeTutorRequest.SubjectFeeRequest fee : subjectFees) {
                ApplicationSubjectFee subjectFee = new ApplicationSubjectFee();
                subjectFee.setApplication(application);
                subjectFee.setSubject(subjectRepository.findById(fee.getSubjectId().intValue()).orElse(null));
                subjectFee.setFees(BigDecimal.valueOf(fee.getFees()));
                
                subjectFeeRepository.save(subjectFee);
            }
        }
    }

    // Validate schedules for overlapping times
    private void validateSchedules(List<BecomeTutorDraftRequest.ScheduleRequest> schedules) {
        if (schedules == null || schedules.isEmpty()) return;
        
        // Group schedules by day
        Map<String, List<BecomeTutorDraftRequest.ScheduleRequest>> schedulesByDay = schedules.stream()
            .collect(Collectors.groupingBy(BecomeTutorDraftRequest.ScheduleRequest::getDayOfWeek));
        
        // Check for overlaps within each day
        for (Map.Entry<String, List<BecomeTutorDraftRequest.ScheduleRequest>> entry : schedulesByDay.entrySet()) {
            List<BecomeTutorDraftRequest.ScheduleRequest> daySchedules = entry.getValue();
            
            for (int i = 0; i < daySchedules.size(); i++) {
                for (int j = i + 1; j < daySchedules.size(); j++) {
                    if (hasTimeOverlap(daySchedules.get(i), daySchedules.get(j))) {
                        throw new IllegalArgumentException(
                            String.format("Lịch dạy trùng nhau trong ngày %s: %s-%s và %s-%s", 
                                entry.getKey(),
                                daySchedules.get(i).getFromTime(), daySchedules.get(i).getToTime(),
                                daySchedules.get(j).getFromTime(), daySchedules.get(j).getToTime())
                        );
                    }
                }
            }
        }
    }

    private boolean hasTimeOverlap(BecomeTutorDraftRequest.ScheduleRequest schedule1, BecomeTutorDraftRequest.ScheduleRequest schedule2) {
        LocalTime start1 = LocalTime.parse(schedule1.getFromTime());
        LocalTime end1 = LocalTime.parse(schedule1.getToTime());
        LocalTime start2 = LocalTime.parse(schedule2.getFromTime());
        LocalTime end2 = LocalTime.parse(schedule2.getToTime());
        
        // Check if schedules overlap: start1 < end2 && start2 < end1
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    /**
     * Get all available subjects
     */
    public List<Subject> getAllAvailableSubjects() {
        return subjectRepository.findAll();
    }

    /**
     * Get application status for a user
     */
    public Map<String, Object> getApplicationStatus(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Optional<ProfileApplication> application = applicationRepository.findLatestByUser(user);
        
        Map<String, Object> response = new HashMap<>();
        if (application.isPresent()) {
            response.put("hasApplication", true);
            response.put("status", application.get().getStatus().toString());
            response.put("applicationId", application.get().getId());
        } else {
            response.put("hasApplication", false);
        }
        
        return response;
    }

    /**
     * Get application details for a user
     */
    public Map<String, Object> getApplicationDetails(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Optional<ProfileApplication> application = applicationRepository.findLatestByUser(user);
        
        if (!application.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("hasApplication", false);
            return response;
        }

        ProfileApplication app = application.get();
        Map<String, Object> response = new HashMap<>();
        response.put("hasApplication", true);
        response.put("status", app.getStatus().toString());
        response.put("applicationId", app.getId());
        response.put("firstName", app.getFirstName());
        response.put("lastName", app.getLastName());
        response.put("bio", app.getBio());
        response.put("headline", app.getHeadline());
        response.put("experience", app.getExperience());
        response.put("cvFileUrl", app.getCvFileUrl());
        response.put("cvFileName", app.getCvFileName());
        response.put("videoIntro", app.getVideoIntro());
        response.put("createdAt", app.getCreatedAt());
        response.put("submittedAt", app.getSubmittedAt());
        response.put("reviewedAt", app.getReviewedAt());
        
        return response;
    }

    /**
     * Submit tutor application
     */
    @Transactional
    public Map<String, Object> submitTutorApplication(String username, BecomeTutorRequest request) {
        return submitApplicationForStudentBecomingTutor(username, request);
    }

    /**
     * Cancel tutor application
     */
    @Transactional
    public Map<String, Object> cancelTutorApplication(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Optional<ProfileApplication> application = applicationRepository.findLatestByUser(user);
        
        if (!application.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "No application found");
            return response;
        }

        ProfileApplication app = application.get();
        if (app.getStatus() == ApplicationStatus.APPROVED) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Cannot cancel approved application");
            return response;
        }

        app.setStatus(ApplicationStatus.REJECTED);
        applicationRepository.save(app);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Application cancelled successfully");
        return response;
    }
}
