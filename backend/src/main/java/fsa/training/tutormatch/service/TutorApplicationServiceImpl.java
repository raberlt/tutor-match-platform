package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.BecomeTutorRequest;
import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.enums.*;
import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.repository.*;
import fsa.training.tutormatch.service.interfaces.ITutorApplicationService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TutorApplicationServiceImpl implements ITutorApplicationService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private ProfileSubjectRepository profileSubjectRepository;
    
    @Autowired
    private ScheduleRepository scheduleRepository;
    
    @Autowired
    private CertificateRepository certificateRepository;
    
    @Autowired
    private EducationRepository educationRepository;

    @Override
    public List<Subject> getAllAvailableSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    public Map<String, Object> getApplicationStatus(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        User user = userOpt.get();

        Map<String, Object> response = new HashMap<>();
        
        // Dựa trên TutorProfile thay vì Profile đơn lẻ
        java.util.Optional<TutorProfile> tp = user.getTutorProfile();
        if (tp.isPresent()) {
            Profile profile = tp.get();
            response.put("hasApplication", true);
            response.put("status", profile.getProfileStatus().toString());
            response.put("profileType", profile.getClass().getSimpleName());
            // isVerified giờ ở User entity
            response.put("isVerified", profile.getUser().isVerified());
            if (profile.getProfileStatus() == ProfileStatus.INACTIVE) {
                response.put("adminNote", ((TutorProfile) profile).getAdminNote());
            }
        } else {
            response.put("hasApplication", false);
            response.put("status", null);
        }
        
        return response;
    }

    @Override
    public Map<String, Object> getApplicationDetails(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        User user = userOpt.get();

        java.util.Optional<TutorProfile> tp = user.getTutorProfile();
        if (tp.isEmpty()) {
            throw new IllegalArgumentException("No application found");
        }

        Profile profile = tp.get();
        Map<String, Object> response = new HashMap<>();
        
        // Basic profile info
        response.put("id", profile.getId());
        // response.put("city", profile.getCity()); // city field removed
        response.put("profileStatus", profile.getProfileStatus().toString());
        response.put("isVerified", profile.getUser().isVerified());
        response.put("adminNote", ((TutorProfile) profile).getAdminNote());
        
        // Personal details
        response.put("dateOfBirth", profile.getUser().getDateOfBirth());
        response.put("gender", profile.getUser().getGender());
        response.put("phoneNumber", profile.getUser().getPhoneNumber());
        response.put("addressLine1", profile.getUser().getAddress());
        // Removed fields: educationLevel, university, major
        
        // Tutor-specific info if available
        if (profile instanceof TutorProfile) {
            TutorProfile tutorProfile = (TutorProfile) profile;
            response.put("bio", tutorProfile.getBio());
            response.put("headline", tutorProfile.getHeadline());
            response.put("experience", tutorProfile.getExperience());
            response.put("fees", tutorProfile.getFees());
            response.put("teachingLevel", tutorProfile.getTeachingLevel());
        }
        
        // Related entities - TODO: Fix when Lombok is working properly
        // response.put("subjects", convertSubjectsToMap(profile.getProfileSubjects()));
        // response.put("schedules", convertSchedulesToMap(profile.getSchedules()));
        response.put("educations", convertEducationsToMap(educationRepository.findByProfileId(profile.getId())));
        response.put("certificates", convertCertificatesToMap(certificateRepository.findByProfileId(profile.getId())));
        
        return response;
    }

    @Override
    @Transactional
    public Profile submitTutorApplication(String studentUsername, BecomeTutorRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(studentUsername);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        User user = userOpt.get();

        TutorProfile profile;

        // Tìm TutorProfile hiện có (không đụng tới StudentProfile)
        java.util.Optional<TutorProfile> existingTutorProfile = user.getTutorProfile();
        if (existingTutorProfile.isPresent()) {
            profile = existingTutorProfile.get();
            updateProfileFromRequest(profile, request);
        } else {
            // Tạo TutorProfile mới, giữ nguyên StudentProfile nếu có
            profile = createProfileFromRequest(user, request);
        }
        
        profile = profileRepository.save(profile);
        // Không set user.setProfile(...) nữa vì giờ user có nhiều profiles
        userRepository.save(user);

        // Clear existing related data và save mới
        clearExistingRelatedData(profile);
        saveProfileSubjects(profile, request.getSubjectFees());
        saveSchedules(profile, request.getSchedules());

        return profile;
    }

    @Override
    @Transactional
    public Profile updateTutorApplication(String username, BecomeTutorRequest request) {
        return submitTutorApplication(username, request); // Same logic for now
    }


    @Override
    @PreAuthorize("hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_TUTOR')")
    @Transactional
    public boolean cancelTutorApplication(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }
        User user = userOpt.get();

        // Không xóa toàn bộ profile nữa. Chỉ xóa dữ liệu liên quan của TutorProfile nếu tồn tại
        java.util.Optional<TutorProfile> tutorProfileOpt = user.getTutorProfile();
        if (tutorProfileOpt.isPresent()) {
            Profile profile = tutorProfileOpt.get();
            clearExistingRelatedData(profile);
            profileRepository.delete(profile);
            profileRepository.flush();
            return true;
        }
        
        return false;
    }

    @Override
    public boolean hasExistingApplication(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }
        // Có application nếu đã có TutorProfile
        return userOpt.get().getTutorProfile().isPresent();
    }

    @Override
    public boolean canSubmitApplication(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }
        User user = userOpt.get();
        // Có thể submit nếu chưa có TutorProfile, hoặc TutorProfile trước đó bị INACTIVE
        return user.getTutorProfile().map(p -> p.getProfileStatus() == ProfileStatus.INACTIVE).orElse(true);
    }

    // Private helper methods
    private TutorProfile createProfileFromRequest(User user, BecomeTutorRequest request) {
        TutorProfile profile = new TutorProfile();
        profile.setUser(user);
        profile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
        // isVerified giờ ở User entity
        user.setVerified(false);

        // Basic info
        if (request.getBio() != null) profile.setBio(request.getBio().trim());
        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline().trim());
        if (request.getExperience() != null) profile.setExperience(request.getExperience().trim());
        if (request.getTeachingLevel() != null) profile.setTeachingLevel(request.getTeachingLevel().getDisplayName());

        // Personal details
        if (request.getFirstName() != null) profile.getUser().setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) profile.getUser().setLastName(request.getLastName().trim());
        profile.getUser().setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) {
            profile.getUser().setGender(Gender.valueOf(request.getGender()));
        }
        if (request.getPhoneNumber() != null) profile.getUser().setPhoneNumber(request.getPhoneNumber().trim());
        if (request.getAddress() != null) profile.getUser().setAddress(request.getAddress().trim());
        if (request.getTimezone() != null) profile.getUser().setTimezone(request.getTimezone().trim());
        if (request.getAvatar() != null) profile.getUser().setImageAvatar(request.getAvatar().trim());
        if (request.getCvUrl() != null) profile.setCvUrl(request.getCvUrl().trim());

        return profile;
    }


    private void deleteExistingProfileData(Profile profile) {
        // Delete related entities first (foreign key constraints)
        profileSubjectRepository.deleteByProfileId(profile.getId());
        scheduleRepository.deleteByProfileId(profile.getId()); //  Uncomment này
        educationRepository.deleteByProfileId(profile.getId());
        certificateRepository.deleteByProfileId(profile.getId());
        
        //  Delete profile - Fix repository issue
        profileRepository.delete(profile);
        profileRepository.flush();
        
        //  Không còn set user.profile = null vì user có thể có nhiều profiles
        userRepository.save(profile.getUser());
    }

    //  Method delete hoàn toàn và flush session
    private void deleteExistingProfileDataCompletely(Profile profile) {
        // Delete related entities first
        profileSubjectRepository.deleteByProfileId(profile.getId());
        scheduleRepository.deleteByProfileId(profile.getId());
        educationRepository.deleteByProfileId(profile.getId());
        certificateRepository.deleteByProfileId(profile.getId());
        
        // Không còn set user.profile = null vì user có thể có nhiều profiles
        userRepository.saveAndFlush(profile.getUser());
        
        // Delete profile
        profileRepository.delete(profile);
        profileRepository.flush();
    }

    private void saveProfileSubjects(Profile profile, List<BecomeTutorRequest.SubjectFeeRequest> subjectFees) {
        if (subjectFees != null && !subjectFees.isEmpty()) {
            for (BecomeTutorRequest.SubjectFeeRequest subjectFee : subjectFees) {
                subjectRepository.findById(subjectFee.getSubjectId()).ifPresent(subject -> {
                    TutorProfileSubject ps = new TutorProfileSubject();
                    ps.setProfile(profile);
                    ps.setSubject(subject);
                    ps.setFees(subjectFee.getFees()); // Set fees cho từng môn
                    profileSubjectRepository.save(ps);
                });
            }
        }
    }

    private void saveSchedules(Profile profile, List<BecomeTutorRequest.ScheduleRequest> scheduleRequests) {
        if (scheduleRequests != null && !scheduleRequests.isEmpty()) {
            for (BecomeTutorRequest.ScheduleRequest scheduleReq : scheduleRequests) {
                Schedule schedule = new Schedule();
                schedule.setProfile(profile); // giờ là BaseProfile
                schedule.setDayOfWeek(scheduleReq.getDayOfWeek());

                // Convert String -> java.time.LocalTime
                schedule.setFromTime(java.time.LocalTime.parse(scheduleReq.getFromTime()));
                schedule.setToTime(java.time.LocalTime.parse(scheduleReq.getToTime()));

                scheduleRepository.save(schedule);
            }
        }
    }


    // Conversion helpers - simplified for now
    private List<Map<String, Object>> convertSubjectsToMap(List<TutorProfileSubject> profileSubjects) {
        if (profileSubjects == null) return new ArrayList<>();
        
        return profileSubjects.stream().map(ps -> {
            Map<String, Object> subjectData = new HashMap<>();
            subjectData.put("id", ps.getSubject().getId());
            subjectData.put("name", ps.getSubject().getName());
            return subjectData;
        }).toList();
    }

    private List<Map<String, Object>> convertSchedulesToMap(List<Schedule> schedules) {
        if (schedules == null) return new ArrayList<>();
        
        return schedules.stream().map(schedule -> {
            Map<String, Object> scheduleData = new HashMap<>();
            scheduleData.put("id", schedule.getId());
            scheduleData.put("dayOfWeek", schedule.getDayOfWeek());
            scheduleData.put("fromTime", schedule.getFromTime().toString());
            scheduleData.put("toTime", schedule.getToTime().toString());
            return scheduleData;
        }).toList();
    }

    private List<Map<String, Object>> convertEducationsToMap(List<Education> educations) {
        if (educations == null) return new ArrayList<>();
        
        return educations.stream().map(education -> {
            Map<String, Object> eduData = new HashMap<>();
            eduData.put("id", education.getId());
            eduData.put("schoolName", education.getSchoolName());
            eduData.put("degree", education.getDegree());
            eduData.put("major", education.getMajor());
            // eduData.put("graduationYear", education.getGraduationYear()); // TODO: Add field
            return eduData;
        }).toList();
    }

    private List<Map<String, Object>> convertCertificatesToMap(List<Certificate> certificates) {
        if (certificates == null) return new ArrayList<>();
        
        return certificates.stream().map(certificate -> {
            Map<String, Object> certData = new HashMap<>();
            certData.put("id", certificate.getId());
            certData.put("name", certificate.getName());
            // certData.put("issuingOrganization", certificate.getIssuingOrganization()); // TODO: Add field
            // certData.put("issueDate", certificate.getIssueDate()); // TODO: Add field
            // certData.put("expiryDate", certificate.getExpiryDate()); // TODO: Add field
            return certData;
        }).toList();
    }

    private void clearExistingRelatedData(Profile profile) {
        profileSubjectRepository.deleteByProfileId(profile.getId());
        scheduleRepository.deleteByProfileId(profile.getId());
        educationRepository.deleteByProfileId(profile.getId());
        certificateRepository.deleteByProfileId(profile.getId());
    }

    private void updateProfileFromRequest(TutorProfile profile, BecomeTutorRequest request) {
        // Update all fields từ request
        if (request.getBio() != null) profile.setBio(request.getBio().trim());
        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline().trim());
        if (request.getExperience() != null) profile.setExperience(request.getExperience().trim());
        if (request.getTeachingLevel() != null) profile.setTeachingLevel(request.getTeachingLevel().getDisplayName());

        // Update personal details
        if (request.getFirstName() != null) profile.getUser().setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) profile.getUser().setLastName(request.getLastName().trim());
        profile.getUser().setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) {
            profile.getUser().setGender(Gender.valueOf(request.getGender()));
        }
        if (request.getPhoneNumber() != null) profile.getUser().setPhoneNumber(request.getPhoneNumber().trim());
        if (request.getAddress() != null) profile.getUser().setAddress(request.getAddress().trim());
        if (request.getTimezone() != null) profile.getUser().setTimezone(request.getTimezone().trim());
        if (request.getAvatar() != null) profile.getUser().setImageAvatar(request.getAvatar().trim());
        if (request.getCvUrl() != null) profile.setCvUrl(request.getCvUrl().trim());
        
        // Reset status về PENDING_VERIFICATION
        profile.setProfileStatus(ProfileStatus.PENDING_VERIFICATION);
    }

    //  Xóa method convertToTutorProfile (không dùng nữa)
} 