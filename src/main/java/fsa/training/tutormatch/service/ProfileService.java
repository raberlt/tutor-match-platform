package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.ProfileRepository;
import fsa.training.tutormatch.repository.RateRepository;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private RateRepository rateRepository;
    @Autowired
    private ProfileRepository profileRepository;

    public void setAverageRate(Profile profile) {
        Integer tutorId = profile.getTutor().getId();
        Double avgRate = rateRepository.findAverageRateByTutorId(tutorId);
        profile.setRatePointAverage(avgRate != null ? avgRate : 0.0);
    }

    public Optional<Profile> findByTutorId(Integer id) {
        return profileRepository.findByTutorId(id);
    }
}
