package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.Rate;
import fsa.training.tutormatch.repository.ProfileRepository;
import fsa.training.tutormatch.repository.RateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RateService {

    @Autowired
    private RateRepository rateRepository;

    @Autowired
    private ProfileRepository profileRepository;

    // Thêm hoặc cập nhật rate
    public void addOrUpdateRate(Rate rate) {
        rateRepository.save(rate);
        updateProfileAverageRate(rate.getBooking().getTutor().getId());
    }

    // Xoá rate
    public void deleteRate(Integer rateId) {
        Rate rate = rateRepository.findById(rateId).orElse(null);
        if (rate != null) {
            Integer tutorId = rate.getBooking().getTutor().getId();
            rateRepository.delete(rate);
            updateProfileAverageRate(tutorId);
        }
    }

    // Tính và cập nhật điểm trung bình vào Profile
    public void updateProfileAverageRate(Integer tutorId) {
        Double averageRate = rateRepository.findAverageRateByTutorId(tutorId);
        if (averageRate == null) {
            averageRate = 0.0;
        }

        Optional<Profile> profileOpt = profileRepository.findByTutorId(tutorId);
        if (profileOpt.isPresent()) {
            Profile profile = profileOpt.get();
            profile.setRatePointAverage(averageRate);
            profileRepository.save(profile);
        }

    }
}

