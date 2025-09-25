package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.TutorDTO;
import fsa.training.tutormatch.dto.TutorPreviewDTO;
import fsa.training.tutormatch.entity.TutorProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface TutorService {
    List<TutorProfile> findAll();
    List<TutorProfile> findAllApprovedTutors();
    Optional<TutorProfile> findById(Integer id);
    Page<TutorProfile> findAllWithPagination(Pageable pageable);
    
    // Search methods - sửa signature để khớp implementation
    Map<String, Object> searchTutorsWithFilters(String keyword, Integer subjectId, BigDecimal minFee, 
                                               BigDecimal maxFee, Double minRating, String city, 
                                               int page, int size, String sortBy, String sortDirection);
    Map<String, Object> searchTutorPreviewsWithFilters(String keyword, Integer subjectId, BigDecimal minFee, 
                                                          BigDecimal maxFee, Double minRating, String city, 
                                                          int page, int size, String sortBy, String sortDirection);
    
    // DTO methods
    List<TutorDTO> findAllTutorDTOs();
    TutorDTO convertToDTO(TutorProfile tutorProfile);
    List<TutorPreviewDTO> convertToPreviewDTOs(List<TutorProfile> tutorProfiles);
    
    // Thêm method mới cho detail
    Optional<TutorDTO> findTutorDetailById(Integer tutorId);
    List<TutorPreviewDTO> findAllTutorPreviews();
}