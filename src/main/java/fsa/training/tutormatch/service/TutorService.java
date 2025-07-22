package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.TutorDTO;
import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.ProfileSubject;
import fsa.training.tutormatch.entity.Subject;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.TutorRepository;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TutorService {

    @Autowired
    private TutorRepository  tutorRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    // giả sử đã có tutorRepository
    public List<TutorDTO> findAllTutorDTOs() {
        List<User> tutors = tutorRepository.findAllTutors();

        return tutors.stream().map(user -> {
            TutorDTO dto = new TutorDTO();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setImageAvatar(user.getImageAvatar());

            if (user.getProfile() != null) {
                dto.setBio(user.getProfile().getBio());
                dto.setHeadline(user.getProfile().getHeadline());
                dto.setFees(user.getProfile().getFees());
                dto.setRatePointAverage(user.getProfile().getRatePointAverage());
                dto.setTotalPoint(user.getProfile().getTotalPoint());

                List<String> subjectNames = user.getProfile().getProfileSubjects()
                        .stream()
                        .map(ps -> ps.getSubject().getName())
                        .collect(Collectors.toList());

                dto.setSubjects(subjectNames);
            }

            return dto;
        }).collect(Collectors.toList());
    }

}

