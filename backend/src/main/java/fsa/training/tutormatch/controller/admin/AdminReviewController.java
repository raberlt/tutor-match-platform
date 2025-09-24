package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.entity.Review;
import fsa.training.tutormatch.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    /**
     * Lấy danh sách đánh giá
     */
    @GetMapping
    public ResponseEntity<?> getReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String rating,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Review> reviewsPage;

            // Apply filters
            if (rating != null && !rating.trim().isEmpty()) {
                reviewsPage = reviewRepository.findByRating(Integer.parseInt(rating), pageable);
            } else if (status != null && !status.trim().isEmpty()) {
                if (status.equals("verified")) {
                    reviewsPage = reviewRepository.findByIsVerified(true, pageable);
                } else if (status.equals("unverified")) {
                    reviewsPage = reviewRepository.findByIsVerified(false, pageable);
                } else if (status.equals("public")) {
                    reviewsPage = reviewRepository.findByIsPublic(true, pageable);
                } else if (status.equals("private")) {
                    reviewsPage = reviewRepository.findByIsPublic(false, pageable);
                } else {
                    reviewsPage = reviewRepository.findAll(pageable);
                }
            } else {
                reviewsPage = reviewRepository.findAll(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("reviews", reviewsPage.getContent());
            response.put("currentPage", reviewsPage.getNumber());
            response.put("totalItems", reviewsPage.getTotalElements());
            response.put("totalPages", reviewsPage.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi lấy danh sách đánh giá: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật trạng thái xác minh
     */
    @PutMapping("/{reviewId}/verification")
    public ResponseEntity<?> toggleVerification(@PathVariable Integer reviewId) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
            if (reviewOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Review review = reviewOpt.get();
            review.setIsVerified(!review.getIsVerified());
            review = reviewRepository.save(review);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cập nhật trạng thái xác minh");
            response.put("review", review);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi cập nhật trạng thái xác minh: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật trạng thái công khai
     */
    @PutMapping("/{reviewId}/visibility")
    public ResponseEntity<?> toggleVisibility(@PathVariable Integer reviewId) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
            if (reviewOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Review review = reviewOpt.get();
            review.setIsPublic(!review.getIsPublic());
            review = reviewRepository.save(review);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cập nhật trạng thái công khai");
            response.put("review", review);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi cập nhật trạng thái công khai: " + e.getMessage())
            );
        }
    }

    /**
     * Thêm phản hồi cho đánh giá
     */
    @PutMapping("/{reviewId}/response")
    public ResponseEntity<?> addResponse(@PathVariable Integer reviewId, @RequestBody Map<String, String> responseData) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
            if (reviewOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Review review = reviewOpt.get();
            review.setResponse(responseData.get("response"));
            review.setResponseDate(ZonedDateTime.now());
            review = reviewRepository.save(review);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã thêm phản hồi thành công");
            response.put("review", review);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi thêm phản hồi: " + e.getMessage())
            );
        }
    }

    /**
     * Xóa đánh giá
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Integer reviewId) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
            if (reviewOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            reviewRepository.delete(reviewOpt.get());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xóa đánh giá thành công");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi xóa đánh giá: " + e.getMessage())
            );
        }
    }

    /**
     * Thống kê đánh giá
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getReviewStatistics() {
        try {
            long totalReviews = reviewRepository.count();
            long verifiedReviews = reviewRepository.countByIsVerified(true);
            long unverifiedReviews = reviewRepository.countByIsVerified(false);
            long publicReviews = reviewRepository.countByIsPublic(true);
            long privateReviews = reviewRepository.countByIsPublic(false);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalReviews", totalReviews);
            stats.put("verifiedReviews", verifiedReviews);
            stats.put("unverifiedReviews", unverifiedReviews);
            stats.put("publicReviews", publicReviews);
            stats.put("privateReviews", privateReviews);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi lấy thống kê đánh giá: " + e.getMessage())
            );
        }
    }
}
