package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.TutorDTO;
import fsa.training.tutormatch.dto.TutorPreviewDTO;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.ApplicationSubjectFee;
import fsa.training.tutormatch.entity.ApplicationSchedule;
import fsa.training.tutormatch.entity.ApplicationTeachingAudience;
import fsa.training.tutormatch.repository.TutorProfileRepository;
import fsa.training.tutormatch.repository.ApplicationSubjectFeeRepository;
import fsa.training.tutormatch.repository.ApplicationScheduleRepository;
import fsa.training.tutormatch.repository.ApplicationTeachingAudienceRepository;
import fsa.training.tutormatch.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TutorSearchService {
    
    @Autowired
    private TutorProfileRepository tutorProfileRepository;
    
    @Autowired
    private ApplicationSubjectFeeRepository applicationSubjectFeeRepository;
    
    @Autowired
    private ApplicationScheduleRepository applicationScheduleRepository;
    
    @Autowired
    private ApplicationTeachingAudienceRepository applicationTeachingAudienceRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    public List<TutorProfile> searchByKeyword(String keyword) {
        // Implementation for keyword search
        return tutorProfileRepository.findTutorsByKeyword(keyword);
    }
    
    public List<TutorProfile> searchBySubject(String subject) {
        // Implementation for subject search - temporarily disabled
        return new ArrayList<>();
    }
    
    
    public Page<TutorProfile> searchTutors(String keyword, String subject, String location, Pageable pageable) {
        // Implementation for advanced search
        if (keyword != null && !keyword.isEmpty()) {
            return tutorProfileRepository.findTutorsByKeywordPaged(keyword, pageable);
        }
        return tutorProfileRepository.findAllTutorsPaged(pageable);
    }
    
    public List<TutorProfile> findTopRatedTutors(int limit) {
        return tutorProfileRepository.findTopRatedTutors(limit);
    }
    
    public List<TutorProfile> findTutorsByPriceRange(Double minPrice, Double maxPrice) {
        // Implementation for price range search - temporarily disabled
        return new ArrayList<>();
    }
    
    // Methods needed by TutorServiceImpl
    public Map<String, Object> searchTutorsWithFilters(String keyword, Integer subjectId, BigDecimal minFee, 
                                                      BigDecimal maxFee, Double minRating, String city, 
                                                      int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDirection), sortBy));
        Page<TutorProfile> tutors;
        
        // For now, use basic search - can be enhanced later with more complex filtering
        if (keyword != null && !keyword.isEmpty()) {
            tutors = tutorProfileRepository.findTutorsByKeywordPaged(keyword, pageable);
        } else {
            tutors = tutorProfileRepository.findAllTutorsPaged(pageable);
        }
        
        // Convert to DTOs
        List<TutorDTO> tutorDTOs = tutors.getContent().stream()
            .map(this::convertToDTO)
            .toList();
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", tutorDTOs);
        result.put("totalPages", tutors.getTotalPages());
        result.put("totalElements", tutors.getTotalElements());
        result.put("currentPage", tutors.getNumber());
        result.put("size", tutors.getSize());
        
        return result;
    }
    
    public Map<String, Object> searchTutorPreviewsWithFilters(String keyword, Integer subjectId, BigDecimal minFee, 
                                                             BigDecimal maxFee, Double minRating, String city, 
                                                             int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDirection), sortBy));
        Page<TutorProfile> tutors;
        
        // For now, use basic search - can be enhanced later with more complex filtering
        if (keyword != null && !keyword.isEmpty()) {
            tutors = tutorProfileRepository.findTutorsByKeywordPaged(keyword, pageable);
        } else {
            tutors = tutorProfileRepository.findAllTutorsPaged(pageable);
        }
        
        // Convert to Preview DTOs
        List<TutorPreviewDTO> tutorPreviewDTOs = tutors.getContent().stream()
            .map(this::convertToPreviewDTO)
            .toList();
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", tutorPreviewDTOs);
        result.put("totalPages", tutors.getTotalPages());
        result.put("totalElements", tutors.getTotalElements());
        result.put("currentPage", tutors.getNumber());
        result.put("size", tutors.getSize());
        
        return result;
    }
    
    private TutorDTO convertToDTO(TutorProfile tutor) {
        TutorDTO dto = new TutorDTO();
        dto.setId(tutor.getId());
        dto.setFirstName(tutor.getFirstName());
        dto.setLastName(tutor.getLastName());
        dto.setImageAvatar(tutor.getImageAvatar());
        dto.setBio(tutor.getBio());
        dto.setHeadline(tutor.getHeadline());
        dto.setExperience(tutor.getExperience());
        dto.setFees(tutor.getFees());
        dto.setRatePointAverage(tutor.getRatePointAverage());
        dto.setTotalPoint(tutor.getTotalPoint());
        dto.setVerified(tutor.isVerified());
        
        // TODO: Load subjects, schedules, teachingAudiences from Application entities
        // For now, return empty lists to avoid compilation errors
        dto.setSubjects(new ArrayList<>());
        // dto.setSchedules(new ArrayList<>());
        // dto.setTeachingAudiences(new ArrayList<>());
        
        return dto;
    }
    
    private TutorPreviewDTO convertToPreviewDTO(TutorProfile tutor) {
        TutorPreviewDTO dto = new TutorPreviewDTO();
        dto.setId(tutor.getId());
        dto.setFirstName(tutor.getFirstName());
        dto.setLastName(tutor.getLastName());
        dto.setImageAvatar(tutor.getImageAvatar());
        dto.setHeadline(tutor.getHeadline());
        dto.setFees(tutor.getFees());
        dto.setRatePointAverage(tutor.getRatePointAverage());
        dto.setTotalPoint(tutor.getTotalPoint());
        dto.setVerified(tutor.isVerified());
        
        // TODO: Load subjects, schedules, teachingAudiences from Application entities
        // For now, return empty lists to avoid compilation errors
        dto.setSubjectNames(new ArrayList<>());
        // dto.setSchedules(new ArrayList<>());
        // dto.setTeachingAudiences(new ArrayList<>());
        
        return dto;
    }
}
