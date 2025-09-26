package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.dto.TutorDTO;
import fsa.training.tutormatch.dto.TutorPreviewDTO;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.TutorProfileRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.DtoConverterService;
import fsa.training.tutormatch.service.TutorSearchService;
import fsa.training.tutormatch.service.TutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TutorServiceImpl implements TutorService {

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DtoConverterService dtoConverter;
    
    @Autowired
    private TutorSearchService searchService;

    /**
     * Tìm kiếm giảng viên với pagination và filters
     */
    @Override
    public Map<String, Object> searchTutorsWithFilters(
            String keyword,
            Integer subjectId, 
            BigDecimal minFee,
            BigDecimal maxFee,
            Double minRating,
            String city,
            int page,
            int size,
            String sortBy,
            String sortDirection) {
        
        // Delegate to search service
        return searchService.searchTutorsWithFilters(keyword, subjectId, minFee, maxFee, minRating, city, page, size, sortBy, sortDirection);
    }

    /**
     * Tìm kiếm giảng viên preview cho guest với pagination
     */
    @Override
    public Map<String, Object> searchTutorPreviewsWithFilters(
            String keyword,
            Integer subjectId, 
            BigDecimal minFee,
            BigDecimal maxFee,
            Double minRating,
            String city,
            int page,
            int size,
            String sortBy,
            String sortDirection) {
        
        // Delegate to search service
        return searchService.searchTutorPreviewsWithFilters(keyword, subjectId, minFee, maxFee, minRating, city, page, size, sortBy, sortDirection);
    }

    @Override
    public List<TutorDTO> findAllTutorDTOs() {
        List<TutorProfile> tutors = tutorProfileRepository.findEnabledTutors();
        return tutors.stream()
                .map(this::convertToDTO)
                .toList();
    }

    /**
     * Find all tutor previews (limited info for guests)
     */
    @Override
    public List<TutorPreviewDTO> findAllTutorPreviews() {
        List<TutorProfile> tutors = tutorProfileRepository.findEnabledTutors();
        return convertToPreviewDTOs(tutors);
    }

    /**
     * Find tutor detail by ID (for registered students)
     */
    @Override
    public Optional<TutorDTO> findTutorDetailById(Integer tutorId) {
        return tutorProfileRepository.findById(tutorId)
            .filter(profile -> profile instanceof TutorProfile)
            .map(profile -> convertToDTO((TutorProfile) profile));
    }
    
    // Missing methods from interface
    @Override
    public List<TutorProfile> findAll() {
        return tutorProfileRepository.findEnabledTutors();
    }
    
    @Override
    public List<TutorProfile> findAllApprovedTutors() {
        return tutorProfileRepository.findEnabledTutors();
    }
    
    @Override
    public Optional<TutorProfile> findById(Integer id) {
        return tutorProfileRepository.findById(id)
            .filter(profile -> profile instanceof TutorProfile)
            .map(profile -> (TutorProfile) profile);
    }
    
    @Override
    public Page<TutorProfile> findAllWithPagination(Pageable pageable) {
        return tutorProfileRepository.findAllTutorsPaged(pageable);
    }
    
    @Override
    public TutorDTO convertToDTO(TutorProfile tutor) {
        TutorDTO dto = new TutorDTO();
        dto.setId(tutor.getId());
        dto.setFirstName(tutor.getFirstName());
        dto.setLastName(tutor.getLastName());
        dto.setImageAvatar(tutor.getImageAvatar());
        dto.setBio(tutor.getBio());
        dto.setHeadline(tutor.getHeadline());
        dto.setExperience(tutor.getExperience());
        // teachingLevel field removed from TutorProfile
        dto.setFees(tutor.getFees());
        // dto.setCity(tutorProfile.getCity()); // city field removed
        dto.setRatePointAverage(tutor.getRatePointAverage());
        dto.setTotalPoint(tutor.getTotalPoint());
        dto.setVerified(tutor.isVerified());
        
        // Populate subjects from profileSubjects
        if (tutor.getProfileSubjects() != null && !tutor.getProfileSubjects().isEmpty()) {
            List<TutorDTO.SubjectDTO> subjects = tutor.getProfileSubjects().stream()
                .map(ps -> new TutorDTO.SubjectDTO(ps.getSubject().getId(), ps.getSubject().getName(), ps.getFees()))
                .toList();
            dto.setSubjects(subjects);
        }
        
        return dto;
    }
    
    @Override
    public List<TutorPreviewDTO> convertToPreviewDTOs(List<TutorProfile> tutors) {
        return tutors.stream()
            .map(this::convertToPreviewDTO)
            .toList();
    }
    
    private TutorPreviewDTO convertToPreviewDTO(TutorProfile tutor) {
        TutorPreviewDTO dto = new TutorPreviewDTO();
        dto.setId(tutor.getId());
        dto.setFirstName(tutor.getFirstName());
        dto.setLastName(tutor.getLastName());
        dto.setImageAvatar(tutor.getImageAvatar());
        dto.setHeadline(tutor.getHeadline());
        dto.setFees(tutor.getFees());
        // dto.setCity(tutorProfile.getCity()); // city field removed
        dto.setRatePointAverage(tutor.getRatePointAverage());
        dto.setTotalPoint(tutor.getTotalPoint());
        dto.setVerified(tutor.isVerified());
        
        // Populate subjectNames from profileSubjects
        if (tutor.getProfileSubjects() != null && !tutor.getProfileSubjects().isEmpty()) {
            List<String> subjectNames = tutor.getProfileSubjects().stream()
                .map(ps -> ps.getSubject().getName())
                .toList();
            dto.setSubjectNames(subjectNames);
        }
        
        return dto;
    }

}
