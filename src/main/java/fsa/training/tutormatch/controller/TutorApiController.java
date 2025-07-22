package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.dto.TutorDTO;
import fsa.training.tutormatch.repository.ProfileRepository;
import fsa.training.tutormatch.service.TutorService;
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
    private TutorService tutorService;

    @GetMapping("/tutors")
    public List<TutorDTO> getAllTutors() {
        return tutorService.findAllTutorDTOs();  // trả về JSON
    }
}
