package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.BecomeTutorRequest;
import fsa.training.tutormatch.dto.BecomeTutorDraftRequest;
import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.enums.ApplicationStatus;
import fsa.training.tutormatch.enums.ApplicationType;
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
    
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    /**
     * Save draft application for student becoming tutor
     */
    @Transactional
    public Map<String, Object> saveDraftForStudentBecomingTutor(String username, BecomeTutorDraftRequest request) {
        log.info("Saving draft for student becoming tutor: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Find latest application by user and type
        Optional<ProfileApplication> existingApp = applicationRepository
                .findLatestByUserAndType(user, ApplicationType.BECOME_TUTOR);
        
        ProfileApplication application;
        
        // Logic for draft: 
        // - Nếu chưa có hồ sơ -> tạo mới
        // - Nếu có hồ sơ DRAFT/SUBMITTED/APPROVED -> update hồ sơ cũ
        // - Nếu có hồ sơ REJECTED -> tạo bản ghi mới (giữ bản ghi REJECTED để thống kê)
        if (!existingApp.isPresent()) {
            // Create new application
            application = new ProfileApplication();
            application.setUser(user);
            application.setApplicationType(ApplicationType.BECOME_TUTOR);
        } else if (existingApp.get().getStatus() == ApplicationStatus.REJECTED) {
            // Nếu hồ sơ bị REJECTED, tạo bản ghi mới
            application = new ProfileApplication();
            application.setUser(user);
            application.setApplicationType(ApplicationType.BECOME_TUTOR);
        } else {
            // Update existing application (DRAFT/SUBMITTED/APPROVED)
            application = existingApp.get();
        }
        
        // Always set status to DRAFT when saving draft
        application.setStatus(ApplicationStatus.DRAFT);

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

        // Find latest application by user and type
        Optional<ProfileApplication> existingApp = applicationRepository
                .findLatestByUserAndType(user, ApplicationType.BECOME_TUTOR);
        
        ProfileApplication application;
        
        // Logic for submit:
        // - Nếu chưa có hồ sơ -> tạo mới
        // - Nếu có hồ sơ DRAFT/SUBMITTED/APPROVED -> update hồ sơ cũ
        // - Nếu có hồ sơ REJECTED -> tạo bản ghi mới (giữ bản ghi REJECTED để thống kê)
        if (!existingApp.isPresent()) {
            // Create new application
            application = new ProfileApplication();
            application.setUser(user);
            application.setApplicationType(ApplicationType.BECOME_TUTOR);
        } else if (existingApp.get().getStatus() == ApplicationStatus.REJECTED) {
            // Nếu hồ sơ bị REJECTED, tạo bản ghi mới
            application = new ProfileApplication();
            application.setUser(user);
            application.setApplicationType(ApplicationType.BECOME_TUTOR);
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
    public Map<String, Object> getDraftApplicationData(String username, ApplicationType applicationType) {
        log.info("Getting draft application data for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Find latest application by user and type (DRAFT, SUBMITTED, or REJECTED)
        Optional<ProfileApplication> applicationOpt = applicationRepository
                .findLatestByUserAndType(user, applicationType);

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
        response.put("timezone", application.getTimezone());
        
        // Tutor-specific fields
        response.put("bio", application.getBio());
        response.put("headline", application.getHeadline());
        response.put("experience", application.getExperience());
        response.put("teachingLevel", application.getTeachingLevel() != null ? application.getTeachingLevel().toString() : null);
        response.put("teachingMethods", application.getTeachingMethods());
        response.put("cvUrl", application.getCvUrl());
        response.put("videoIntro", application.getVideoIntro());
        
        // Related entities
        List<ApplicationEducation> educations = educationRepository.findByApplicationOrderByFromTimeDesc(application);
        response.put("educations", buildEducationDTOs(educations));
        
        List<ApplicationCertificate> certificates = certificateRepository.findByApplication(application);
        response.put("certificates", buildCertificateDTOs(certificates));
        
        List<ApplicationSchedule> schedules = scheduleRepository.findByApplication(application);
        response.put("schedules", buildScheduleDTOs(schedules));
        
        List<ApplicationSubjectFee> subjectFees = subjectFeeRepository.findByApplication(application);
        response.put("subjectFees", buildSubjectFeeDTOs(subjectFees));

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
            appData.put("phone", app.getPhoneNumber());
            appData.put("address", app.getAddress());
            appData.put("dateOfBirth", app.getDateOfBirth());
            appData.put("gender", app.getGender());
            appData.put("imageAvatar", app.getImageAvatar());
            
            // Application info
            appData.put("applicationType", app.getApplicationType().toString());
            appData.put("status", app.getStatus().toString());
            appData.put("bio", app.getBio());
            appData.put("headline", app.getHeadline());
            appData.put("experience", app.getExperience());
            appData.put("educationLevel", app.getEducationLevel());
            appData.put("teachingLevel", app.getTeachingLevel());
            appData.put("teachingMethods", app.getTeachingMethods());
            appData.put("cvUrl", app.getCvUrl());
            appData.put("videoIntro", app.getVideoIntro());
            appData.put("timezone", app.getTimezone());
            
            // Timestamps
            appData.put("submittedAt", app.getSubmittedAt());
            appData.put("createdAt", app.getCreatedAt());
            appData.put("updatedAt", app.getUpdatedAt());
            
            // Related entities
            List<ApplicationEducation> educations = educationRepository.findByApplicationOrderByFromTimeDesc(app);
            appData.put("educations", buildEducationDTOs(educations));
            
            List<ApplicationCertificate> certificates = certificateRepository.findByApplication(app);
            appData.put("certificates", buildCertificateDTOs(certificates));
            
            List<ApplicationSchedule> schedules = scheduleRepository.findByApplication(app);
            appData.put("schedules", buildScheduleDTOs(schedules));
            
            List<ApplicationSubjectFee> subjectFees = subjectFeeRepository.findByApplication(app);
            appData.put("subjectFees", buildSubjectFeeDTOs(subjectFees));
            
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

        // Apply changes - simplified version
        if (application.getApplicationType() == ApplicationType.BECOME_TUTOR) {
            // Promote student to tutor
            User user = application.getUser();
            user.setRole(UserRole.TUTOR);
            user.setVerified(true);
            userRepository.save(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Application approved successfully");
        return response;
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
        application.setRejectionReason(reason);

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
        if (request.getTimezone() != null) application.setTimezone(request.getTimezone());
        
        // Tutor-specific fields
        if (request.getBio() != null) application.setBio(request.getBio());
        if (request.getHeadline() != null) application.setHeadline(request.getHeadline());
        if (request.getExperience() != null) application.setExperience(request.getExperience());
        if (request.getTeachingLevel() != null) application.setTeachingLevel(request.getTeachingLevel());
        if (request.getTeachingMethods() != null) application.setTeachingMethods(request.getTeachingMethods());
        if (request.getCvUrl() != null) application.setCvUrl(request.getCvUrl());
        if (request.getVideoIntro() != null) application.setVideoIntro(request.getVideoIntro());
    }

    private void updateApplicationFromRequest(ProfileApplication application, BecomeTutorDraftRequest request) {
        // Personal info
        if (request.getFirstName() != null) application.setFirstName(request.getFirstName());
        if (request.getLastName() != null) application.setLastName(request.getLastName());
        if (request.getAvatar() != null) application.setImageAvatar(request.getAvatar());
        if (request.getPhoneNumber() != null) application.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) application.setAddress(request.getAddress());
        if (request.getTimezone() != null) application.setTimezone(request.getTimezone());
        
        // Tutor-specific fields
        if (request.getBio() != null) application.setBio(request.getBio());
        if (request.getHeadline() != null) application.setHeadline(request.getHeadline());
        if (request.getExperience() != null) application.setExperience(request.getExperience());
        if (request.getTeachingLevel() != null) application.setTeachingLevel(request.getTeachingLevel());
        if (request.getTeachingMethods() != null) application.setTeachingMethods(request.getTeachingMethods());
        if (request.getCvUrl() != null) application.setCvUrl(request.getCvUrl());
        if (request.getVideoIntro() != null) application.setVideoIntro(request.getVideoIntro());
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
                education.setDegreeImage(edu.getDegreeImage());
                
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
                certificate.setCertImage(cert.getCertImage());
                certificate.setValid(true);
                
                certificateRepository.save(certificate);
            }
        }
    }

    private void saveApplicationSchedules(ProfileApplication application, List<BecomeTutorDraftRequest.ScheduleRequest> schedules) {
        // Clear existing schedules
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
        // Clear existing subject fees
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
            eduData.put("degreeImage", edu.getDegreeImage());
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
            certData.put("certImage", cert.getCertImage());
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
            feeData.put("fees", fee.getFees());
            result.add(feeData);
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
                education.setDegreeImage(edu.getDegreeImage());
                
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
                certificate.setCertImage(cert.getCertImage());
                certificate.setValid(true);
                
                certificateRepository.save(certificate);
            }
        }
    }

    private void saveApplicationSchedulesFromSubmit(ProfileApplication application, List<BecomeTutorRequest.ScheduleRequest> schedules) {
        // Clear existing schedules
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
        // Clear existing subject fees
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
}
