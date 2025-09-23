package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.TutorDTO;
import fsa.training.tutormatch.dto.TutorPreviewDTO;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.ProfileRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.interfaces.ITutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TutorServiceImpl implements ITutorService {

    @Autowired
    private ProfileRepository profileRepository;

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
        List<TutorProfile> tutors = profileRepository.findApprovedTutors();
        return tutors.stream()
                .map(this::convertToDTO)
                .toList();
    }

    /**
     * Find all tutor previews (limited info for guests)
     */
    @Override
    public List<TutorPreviewDTO> findAllTutorPreviews() {
        List<TutorProfile> tutors = profileRepository.findApprovedTutors();
        return convertToPreviewDTOs(tutors);
    }

    /**
     * Find tutor detail by ID (for registered students)
     */
    @Override
    public Optional<TutorDTO> findTutorDetailById(Integer tutorId) {
        return profileRepository.findById(tutorId)
            .filter(profile -> profile instanceof TutorProfile)
            .map(profile -> convertToDTO((TutorProfile) profile));
    }
    
    // Missing methods from interface
    @Override
    public List<TutorProfile> findAll() {
        return profileRepository.findApprovedTutors();
    }
    
    @Override
    public List<TutorProfile> findAllApprovedTutors() {
        return profileRepository.findApprovedTutors();
    }
    
    @Override
    public Optional<TutorProfile> findById(Integer id) {
        return profileRepository.findById(id)
            .filter(profile -> profile instanceof TutorProfile)
            .map(profile -> (TutorProfile) profile);
    }
    
    @Override
    public Page<TutorProfile> findAllWithPagination(Pageable pageable) {
        return profileRepository.findAllTutorsPaged(pageable);
    }
    
    @Override
    public TutorDTO convertToDTO(TutorProfile tutorProfile) {
        TutorDTO dto = new TutorDTO();
        dto.setId(tutorProfile.getId());
        dto.setBio(tutorProfile.getBio());
        dto.setHeadline(tutorProfile.getHeadline());
        dto.setExperience(tutorProfile.getExperience());
        dto.setTeachingLevel(tutorProfile.getTeachingLevel());
        dto.setFees(tutorProfile.getFees());
        // dto.setCity(tutorProfile.getCity()); // city field removed
        dto.setRatePointAverage(tutorProfile.getRatePointAverage());
        return dto;
    }
    
    @Override
    public List<TutorPreviewDTO> convertToPreviewDTOs(List<TutorProfile> tutorProfiles) {
        return tutorProfiles.stream()
            .map(this::convertToPreviewDTO)
            .toList();
    }
    
    private TutorPreviewDTO convertToPreviewDTO(TutorProfile tutorProfile) {
        TutorPreviewDTO dto = new TutorPreviewDTO();
        dto.setId(tutorProfile.getId());
        dto.setHeadline(tutorProfile.getHeadline());
        dto.setFees(tutorProfile.getFees());
        // dto.setCity(tutorProfile.getCity()); // city field removed
        dto.setRatePointAverage(tutorProfile.getRatePointAverage());
        return dto;
    }


}
