package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.entity.Schedule;
import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.repository.ScheduleRepository;
import fsa.training.tutormatch.repository.ProfileRepository;
import java.time.LocalTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/schedules")
@PreAuthorize("hasRole('ADMIN')")
public class AdminScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private ProfileRepository profileRepository;

    /**
     * Lấy danh sách tất cả schedules với phân trang và lọc
     */
    @GetMapping
    public ResponseEntity<?> getAllSchedules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Integer tutorId,
            @RequestParam(required = false) String dayOfWeek,
            @RequestParam(required = false) String date) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<Schedule> schedulePage;
            
            // Simplified - just get all schedules for now
            schedulePage = scheduleRepository.findAll(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("schedules", schedulePage.getContent());
            response.put("totalElements", schedulePage.getTotalElements());
            response.put("totalPages", schedulePage.getTotalPages());
            response.put("currentPage", page);
            response.put("size", size);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy danh sách schedules: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thông tin chi tiết schedule
     */
    @GetMapping("/{scheduleId}")
    public ResponseEntity<?> getScheduleById(@PathVariable Integer scheduleId) {
        try {
            Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleId);
            
            if (scheduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(scheduleOpt.get());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy thông tin schedule: " + e.getMessage())
            );
        }
    }

    /**
     * Tạo schedule mới
     */
    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody Map<String, Object> scheduleData) {
        try {
            Schedule schedule = new Schedule();
            
            Integer profileId = (Integer) scheduleData.get("profileId");
            Optional<Profile> profileOpt = profileRepository.findById(profileId);
            
            if (profileOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Profile không tồn tại")
                );
            }
            
            schedule.setProfile(profileOpt.get());
            schedule.setDayOfWeek((String) scheduleData.get("dayOfWeek"));
            schedule.setFromTime(LocalTime.parse((String) scheduleData.get("fromTime")));
            schedule.setToTime(LocalTime.parse((String) scheduleData.get("toTime")));
            schedule.setEnable(true);

            Schedule savedSchedule = scheduleRepository.save(schedule);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tạo schedule thành công",
                "schedule", savedSchedule
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Lỗi khi tạo schedule: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật schedule
     */
    @PutMapping("/{scheduleId}")
    public ResponseEntity<?> updateSchedule(
            @PathVariable Integer scheduleId,
            @RequestBody Map<String, Object> updateData) {
        try {
            Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleId);
            
            if (scheduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Schedule schedule = scheduleOpt.get();
            
            // Cập nhật các field được phép
            if (updateData.containsKey("dayOfWeek")) {
                schedule.setDayOfWeek((String) updateData.get("dayOfWeek"));
            }
            if (updateData.containsKey("fromTime")) {
                schedule.setFromTime(LocalTime.parse((String) updateData.get("fromTime")));
            }
            if (updateData.containsKey("toTime")) {
                schedule.setToTime(LocalTime.parse((String) updateData.get("toTime")));
            }
            if (updateData.containsKey("enable")) {
                schedule.setEnable((Boolean) updateData.get("enable"));
            }

            Schedule updatedSchedule = scheduleRepository.save(schedule);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật schedule thành công",
                "schedule", updatedSchedule
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi cập nhật schedule: " + e.getMessage())
            );
        }
    }

    /**
     * Xóa schedule
     */
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Integer scheduleId) {
        try {
            Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleId);
            
            if (scheduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            scheduleRepository.deleteById(scheduleId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Xóa schedule thành công"
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi xóa schedule: " + e.getMessage())
            );
        }
    }

    /**
     * Kích hoạt/vô hiệu hóa schedule
     */
    @PutMapping("/{scheduleId}/toggle-availability")
    public ResponseEntity<?> toggleScheduleAvailability(@PathVariable Integer scheduleId) {
        try {
            Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleId);
            
            if (scheduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Schedule schedule = scheduleOpt.get();
            schedule.setEnable(!schedule.getEnable());
            scheduleRepository.save(schedule);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật trạng thái schedule thành công",
                "enable", schedule.getEnable()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi cập nhật trạng thái schedule: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy schedules theo tutor
     */
    @GetMapping("/profile/{profileId}")
    public ResponseEntity<?> getSchedulesByProfile(@PathVariable Integer profileId) {
        try {
            var schedules = scheduleRepository.findByProfileId(profileId);

            return ResponseEntity.ok(Map.of(
                "schedules", schedules,
                "profileId", profileId
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy schedules của tutor: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thống kê schedules
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getScheduleStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            stats.put("totalSchedules", scheduleRepository.count());
            // Note: These methods may not exist in repository, simplified for now
            // stats.put("availableSchedules", scheduleRepository.countByEnable(true));
            // stats.put("unavailableSchedules", scheduleRepository.countByEnable(false));

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy thống kê schedules: " + e.getMessage())
            );
        }
    }
}
