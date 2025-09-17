package fsa.training.tutormatch.controller.api.admin;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.BookingStatus;
import fsa.training.tutormatch.entity.BookingType;
import fsa.training.tutormatch.entity.Coupon;
import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardApiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ProfileRepository profileRepository;

    /**
     * Lấy tổng quan thống kê cho dashboard
     */
    @GetMapping("/overview")
    public ResponseEntity<?> getDashboardOverview() {
        try {
            Map<String, Object> overview = new HashMap<>();

            // User statistics
            Map<String, Object> userStats = new HashMap<>();
            userStats.put("totalUsers", userRepository.count());
            userStats.put("totalStudents", userRepository.countByRole(User.Role.STUDENT));
            userStats.put("totalTutors", userRepository.countByRole(User.Role.TUTOR));
            userStats.put("activeUsers", userRepository.countByEnabled(true));
            
            // Recent users (last 30 days)
            Timestamp thirtyDaysAgo = new Timestamp(System.currentTimeMillis() - 30L * 24 * 60 * 60 * 1000);
            userStats.put("newUsersLast30Days", userRepository.countByCreatedAtAfter(thirtyDaysAgo));
            
            overview.put("users", userStats);

            // Booking statistics
            Map<String, Object> bookingStats = new HashMap<>();
            bookingStats.put("totalBookings", bookingRepository.count());
            bookingStats.put("pendingBookings", bookingRepository.countByStatus(BookingStatus.PENDING));
            bookingStats.put("confirmedBookings", bookingRepository.countByStatus(BookingStatus.CONFIRMED));
            bookingStats.put("completedBookings", bookingRepository.countByStatus(BookingStatus.COMPLETED));
            
            // Today's bookings
            Date today = Date.valueOf(LocalDate.now());
            bookingStats.put("todayBookings", bookingRepository.countByDate(today));
            
            overview.put("bookings", bookingStats);

            // Payment statistics
            Map<String, Object> paymentStats = new HashMap<>();
            paymentStats.put("totalPayments", paymentRepository.count());
            paymentStats.put("completedPayments", paymentRepository.countByStatus(Payment.PaymentStatus.COMPLETED));
            paymentStats.put("pendingPayments", paymentRepository.countByStatus(Payment.PaymentStatus.PENDING));
            
            // Revenue calculation
            BigDecimal totalRevenue = paymentRepository.sumAmountByStatus(Payment.PaymentStatus.COMPLETED);
            paymentStats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
            
            overview.put("payments", paymentStats);

            // Coupon statistics
            Map<String, Object> couponStats = new HashMap<>();
            couponStats.put("totalCoupons", couponRepository.count());
            couponStats.put("activeCoupons", couponRepository.countByStatus(Coupon.CouponStatus.ACTIVE));
            couponStats.put("usedCoupons", getTotalUsedCoupons());
            
            overview.put("coupons", couponStats);

            return ResponseEntity.ok(overview);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy tổng quan dashboard: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thống kê theo thời gian (chart data)
     */
    @GetMapping("/charts")
    public ResponseEntity<?> getChartData(
            @RequestParam(defaultValue = "monthly") String period,
            @RequestParam(defaultValue = "6") int months) {
        try {
            Map<String, Object> chartData = new HashMap<>();

            // User registration chart (last 6 months)
            List<Map<String, Object>> userRegistrations = getUserRegistrationChart(months);
            chartData.put("userRegistrations", userRegistrations);

            // Booking trends chart
            List<Map<String, Object>> bookingTrends = getBookingTrendsChart(months);
            chartData.put("bookingTrends", bookingTrends);

            // Revenue chart
            List<Map<String, Object>> revenueChart = getRevenueChart(months);
            chartData.put("revenue", revenueChart);

            return ResponseEntity.ok(chartData);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy dữ liệu chart: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy hoạt động gần đây
     */
    @GetMapping("/recent-activities")
    public ResponseEntity<?> getRecentActivities(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Map<String, Object>> activities = new ArrayList<>();

            // Recent bookings
            Timestamp oneDayAgo = new Timestamp(System.currentTimeMillis() - 24 * 60 * 60 * 1000);
            long recentBookings = bookingRepository.countByCreatedAtAfter(oneDayAgo);
            
            if (recentBookings > 0) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "booking");
                activity.put("message", recentBookings + " booking mới trong 24h qua");
                activity.put("time", "24h ago");
                activity.put("icon", "calendar");
                activities.add(activity);
            }

            // Recent users
            long recentUsers = userRepository.countByCreatedAtAfter(oneDayAgo);
            if (recentUsers > 0) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "user");
                activity.put("message", recentUsers + " user mới đăng ký trong 24h qua");
                activity.put("time", "24h ago");
                activity.put("icon", "users");
                activities.add(activity);
            }

            return ResponseEntity.ok(activities);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy hoạt động gần đây: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy top tutors
     */
    @GetMapping("/top-tutors")
    public ResponseEntity<?> getTopTutors(@RequestParam(defaultValue = "5") int limit) {
        try {
            // This would require complex queries to calculate tutor rankings
            // For now, return a simple structure
            List<Map<String, Object>> topTutors = new ArrayList<>();
            
            Map<String, Object> response = new HashMap<>();
            response.put("topTutors", topTutors);
            response.put("message", "Top tutors data - implementation needed");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy top tutors: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy system health status
     */
    @GetMapping("/system-health")
    public ResponseEntity<?> getSystemHealth() {
        try {
            Map<String, Object> health = new HashMap<>();
            
            // Database connection status
            try {
                userRepository.count(); // Test query
                health.put("database", "healthy");
            } catch (Exception e) {
                health.put("database", "error");
            }
            
            // Memory usage
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            
            Map<String, Object> memory = new HashMap<>();
            memory.put("total", totalMemory / (1024 * 1024) + " MB");
            memory.put("used", usedMemory / (1024 * 1024) + " MB");
            memory.put("free", freeMemory / (1024 * 1024) + " MB");
            health.put("memory", memory);
            
            health.put("status", "running");
            health.put("uptime", getSystemUptime());

            return ResponseEntity.ok(health);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy system health: " + e.getMessage())
            );
        }
    }

    // Helper methods

    private long getTotalUsedCoupons() {
        // Calculate total used count across all coupons
        // This would need a custom query
        return 0; // Placeholder
    }

    private List<Map<String, Object>> getUserRegistrationChart(int months) {
        List<Map<String, Object>> data = new ArrayList<>();
        
        for (int i = months - 1; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", yearMonth.toString());
            monthData.put("count", 10 + (int)(Math.random() * 50)); // Placeholder data
            data.add(monthData);
        }
        
        return data;
    }

    private List<Map<String, Object>> getBookingTrendsChart(int months) {
        List<Map<String, Object>> data = new ArrayList<>();
        
        for (int i = months - 1; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", yearMonth.toString());
            monthData.put("bookings", 5 + (int)(Math.random() * 25)); // Placeholder data
            data.add(monthData);
        }
        
        return data;
    }

    private List<Map<String, Object>> getRevenueChart(int months) {
        List<Map<String, Object>> data = new ArrayList<>();
        
        for (int i = months - 1; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", yearMonth.toString());
            monthData.put("revenue", 1000000 + (int)(Math.random() * 5000000)); // Placeholder data
            data.add(monthData);
        }
        
        return data;
    }

    private String getSystemUptime() {
        long uptimeMillis = System.currentTimeMillis() - 
            java.lang.management.ManagementFactory.getRuntimeMXBean().getStartTime();
        long uptimeHours = uptimeMillis / (1000 * 60 * 60);
        return uptimeHours + " hours";
    }
} 