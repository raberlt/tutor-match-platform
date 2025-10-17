package fsa.training.tutormatch.controller.profile;

import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.enums.*;
import fsa.training.tutormatch.repository.*;
import fsa.training.tutormatch.service.TutorProfileDraftService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/tutor-applications")
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class TutorApplicationController {

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ApplicationSubjectFeeRepository applicationSubjectFeeRepository;
    
    @Autowired
    private ApplicationScheduleRepository applicationScheduleRepository;
    
    @Autowired
    private ApplicationCertificateRepository applicationCertificateRepository;
    
    @Autowired
    private ApplicationEducationRepository applicationEducationRepository;
    
    @Autowired
    private ApplicationTeachingAudienceRepository applicationTeachingAudienceRepository;
    
    @Autowired
    private ProfileApplicationRepository profileApplicationRepository;
    
    @Autowired
    private TutorProfileDraftService tutorProfileDraftService;

    /**
     * Lấy danh sách tất cả hồ sơ đăng ký tutor với phân trang và lọc
     */
    @GetMapping
    public ResponseEntity<?> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ?
                    Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);

            // Lấy tất cả applications
            List<ProfileApplication> allApplications = profileApplicationRepository.findAll();

            // Lọc danh sách applications
            String statusLower = status != null ? status.toLowerCase().trim() : null;
            String searchLower = search != null ? search.toLowerCase().trim() : null;

            List<ProfileApplication> applications = allApplications.stream()
                    .filter(app -> filterApplicationByStatus(app, statusLower))
                    .filter(app -> filterApplicationBySearch(app, searchLower))
                    .toList();

            // Thực hiện phân trang thủ công
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), applications.size());
            List<ProfileApplication> pageApplications = applications.subList(start, end);

            // Chuẩn bị dữ liệu trả về
            List<Map<String, Object>> applicationData = pageApplications.stream().map(app -> {
                Map<String, Object> appData = new HashMap<>();
                appData.put("id", app.getId());
                appData.put("status", app.getStatus().toString());
                appData.put("createdAt", app.getCreatedAt());
                appData.put("updatedAt", app.getUpdatedAt());
                appData.put("submittedAt", app.getSubmittedAt());

                User user = app.getUser();
                if (user != null) {
                    appData.put("userId", user.getId());
                    appData.put("firstName", user.getFirstName());
                    appData.put("lastName", user.getLastName());
                    appData.put("email", user.getEmail());
                    appData.put("phoneNumber", user.getPhoneNumber());
                    appData.put("address", user.getAddress());
                    appData.put("imageAvatar", user.getImageAvatar());
                    appData.put("userRole", user.getRole().toString());
                }

                appData.put("bio", app.getBio());
                appData.put("headline", app.getHeadline());
                appData.put("experience", app.getExperience());
                appData.put("cvFileUrl", app.getCvFileUrl());
                appData.put("cvFileName", app.getCvFileName());
                appData.put("videoIntro", app.getVideoIntro());

                appData.put("educations", getEducationsForApplication(app.getId()));
                appData.put("certificates", getCertificatesForApplication(app.getId()));
                appData.put("teachingAudiences", getTeachingAudiencesForApplication(app.getId()));
                appData.put("schedules", getSchedulesForApplication(app.getId()));
                appData.put("subjectFees", getSubjectFeesForApplication(app.getId()));

                return appData;
            }).toList();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applications", applicationData);
            response.put("currentPage", page);
            response.put("totalPages", (int) Math.ceil((double) applications.size() / size));
            response.put("totalElements", applications.size());
            response.put("pageSize", size);
            response.put("hasNext", end < applications.size());
            response.put("hasPrevious", start > 0);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi lấy danh sách hồ sơ: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private boolean filterByStatus(TutorProfile profile, String statusLower) {
        if (statusLower == null || statusLower.isEmpty()) return true;
        return profile.getEnable() != null &&
                (profile.getEnable() ? "enabled" : "disabled").equals(statusLower);
    }

    private boolean filterBySearch(TutorProfile profile, String searchLower) {
        if (searchLower == null || searchLower.isEmpty()) return true;

        User tutor = profile.getUser();
        if (tutor != null) {
            if (containsIgnoreCase(tutor.getFirstName(), searchLower) ||
                    containsIgnoreCase(tutor.getLastName(), searchLower) ||
                    containsIgnoreCase(tutor.getEmail(), searchLower) ||
                    containsIgnoreCase(tutor.getUsername(), searchLower)) {
                return true;
            }
        }

        return containsIgnoreCase(profile.getHeadline(), searchLower) ||
                containsIgnoreCase(profile.getBio(), searchLower);
                // containsIgnoreCase(profile.getUniversity(), searchLower) ||
                // containsIgnoreCase(profile.getMajor(), searchLower);
    }

    private boolean containsIgnoreCase(String field, String searchLower) {
        return field != null && field.toLowerCase().contains(searchLower);
    }

    /**
     * Lấy thông tin chi tiết của một hồ sơ Tutor
     */
    @GetMapping("/{profileId}")
    public ResponseEntity<?> getApplicationDetail(@PathVariable Integer profileId) {
        try {
            Optional<TutorProfile> profileOpt = tutorProfileRepository.findById(profileId);

            if (profileOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Không tìm thấy hồ sơ!"
                ));
            }

            TutorProfile profile = profileOpt.get();

            // Kiểm tra có phải hồ sơ tutor không
            if (!(profile instanceof TutorProfile tutor)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Đây không phải hồ sơ đăng ký tutor!"
                ));
            }

            // Trả về chi tiết hồ sơ tutor
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("application", buildDetailedProfileResponse(tutor));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Lỗi khi lấy chi tiết hồ sơ: " + e.getMessage()
            ));
        }
    }
    private Map<String, Object> buildDetailedProfileResponse(TutorProfile profile) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", profile.getId());
        data.put("status", profile.getEnable() ? "ENABLED" : "DISABLED");
        data.put("isVerified", profile.getUser().isVerified());
        data.put("createdAt", profile.getCreatedAt());
        data.put("updatedAt", profile.getUpdatedAt());

        // Thông tin tutor (user)
        User tutor = profile.getUser();
        if (tutor != null) {
            data.put("tutorId", tutor.getId());
            data.put("tutorName", tutor.getFirstName() + " " + tutor.getLastName());
            data.put("email", tutor.getEmail());
            data.put("username", tutor.getUsername());
        }

        // Thông tin profile
        data.put("headline", profile.getHeadline());
        data.put("bio", profile.getBio());
        data.put("experience", profile.getExperience());
        data.put("fees", profile.getFees());
        // data.put("university", profile.getUniversity());
        // data.put("major", profile.getMajor());
        // data.put("city", profile.getCity()); // city field removed
        data.put("videoIntro", profile.getVideoIntro());
        data.put("ratePointAverage", profile.getRatePointAverage());
        data.put("totalPoint", profile.getTotalPoint());

        return data;
    }


    /**
     * Duyệt hồ sơ
     */
    @PutMapping("/{profileId}/approve")
    public ResponseEntity<?> approveApplication(@PathVariable Integer profileId,
                                                @RequestBody(required = false) Map<String, String> requestBody,
                                                Authentication authentication) {
        try {
            Optional<TutorProfile> profileOpt = tutorProfileRepository.findById(profileId);

            if (profileOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Không tìm thấy hồ sơ!"
                ));
            }

            TutorProfile profile = profileOpt.get();

            // Chỉ chấp nhận duyệt nếu là TutorProfile
            if (!(profile instanceof TutorProfile tutor)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Đây không phải hồ sơ tutor!"
                ));
            }

            // Chỉ cho phép duyệt hồ sơ đang DISABLED
            if (Boolean.TRUE.equals(tutor.getEnable())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Chỉ có thể duyệt hồ sơ đang chờ xét duyệt!"
                ));
            }

            // Lấy admin hiện tại
            String adminUsername = authentication.getName();
            User admin = userRepository.findByUsername(adminUsername)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            // Cập nhật trạng thái profile
            tutor.setEnable(true);
            
            // Chuyển role của user từ STUDENT thành TUTOR và đồng bộ thông tin
            User tutorUser = tutor.getUser();
            if (tutorUser != null && tutorUser.getRole() == UserRole.STUDENT) {
                tutorUser.setRole(UserRole.TUTOR);
                tutorUser.setVerified(true);
                
                // Tìm ProfileApplication tương ứng để đồng bộ dữ liệu
                Optional<ProfileApplication> applicationOpt = profileApplicationRepository
                        .findLatestByUser(tutorUser);
                
                if (applicationOpt.isPresent()) {
                    ProfileApplication application = applicationOpt.get();
                    
                    // Đồng bộ dữ liệu từ ProfileApplication sang User và TutorProfile
                    tutorProfileDraftService.syncDataFromProfileApplication(application, tutorUser, tutor);
                    
                    // Cập nhật trạng thái application thành APPROVED
                    application.setStatus(ApplicationStatus.APPROVED);
                    application.setReviewedAt(java.time.ZonedDateTime.now());
                    application.setReviewedBy(admin);
                    profileApplicationRepository.save(application);
                }
                
                userRepository.save(tutorUser);
            }

            tutorProfileRepository.save(tutor);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã duyệt hồ sơ thành công! User đã được chuyển thành TUTOR.",
                    "profileId", profileId,
                    "newStatus", "ENABLED",
                    "userRole", tutorUser != null ? tutorUser.getRole().toString() : null
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Lỗi khi duyệt hồ sơ: " + e.getMessage()
            ));
        }
    }

    /**
     * Từ chối hồ sơ
     */
    @PutMapping("/{profileId}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable Integer profileId,
                                               @RequestBody Map<String, String> requestBody,
                                               Authentication authentication) {
        try {
            Optional<TutorProfile> profileOpt = tutorProfileRepository.findById(profileId);

            if (profileOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Không tìm thấy hồ sơ!"
                ));
            }

            TutorProfile profile = profileOpt.get();

            // Chỉ chấp nhận từ chối nếu là TutorProfile
            if (!(profile instanceof TutorProfile tutor)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Đây không phải hồ sơ tutor!"
                ));
            }

            // Chỉ cho phép từ chối hồ sơ đang INACTIVE
            if (Boolean.TRUE.equals(tutor.getEnable())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Chỉ có thể từ chối hồ sơ đang chờ xét duyệt!"
                ));
            }

            // Lấy admin hiện tại
            String adminUsername = authentication.getName();
            User admin = userRepository.findByUsername(adminUsername)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            // Lý do từ chối (bắt buộc)
            String rejectReason = requestBody.get("adminNote");
            if (rejectReason == null || rejectReason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Vui lòng nhập lý do từ chối!"
                ));
            }

            // Cập nhật trạng thái
            tutor.setEnable(false);
            // isVerified giờ ở User entity
            tutor.getUser().setVerified(false);

            // Đảm bảo user vẫn là STUDENT khi bị từ chối
            User tutorUser = tutor.getUser();
            if (tutorUser != null && tutorUser.getRole() == UserRole.TUTOR) {
                tutorUser.setRole(UserRole.STUDENT);
                userRepository.save(tutorUser);
            }

            tutorProfileRepository.save(tutor);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã từ chối hồ sơ!",
                    "profileId", profileId,
                    "newStatus", "INACTIVE",
                    "rejectReason", rejectReason
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Lỗi khi từ chối hồ sơ: " + e.getMessage()
            ));
        }
    }

    /**
     * Tạm khóa hồ sơ tutor
     */
    @PutMapping("/{profileId}/suspend")
    public ResponseEntity<?> suspendApplication(@PathVariable Integer profileId,
                                                @RequestBody Map<String, String> requestBody,
                                                Authentication authentication) {
        try {
            Optional<TutorProfile> profileOpt = tutorProfileRepository.findById(profileId);

            if (profileOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Không tìm thấy hồ sơ!"
                ));
            }

            TutorProfile profile = profileOpt.get();

            // Chỉ áp dụng cho TutorProfile
            if (!(profile instanceof TutorProfile tutor)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Đây không phải hồ sơ tutor!"
                ));
            }

            // Chỉ có thể suspend hồ sơ ACTIVE
            if (!Boolean.TRUE.equals(tutor.getEnable())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Chỉ có thể tạm khóa hồ sơ đang hoạt động!"
                ));
            }

            // Lấy admin hiện tại
            String adminUsername = authentication.getName();
            User admin = userRepository.findByUsername(adminUsername)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            // Lý do tạm khóa (bắt buộc)
            String suspendReason = requestBody.get("adminNote");
            if (suspendReason == null || suspendReason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Vui lòng nhập lý do tạm khóa!"
                ));
            }

            // Cập nhật trạng thái hồ sơ
            tutor.setEnable(false);
            // isVerified giờ ở User entity
            tutor.getUser().setVerified(false);

            // Chuyển role user về STUDENT khi bị suspend
            User tutorUser = tutor.getUser();
            if (tutorUser != null && tutorUser.getRole() == UserRole.TUTOR) {
                tutorUser.setRole(UserRole.STUDENT);
                userRepository.save(tutorUser);
            }

            tutorProfileRepository.save(tutor);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã tạm khóa hồ sơ!",
                    "profileId", profileId,
                    "newStatus", "INACTIVE",
                    "suspendReason", suspendReason
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Lỗi khi tạm khóa hồ sơ: " + e.getMessage()
            ));
        }
    }

    /**
     * Kích hoạt lại hồ sơ tutor (từ trạng thái INACTIVE → ACTIVE)
     */
    @PutMapping("/{profileId}/reactivate")
    public ResponseEntity<?> reactivateApplication(@PathVariable Integer profileId,
                                                   @RequestBody(required = false) Map<String, String> requestBody,
                                                   Authentication authentication) {
        try {
            Optional<TutorProfile> profileOpt = tutorProfileRepository.findById(profileId);

            if (profileOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Không tìm thấy hồ sơ!"
                ));
            }

            TutorProfile profile = profileOpt.get();

            // Chỉ áp dụng cho TutorProfile
            if (!(profile instanceof TutorProfile tutor)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Đây không phải hồ sơ tutor!"
                ));
            }

            // Chỉ có thể kích hoạt hồ sơ đang bị inactive
            if (Boolean.TRUE.equals(tutor.getEnable())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Chỉ có thể kích hoạt hồ sơ đang bị tạm khóa!"
                ));
            }

            // Lấy admin hiện tại
            String adminUsername = authentication.getName();
            User admin = userRepository.findByUsername(adminUsername)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            // Cập nhật trạng thái hồ sơ
            tutor.setEnable(true);
            // isVerified giờ ở User entity
            tutor.getUser().setVerified(true);

            // Ghi chú admin (nếu có)
            if (requestBody != null && requestBody.containsKey("adminNote")) {
            }

            // Chuyển role user về TUTOR khi được re-activate
            User tutorUser = tutor.getUser();
            if (tutorUser != null && tutorUser.getRole() == UserRole.STUDENT) {
                tutorUser.setRole(UserRole.TUTOR);
                userRepository.save(tutorUser);
            }

            tutorProfileRepository.save(tutor);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã kích hoạt lại hồ sơ!",
                    "profileId", profileId,
                    "newStatus", "ACTIVE",
                    "userRole", tutorUser != null ? tutorUser.getRole().toString() : null
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Lỗi khi kích hoạt hồ sơ: " + e.getMessage()
            ));
        }
    }

    /**
     * Xóa hồ sơ tutor (xóa vĩnh viễn)
     */
    @DeleteMapping("/{profileId}")
    @Transactional
    public ResponseEntity<?> deleteApplication(@PathVariable Integer profileId,
                                               @RequestBody Map<String, String> requestBody,
                                               Authentication authentication) {
        try {
            Optional<TutorProfile> profileOpt = tutorProfileRepository.findById(profileId);

            if (!profileOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Không tìm thấy hồ sơ!");
                return ResponseEntity.badRequest().body(response);
            }

            TutorProfile profile = profileOpt.get();

            // Xác nhận lý do xóa
            String deleteReason = requestBody.get("deleteReason");
            if (deleteReason == null || deleteReason.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Vui lòng nhập lý do xóa hồ sơ!");
                return ResponseEntity.badRequest().body(response);
            }

            // Kiểm tra loại hồ sơ có phải tutor không
            if (profile instanceof TutorProfile tutor) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Đây không phải hồ sơ đăng ký tutor!");
                return ResponseEntity.badRequest().body(response);
            }

            // Vì đã dùng CascadeType.ALL nên chỉ cần xóa BaseProfile
            tutorProfileRepository.delete(profile);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xóa hồ sơ vĩnh viễn!");
            response.put("profileId", profileId);
            response.put("deleteReason", deleteReason);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi xóa hồ sơ: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Cập nhật ghi chú admin cho hồ sơ
     */
    @PutMapping("/{profileId}/note")
    public ResponseEntity<?> updateAdminNote(@PathVariable Integer profileId,
                                             @RequestBody Map<String, String> requestBody,
                                             Authentication authentication) {
        try {
            Optional<TutorProfile> profileOpt = tutorProfileRepository.findById(profileId);

            if (!profileOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Không tìm thấy hồ sơ!");
                return ResponseEntity.badRequest().body(response);
            }

            TutorProfile profile = profileOpt.get();

            String adminNote = requestBody.get("adminNote");
            if (adminNote == null) {
                adminNote = "";
            }

            // Lấy admin hiện tại
            String adminUsername = authentication.getName();
            User admin = userRepository.findByUsername(adminUsername)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            // Cập nhật ghi chú - adminNote đã bị xóa khỏi TutorProfile
            // Không cần setApprovedBy và setApprovedAt nữa

            tutorProfileRepository.save(profile);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cập nhật ghi chú!");
            response.put("profileId", profileId);
            response.put("adminNote", adminNote);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi cập nhật ghi chú: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Xác thực bằng cấp/chứng chỉ
     */
    @PutMapping("/{profileId}/verify-credentials")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')") //  chỉ Admin mới được verify
    public ResponseEntity<?> verifyCredentials(@PathVariable Integer profileId,
                                               @RequestBody Map<String, Object> requestBody,
                                               Authentication authentication) {
        try {
            Optional<TutorProfile> profileOpt = tutorProfileRepository.findById(profileId);

            if (profileOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Không tìm thấy hồ sơ!");
                return ResponseEntity.badRequest().body(response);
            }

            TutorProfile profile = profileOpt.get();

            //  Xác thực danh sách Education
            if (requestBody.containsKey("educationIds")) {
                @SuppressWarnings("unchecked")
                List<Integer> educationIds = (List<Integer>) requestBody.get("educationIds");
                for (Integer eduId : educationIds) {
                    applicationEducationRepository.findById(eduId.longValue()).ifPresent(edu -> {
                        if (edu.getApplication().getId().equals(profileId)) {
                            edu.setVerified(true);
                            applicationEducationRepository.save(edu);
                        }
                    });
                }
            }

            //  Xác thực danh sách Certificate
            if (requestBody.containsKey("certificateIds")) {
                @SuppressWarnings("unchecked")
                List<Integer> certificateIds = (List<Integer>) requestBody.get("certificateIds");
                for (Integer certId : certificateIds) {
                    applicationCertificateRepository.findById(certId.longValue()).ifPresent(cert -> {
                        if (cert.getApplication().getId().equals(profileId)) {
                            cert.setVerified(true);
                            applicationCertificateRepository.save(cert);
                        }
                    });
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xác thực bằng cấp/chứng chỉ!");
            response.put("profileId", profileId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi xác thực: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }


    /**
     * Lấy thống kê hồ sơ
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getApplicationStatistics() {
        try {
            List<TutorProfile> allProfiles = tutorProfileRepository.findAll();

            int totalApplications = 0;
            int pendingCount = 0;
            int approvedCount = 0;
            int rejectedCount = 0;
            int suspendedCount = 0;

            for (TutorProfile profile : allProfiles) {
                if (profile instanceof TutorProfile) {
                    totalApplications++;

                    if (Boolean.TRUE.equals(profile.getEnable())) {
                        approvedCount++;
                    } else {
                        rejectedCount++; // Đếm DISABLED như REJECTED cho thống kê
                    }
                }
            }

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("total", totalApplications);
            statistics.put("pending", pendingCount);
            statistics.put("approved", approvedCount);
            statistics.put("rejected", rejectedCount);
            statistics.put("suspended", suspendedCount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi lấy thống kê: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }


    /**
     * API lấy danh sách draft đang chờ duyệt (hệ thống mới)
     * GET /api/admin/tutor-applications/pending-drafts
     */
    @GetMapping("/pending-drafts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPendingDrafts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            // Sử dụng repository mới để lấy pending drafts
            List<TutorProfile> pendingDrafts = tutorProfileRepository.findAllPendingApplications();
            
            // Chuẩn bị dữ liệu trả về
            List<Map<String, Object>> applications = pendingDrafts.stream().map(profile -> {
                Map<String, Object> appData = new HashMap<>();
                appData.put("id", profile.getId());
                appData.put("status", profile.getEnable() ? "ENABLED" : "DISABLED");
                appData.put("isVerified", profile.isVerified());
                appData.put("createdAt", profile.getCreatedAt());
                appData.put("updatedAt", profile.getUpdatedAt());

                // Thông tin user
                User user = profile.getUser();
                appData.put("userId", user.getId());
                appData.put("username", user.getUsername());
                appData.put("email", user.getEmail());
                appData.put("firstName", user.getFirstName());
                appData.put("lastName", user.getLastName());
                appData.put("role", user.getRole());
                
                // Thông tin profile
                appData.put("bio", profile.getBio());
                appData.put("headline", profile.getHeadline());
                appData.put("experience", profile.getExperience());
                appData.put("cvFileUrl", profile.getCvFileUrl());
                
                return appData;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", applications,
                "totalElements", pendingDrafts.size(),
                "currentPage", page,
                "pageSize", size,
                "message", "Danh sách hồ sơ đang chờ duyệt (hệ thống mới)"
            ));
            
        } catch (Exception e) {
            log.error("Error getting pending drafts: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    // Helper methods for ProfileApplication
    private boolean filterApplicationByStatus(ProfileApplication app, String status) {
        if (status == null || status.isEmpty()) return true;
        return app.getStatus().toString().toLowerCase().contains(status);
    }

    private boolean filterApplicationBySearch(ProfileApplication app, String search) {
        if (search == null || search.isEmpty()) return true;
        String searchLower = search.toLowerCase();
        User user = app.getUser();
        if (user != null) {
            return (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(searchLower)) ||
                   (user.getLastName() != null && user.getLastName().toLowerCase().contains(searchLower)) ||
                   (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchLower));
        }
        return false;
    }

    private List<Map<String, Object>> getEducationsForApplication(Long applicationId) {
        // Find ProfileApplication first, then get educations
        ProfileApplication application = profileApplicationRepository.findById(applicationId).orElse(null);
        if (application == null) return List.of();
        
        List<ApplicationEducation> educations = applicationEducationRepository.findByApplicationOrderByFromTimeDesc(application);
        return educations.stream().map(edu -> {
            Map<String, Object> eduData = new HashMap<>();
            eduData.put("id", edu.getId());
            eduData.put("schoolName", edu.getSchoolName());
            eduData.put("degree", edu.getDegree());
            eduData.put("major", edu.getMajor());
            eduData.put("fromTime", edu.getFromTime());
            eduData.put("toTime", edu.getToTime());
            eduData.put("degreeFileName", edu.getDegreeFileName());
            eduData.put("degreeFileUrl", edu.getDegreeFileUrl());
            eduData.put("verified", edu.isVerified());
            return eduData;
        }).toList();
    }

    private List<Map<String, Object>> getCertificatesForApplication(Long applicationId) {
        // Find ProfileApplication first, then get certificates
        ProfileApplication application = profileApplicationRepository.findById(applicationId).orElse(null);
        if (application == null) return List.of();
        
        List<ApplicationCertificate> certificates = applicationCertificateRepository.findByApplication(application);
        return certificates.stream().map(cert -> {
            Map<String, Object> certData = new HashMap<>();
            certData.put("id", cert.getId());
            certData.put("name", cert.getName());
            certData.put("description", cert.getDescription());
            certData.put("issuedBy", cert.getIssuedBy());
            certData.put("certFileName", cert.getCertFileName());
            certData.put("certFileUrl", cert.getCertFileUrl());
            certData.put("verified", cert.isVerified());
            return certData;
        }).toList();
    }

    private List<Map<String, Object>> getTeachingAudiencesForApplication(Long applicationId) {
        // Find ProfileApplication first, then get teachingAudiences
        ProfileApplication application = profileApplicationRepository.findById(applicationId).orElse(null);
        if (application == null) return List.of();
        
        List<ApplicationTeachingAudience> audiences = applicationTeachingAudienceRepository.findByApplication(application);
        return audiences.stream().map(aud -> {
            Map<String, Object> audData = new HashMap<>();
            audData.put("id", aud.getId());
            audData.put("name", aud.getTeachingAudience().getName());
            return audData;
        }).toList();
    }

    private List<Map<String, Object>> getSchedulesForApplication(Long applicationId) {
        List<ApplicationSchedule> schedules = applicationScheduleRepository.findByApplicationId(applicationId);
        return schedules.stream().map(sched -> {
            Map<String, Object> schedData = new HashMap<>();
            schedData.put("id", sched.getId());
            schedData.put("dayOfWeek", sched.getDayOfWeek());
            schedData.put("fromTime", sched.getFromTime());
            schedData.put("toTime", sched.getToTime());
            schedData.put("enable", sched.getEnable()); // Use getEnable() instead of isEnable()
            return schedData;
        }).toList();
    }

    private List<Map<String, Object>> getSubjectFeesForApplication(Long applicationId) {
        List<ApplicationSubjectFee> subjectFees = applicationSubjectFeeRepository.findByApplicationId(applicationId);
        return subjectFees.stream().map(fee -> {
            Map<String, Object> feeData = new HashMap<>();
            feeData.put("id", fee.getId());
            feeData.put("subjectId", fee.getSubject().getId());
            feeData.put("subjectName", fee.getSubject().getName());
            feeData.put("fees", fee.getFees());
            return feeData;
        }).toList();
    }

} 