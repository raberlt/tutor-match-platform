package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TutorSearchService {
    
    @Autowired
    private ProfileRepository profileRepository;
    
    public List<TutorProfile> searchByKeyword(String keyword) {
        // Implementation for keyword search
        return profileRepository.findTutorsByKeyword(keyword);
    }
    
    public List<TutorProfile> searchBySubject(String subject) {
        // Implementation for subject search
        return profileRepository.findTutorsBySubject(subject);
    }
    
    
    public Page<TutorProfile> searchTutors(String keyword, String subject, String location, Pageable pageable) {
        // Implementation for advanced search
        if (keyword != null && !keyword.isEmpty()) {
            return profileRepository.findTutorsByKeywordPaged(keyword, pageable);
        }
        return profileRepository.findAllTutorsPaged(pageable);
    }
    
    public List<TutorProfile> findTopRatedTutors(int limit) {
        return profileRepository.findTopRatedTutors(limit);
    }
    
    public List<TutorProfile> findTutorsByPriceRange(Double minPrice, Double maxPrice) {
        return profileRepository.findTutorsByPriceRange(minPrice, maxPrice);
    }
    
    // Methods needed by TutorServiceImpl
    public Map<String, Object> searchTutorsWithFilters(String keyword, Integer subjectId, BigDecimal minFee, 
                                                      BigDecimal maxFee, Double minRating, String city, 
                                                      int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDirection), sortBy));
        Page<TutorProfile> tutors;
        
        // For now, use basic search - can be enhanced later with more complex filtering
        if (keyword != null && !keyword.isEmpty()) {
            tutors = profileRepository.findTutorsByKeywordPaged(keyword, pageable);
        } else {
            tutors = profileRepository.findAllTutorsPaged(pageable);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", tutors.getContent());
        result.put("totalPages", tutors.getTotalPages());
        result.put("totalElements", tutors.getTotalElements());
        result.put("currentPage", tutors.getNumber());
        result.put("size", tutors.getSize());
        
        return result;
    }
    
    public Map<String, Object> searchTutorPreviewsWithFilters(String keyword, Integer subjectId, BigDecimal minFee, 
                                                             BigDecimal maxFee, Double minRating, String city, 
                                                             int page, int size, String sortBy, String sortDirection) {
        // For preview, we return the same data but could be filtered to show limited info
        // For now, return the same as full search
        return searchTutorsWithFilters(keyword, subjectId, minFee, maxFee, minRating, city, page, size, sortBy, sortDirection);
    }
}
