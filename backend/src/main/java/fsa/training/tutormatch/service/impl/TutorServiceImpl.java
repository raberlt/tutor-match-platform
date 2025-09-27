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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TutorServiceImpl implements TutorService {

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private DtoConverterService dtoConverterService;

    @Autowired
    private TutorSearchService tutorSearchService;

    @Override
    public List<TutorProfile> findAll() {
        return tutorProfileRepository.findAll();
    }

    @Override
    public List<TutorProfile> findAllApprovedTutors() {
        return tutorProfileRepository.findEnabledTutors();
    }

    @Override
    public Optional<TutorProfile> findById(Integer id) {
        return tutorProfileRepository.findById(id);
    }

    @Override
    public Page<TutorProfile> findAllWithPagination(Pageable pageable) {
        return tutorProfileRepository.findAll(pageable);
    }

    @Override
    public Map<String, Object> searchTutorsWithFilters(String keyword, Integer subjectId, BigDecimal minFee, 
                                                       BigDecimal maxFee, Double minRating, String city, 
                                                       int page, int size, String sortBy, String sortDirection) {
        return tutorSearchService.searchTutorsWithFilters(keyword, subjectId, minFee, maxFee, minRating, city, page, size, sortBy, sortDirection);
    }

    @Override
    public Map<String, Object> searchTutorPreviewsWithFilters(String keyword, Integer subjectId, BigDecimal minFee, 
                                                              BigDecimal maxFee, Double minRating, String city, 
                                                              int page, int size, String sortBy, String sortDirection) {
        return tutorSearchService.searchTutorPreviewsWithFilters(keyword, subjectId, minFee, maxFee, minRating, city, page, size, sortBy, sortDirection);
    }

    @Override
    public List<TutorDTO> findAllTutorDTOs() {
        List<TutorProfile> tutors = findAllApprovedTutors();
        List<TutorDTO> tutorDTOs = new ArrayList<>();
        for (TutorProfile tutor : tutors) {
            tutorDTOs.add(convertToDTO(tutor));
        }
        return tutorDTOs;
    }

    @Override
    public TutorDTO convertToDTO(TutorProfile tutor) {
        // Create a simple DTO conversion
        TutorDTO dto = new TutorDTO();
        dto.setId(tutor.getId());
        dto.setFirstName(tutor.getFirstName());
        dto.setLastName(tutor.getLastName());
        dto.setImageAvatar(tutor.getImageAvatar());
        dto.setHeadline(tutor.getHeadline());
        dto.setBio(tutor.getBio());
        dto.setExperience(tutor.getExperience());
        dto.setRatePointAverage(tutor.getRatePointAverage());
        dto.setTotalPoint(tutor.getTotalPoint());
        dto.setVerified(tutor.isVerified());
        dto.setSubjects(new ArrayList<>());
        dto.setSchedules(new ArrayList<>());
        return dto;
    }

    @Override
    public List<TutorPreviewDTO> convertToPreviewDTOs(List<TutorProfile> tutors) {
        List<TutorPreviewDTO> previewDTOs = new ArrayList<>();
        for (TutorProfile tutor : tutors) {
            TutorPreviewDTO dto = new TutorPreviewDTO();
            dto.setId(tutor.getId());
            dto.setFirstName(tutor.getFirstName());
            dto.setLastName(tutor.getLastName());
            dto.setImageAvatar(tutor.getImageAvatar());
            dto.setHeadline(tutor.getHeadline());
            dto.setExperience(tutor.getExperience());
            dto.setRatePointAverage(tutor.getRatePointAverage());
            dto.setTotalPoint(tutor.getTotalPoint());
            dto.setVerified(tutor.isVerified());
            dto.setSubjects(new ArrayList<>());
            previewDTOs.add(dto);
        }
        return previewDTOs;
    }

    @Override
    public Optional<TutorDTO> findTutorDetailById(Integer tutorId) {
        Optional<TutorProfile> tutorOpt = findById(tutorId);
        if (tutorOpt.isPresent()) {
            TutorDTO dto = convertToDTO(tutorOpt.get());
            return Optional.of(dto);
        }
        return Optional.empty();
    }

    @Override
    public List<TutorPreviewDTO> findAllTutorPreviews() {
        List<TutorProfile> tutors = findAllApprovedTutors();
        return convertToPreviewDTOs(tutors);
    }
}
