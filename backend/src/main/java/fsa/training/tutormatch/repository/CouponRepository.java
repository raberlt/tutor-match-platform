package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    
    Optional<Coupon> findByCodeAndStatus(String code, Coupon.CouponStatus status);
    
    List<Coupon> findByStatus(Coupon.CouponStatus status);
    
    @Query("SELECT c FROM Coupon c WHERE c.code = :code AND c.status = 'ACTIVE' " +
           "AND c.startDate <= :currentDate AND c.endDate >= :currentDate " +
           "AND c.usedCount < c.usageLimit")
    Optional<Coupon> findValidCoupon(@Param("code") String code, @Param("currentDate") Date currentDate);
    
    List<Coupon> findByApplicableBookingType(Coupon.ApplicableBookingType bookingType);
    
    Page<Coupon> findByApplicableBookingType(Coupon.ApplicableBookingType bookingType, Pageable pageable);
    
    Page<Coupon> findByStatus(Coupon.CouponStatus status, Pageable pageable);
    
    long countByStatus(Coupon.CouponStatus status);
} 