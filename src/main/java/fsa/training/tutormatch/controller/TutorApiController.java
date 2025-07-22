package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.ProfileRepository;
import fsa.training.tutormatch.repository.TutorRepository;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TutorApiController {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @GetMapping("/tutors")
    public List<User> getAllTutors() {
        return tutorRepository.findAllTutors();  // trả về JSON
    }
}
