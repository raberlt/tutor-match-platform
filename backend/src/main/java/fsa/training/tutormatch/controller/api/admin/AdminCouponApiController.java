package fsa.training.tutormatch.controller.api.admin;

import fsa.training.tutormatch.dto.CouponDTO;
import fsa.training.tutormatch.entity.Coupon;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.CouponRepository;
import fsa.training.tutormatch.service.interfaces.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/coupons")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCouponApiController {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private IUserService userService;

    /**
     * Lấy danh sách tất cả coupons với pagination và filter
     */
    @GetMapping
    public ResponseEntity<?> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String discountType,
            @RequestParam(required = false) String applicableBookingType) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<Coupon> couponPage;
            
            // Apply filters
            if (status != null && !status.trim().isEmpty()) {
                try {
                    Coupon.CouponStatus couponStatus = Coupon.CouponStatus.valueOf(status.toUpperCase());
                    couponPage = couponRepository.findByStatus(couponStatus, pageable);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "Status không hợp lệ: " + status)
                    );
                }
            } else if (applicableBookingType != null && !applicableBookingType.trim().isEmpty()) {
                try {
                    Coupon.ApplicableBookingType bookingType = Coupon.ApplicableBookingType.valueOf(applicableBookingType.toUpperCase());
                    couponPage = couponRepository.findByApplicableBookingType(bookingType, pageable);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "Booking type không hợp lệ: " + applicableBookingType)
                    );
                }
            } else {
                couponPage = couponRepository.findAll(pageable);
            }

            // Convert to DTOs
            List<CouponDTO> couponDTOs = couponPage.getContent().stream()
                .map(this::convertCouponToDTO)
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("coupons", couponDTOs);
            response.put("totalElements", couponPage.getTotalElements());
            response.put("totalPages", couponPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy danh sách coupons: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy chi tiết coupon theo ID
     */
    @GetMapping("/{couponId}")
    public ResponseEntity<?> getCouponDetail(@PathVariable Integer couponId) {
        try {
            Optional<Coupon> couponOpt = couponRepository.findById(couponId);
            if (couponOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            CouponDTO couponDTO = convertCouponToDTO(couponOpt.get());
            return ResponseEntity.ok(couponDTO);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy chi tiết coupon: " + e.getMessage())
            );
        }
    }

    /**
     * Tạo coupon mới
     */
    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody CouponDTO couponDTO, Authentication authentication) {
        try {
            // Validate required fields
            if (couponDTO.getCode() == null || couponDTO.getCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Mã coupon không được để trống")
                );
            }

            // Check if code already exists
            Optional<Coupon> existingCoupon = couponRepository.findByCodeAndStatus(couponDTO.getCode(), Coupon.CouponStatus.ACTIVE);
            if (existingCoupon.isPresent()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Mã coupon đã tồn tại")
                );
            }

            // Get current admin user
            String username = authentication.getName();
            Optional<User> adminOpt = userService.findByUsername(username);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Admin user không tồn tại")
                );
            }

            Coupon coupon = convertDTOToCoupon(couponDTO);
            coupon.setCreatedBy(adminOpt.get());
            
            Coupon savedCoupon = couponRepository.save(coupon);

            return ResponseEntity.ok(Map.of(
                "message", "Tạo coupon thành công",
                "coupon", convertCouponToDTO(savedCoupon)
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi tạo coupon: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật coupon
     */
    @PutMapping("/{couponId}")
    public ResponseEntity<?> updateCoupon(@PathVariable Integer couponId, @RequestBody CouponDTO couponDTO) {
        try {
            Optional<Coupon> couponOpt = couponRepository.findById(couponId);
            if (couponOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Coupon coupon = couponOpt.get();
            updateCouponFromDTO(coupon, couponDTO);
            
            Coupon savedCoupon = couponRepository.save(coupon);

            return ResponseEntity.ok(Map.of(
                "message", "Cập nhật coupon thành công",
                "coupon", convertCouponToDTO(savedCoupon)
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi cập nhật coupon: " + e.getMessage())
            );
        }
    }

    /**
     * Xóa coupon (soft delete)
     */
    @DeleteMapping("/{couponId}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Integer couponId) {
        try {
            Optional<Coupon> couponOpt = couponRepository.findById(couponId);
            if (couponOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Coupon coupon = couponOpt.get();
            coupon.setStatus(Coupon.CouponStatus.DELETED);
            couponRepository.save(coupon);

            return ResponseEntity.ok(Map.of(
                "message", "Xóa coupon thành công"
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi xóa coupon: " + e.getMessage())
            );
        }
    }

    /**
     * Kích hoạt/vô hiệu hóa coupon
     */
    @PostMapping("/{couponId}/toggle-status")
    public ResponseEntity<?> toggleCouponStatus(@PathVariable Integer couponId) {
        try {
            Optional<Coupon> couponOpt = couponRepository.findById(couponId);
            if (couponOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Coupon coupon = couponOpt.get();
            
            if (coupon.getStatus() == Coupon.CouponStatus.ACTIVE) {
                coupon.setStatus(Coupon.CouponStatus.INACTIVE);
            } else if (coupon.getStatus() == Coupon.CouponStatus.INACTIVE) {
                coupon.setStatus(Coupon.CouponStatus.ACTIVE);
            }
            
            couponRepository.save(coupon);

            return ResponseEntity.ok(Map.of(
                "message", "Thay đổi trạng thái coupon thành công",
                "status", coupon.getStatus().toString()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi thay đổi trạng thái coupon: " + e.getMessage())
            );
        }
    }

    /**
     * Kiểm tra tính hợp lệ của coupon
     */
    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validateCoupon(@PathVariable String code) {
        try {
            Date currentDate = new Date(System.currentTimeMillis());
            Optional<Coupon> couponOpt = couponRepository.findValidCoupon(code, currentDate);
            
            if (couponOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Mã coupon không hợp lệ hoặc đã hết hạn")
                );
            }

            Coupon coupon = couponOpt.get();
            Map<String, Object> result = new HashMap<>();
            result.put("valid", true);
            result.put("coupon", convertCouponToDTO(coupon));
            result.put("remainingUsage", coupon.getUsageLimit() - coupon.getUsedCount());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi kiểm tra coupon: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thống kê coupons
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getCouponStatistics() {
        try {
            long totalCoupons = couponRepository.count();
            long activeCoupons = couponRepository.countByStatus(Coupon.CouponStatus.ACTIVE);
            long inactiveCoupons = couponRepository.countByStatus(Coupon.CouponStatus.INACTIVE);
            long expiredCoupons = couponRepository.countByStatus(Coupon.CouponStatus.EXPIRED);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCoupons", totalCoupons);
            stats.put("activeCoupons", activeCoupons);
            stats.put("inactiveCoupons", inactiveCoupons);
            stats.put("expiredCoupons", expiredCoupons);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy thống kê coupons: " + e.getMessage())
            );
        }
    }

    /**
     * Helper method to convert Coupon to DTO
     */
    private CouponDTO convertCouponToDTO(Coupon coupon) {
        CouponDTO dto = new CouponDTO();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setName(coupon.getName());
        dto.setDescription(coupon.getDescription());
        dto.setDiscountType(coupon.getDiscountType() != null ? coupon.getDiscountType().toString() : null);
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMaxDiscountAmount(coupon.getMaxDiscountAmount());
        dto.setMinOrderAmount(coupon.getMinOrderAmount());
        dto.setStartDate(coupon.getStartDate() != null ? coupon.getStartDate().toString() : null);
        dto.setEndDate(coupon.getEndDate() != null ? coupon.getEndDate().toString() : null);
        dto.setUsageLimit(coupon.getUsageLimit());
        dto.setUsedCount(coupon.getUsedCount());
        dto.setUsageLimitPerUser(coupon.getUsageLimitPerUser());
        dto.setStatus(coupon.getStatus() != null ? coupon.getStatus().toString() : null);
        dto.setApplicableBookingType(coupon.getApplicableBookingType() != null ? coupon.getApplicableBookingType().toString() : null);
        dto.setCreatedBy(coupon.getCreatedBy() != null ? coupon.getCreatedBy().getUsername() : null);
        
        return dto;
    }

    /**
     * Helper method to convert DTO to Coupon
     */
    private Coupon convertDTOToCoupon(CouponDTO dto) {
        Coupon coupon = new Coupon();
        coupon.setCode(dto.getCode());
        coupon.setName(dto.getName());
        coupon.setDescription(dto.getDescription());
        
        if (dto.getDiscountType() != null) {
            coupon.setDiscountType(Coupon.DiscountType.valueOf(dto.getDiscountType()));
        }
        
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        
        if (dto.getStartDate() != null) {
            coupon.setStartDate(Date.valueOf(dto.getStartDate()));
        }
        if (dto.getEndDate() != null) {
            coupon.setEndDate(Date.valueOf(dto.getEndDate()));
        }
        
        coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setUsageLimitPerUser(dto.getUsageLimitPerUser());
        
        if (dto.getStatus() != null) {
            coupon.setStatus(Coupon.CouponStatus.valueOf(dto.getStatus()));
        }
        
        if (dto.getApplicableBookingType() != null) {
            coupon.setApplicableBookingType(Coupon.ApplicableBookingType.valueOf(dto.getApplicableBookingType()));
        }
        
        return coupon;
    }

    /**
     * Helper method to update Coupon from DTO
     */
    private void updateCouponFromDTO(Coupon coupon, CouponDTO dto) {
        if (dto.getName() != null) coupon.setName(dto.getName());
        if (dto.getDescription() != null) coupon.setDescription(dto.getDescription());
        if (dto.getDiscountType() != null) {
            coupon.setDiscountType(Coupon.DiscountType.valueOf(dto.getDiscountType()));
        }
        if (dto.getDiscountValue() != null) coupon.setDiscountValue(dto.getDiscountValue());
        if (dto.getMaxDiscountAmount() != null) coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        if (dto.getMinOrderAmount() != null) coupon.setMinOrderAmount(dto.getMinOrderAmount());
        if (dto.getStartDate() != null) coupon.setStartDate(Date.valueOf(dto.getStartDate()));
        if (dto.getEndDate() != null) coupon.setEndDate(Date.valueOf(dto.getEndDate()));
        if (dto.getUsageLimit() != null) coupon.setUsageLimit(dto.getUsageLimit());
        if (dto.getUsageLimitPerUser() != null) coupon.setUsageLimitPerUser(dto.getUsageLimitPerUser());
        if (dto.getStatus() != null) {
            coupon.setStatus(Coupon.CouponStatus.valueOf(dto.getStatus()));
        }
        if (dto.getApplicableBookingType() != null) {
            coupon.setApplicableBookingType(Coupon.ApplicableBookingType.valueOf(dto.getApplicableBookingType()));
        }
    }
} 