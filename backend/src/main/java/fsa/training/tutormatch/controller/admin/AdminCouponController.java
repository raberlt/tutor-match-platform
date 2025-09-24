package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.entity.Coupon;
import fsa.training.tutormatch.enums.CouponStatus;
import fsa.training.tutormatch.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/coupons")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCouponController {

    @Autowired
    private CouponRepository couponRepository;

    /**
     * Lấy danh sách mã giảm giá
     */
    @GetMapping
    public ResponseEntity<?> getCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Coupon> couponsPage;

            if (status != null && !status.trim().isEmpty()) {
                CouponStatus couponStatus = CouponStatus.valueOf(status.toUpperCase());
                couponsPage = couponRepository.findByStatus(couponStatus, pageable);
            } else {
                couponsPage = couponRepository.findAll(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("coupons", couponsPage.getContent());
            response.put("currentPage", couponsPage.getNumber());
            response.put("totalItems", couponsPage.getTotalElements());
            response.put("totalPages", couponsPage.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi lấy danh sách mã giảm giá: " + e.getMessage())
            );
        }
    }

    /**
     * Tạo mã giảm giá mới
     */
    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody Map<String, Object> couponData) {
        try {
            Coupon coupon = new Coupon();
            coupon.setCode((String) couponData.get("code"));
            coupon.setDescription((String) couponData.get("description"));
            coupon.setDiscountValue(new BigDecimal(couponData.get("discountValue").toString()));
            coupon.setMinOrderAmount(new BigDecimal(couponData.get("minOrderAmount").toString()));
            coupon.setMaxDiscountAmount(new BigDecimal(couponData.get("maxDiscountAmount").toString()));
            coupon.setUsageLimit((Integer) couponData.get("usageLimit"));
            coupon.setUsedCount(0);
            coupon.setStatus(CouponStatus.ACTIVE);
            coupon.setCreatedAt(ZonedDateTime.now());

            coupon = couponRepository.save(coupon);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã tạo mã giảm giá thành công");
            response.put("coupon", coupon);

            return ResponseEntity.status(201).body(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi tạo mã giảm giá: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật mã giảm giá
     */
    @PutMapping("/{couponId}")
    public ResponseEntity<?> updateCoupon(@PathVariable Integer couponId, @RequestBody Map<String, Object> couponData) {
        try {
            Optional<Coupon> couponOpt = couponRepository.findById(couponId);
            if (couponOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Coupon coupon = couponOpt.get();
            if (couponData.containsKey("code")) coupon.setCode((String) couponData.get("code"));
            if (couponData.containsKey("description")) coupon.setDescription((String) couponData.get("description"));
            if (couponData.containsKey("discountValue")) coupon.setDiscountValue(new BigDecimal(couponData.get("discountValue").toString()));
            if (couponData.containsKey("minOrderAmount")) coupon.setMinOrderAmount(new BigDecimal(couponData.get("minOrderAmount").toString()));
            if (couponData.containsKey("maxDiscountAmount")) coupon.setMaxDiscountAmount(new BigDecimal(couponData.get("maxDiscountAmount").toString()));
            if (couponData.containsKey("usageLimit")) coupon.setUsageLimit((Integer) couponData.get("usageLimit"));
            if (couponData.containsKey("status")) coupon.setStatus(CouponStatus.valueOf(((String) couponData.get("status")).toUpperCase()));

            coupon = couponRepository.save(coupon);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cập nhật mã giảm giá thành công");
            response.put("coupon", coupon);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi cập nhật mã giảm giá: " + e.getMessage())
            );
        }
    }

    /**
     * Xóa mã giảm giá
     */
    @DeleteMapping("/{couponId}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Integer couponId) {
        try {
            Optional<Coupon> couponOpt = couponRepository.findById(couponId);
            if (couponOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            couponRepository.delete(couponOpt.get());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xóa mã giảm giá thành công");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi xóa mã giảm giá: " + e.getMessage())
            );
        }
    }

    /**
     * Thống kê mã giảm giá
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getCouponStatistics() {
        try {
            long totalCoupons = couponRepository.count();
            long activeCoupons = couponRepository.countByStatus(CouponStatus.ACTIVE);
            long expiredCoupons = couponRepository.countByStatus(CouponStatus.EXPIRED);
            long usedCoupons = couponRepository.findAll().stream().mapToInt(Coupon::getUsedCount).sum();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCoupons", totalCoupons);
            stats.put("activeCoupons", activeCoupons);
            stats.put("expiredCoupons", expiredCoupons);
            stats.put("usedCoupons", usedCoupons);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi lấy thống kê mã giảm giá: " + e.getMessage())
            );
        }
    }
}