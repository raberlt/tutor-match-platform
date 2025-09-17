package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.dto.TutorDTO;
import fsa.training.tutormatch.entity.Subject;
import fsa.training.tutormatch.service.SubjectService;
import fsa.training.tutormatch.service.interfaces.ITutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Optional;

@Controller
public class HomeController {

    @Autowired
    private ITutorService tutorService;
    
    @Autowired
    private SubjectService subjectService;
    
    @GetMapping("/")
    public String home(Model model) {
        return "index";
    }
    
    @GetMapping("/tutor-search")
    public String tutorSearch(
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "minFee", required = false) Integer minFee,
            @RequestParam(value = "maxFee", required = false) Integer maxFee,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            Model model) {
        

        String validSubject = Optional.ofNullable(subject).orElse("Tất cả môn học");
        Integer validMinFee = Optional.ofNullable(minFee).orElse(0);
        Integer validMaxFee = Optional.ofNullable(maxFee).orElse(1000000);
        String validKeyword = Optional.ofNullable(keyword).orElse("");
        String validSortBy = Optional.ofNullable(sortBy).orElse("name");
        

        List<TutorDTO> tutors = Optional.ofNullable(tutorService.findAllTutorDTOs()).orElse(List.of());
        List<String> allSubjects = Optional.ofNullable(subjectService.getAllSubjects()).orElse(List.of());
        
        model.addAttribute("tutors", tutors);
        model.addAttribute("allSubjects", allSubjects);
        model.addAttribute("currentSubject", validSubject);
        model.addAttribute("currentMinFee", validMinFee);
        model.addAttribute("currentMaxFee", validMaxFee);
        model.addAttribute("currentKeyword", validKeyword);
        model.addAttribute("currentSortBy", validSortBy);
        model.addAttribute("message", "Danh sách gia sư");
        
        return "tutor-search";
    }

    @GetMapping("/become-tutor")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR')")
    public String becomeTutor(Model model) {
        return "become-tutor";
    }
    
    @GetMapping("/my-sessions")
    @PreAuthorize("hasRole('STUDENT')")
    public String mySessions(Model model) {
        return "my-sessions";
    }
    
    @GetMapping("/teaching-schedule")
    @PreAuthorize("hasRole('TUTOR')")
    public String teachingSchedule(Model model) {
        return "teaching-schedule";
    }
    
    @GetMapping("/booking-form")
    @PreAuthorize("hasRole('STUDENT')")
    public String bookingForm(@RequestParam(required = false) Integer tutorId, Model model) {
        // Sử dụng Optional cơ bản với orElse
        Integer validTutorId = Optional.ofNullable(tutorId).orElse(0);
        String message = Optional.ofNullable(tutorId)
            .map(id -> "Đặt lịch học với gia sư ID: " + id)
            .orElse("Chọn gia sư để đặt lịch học");
        
        if (validTutorId > 0) {
            model.addAttribute("tutorId", validTutorId);
        }
        model.addAttribute("message", message);
        
        return "booking-form";
    }
    
    
    // TODO: Implement these features later when needed
    // @GetMapping("/messages")
    // @GetMapping("/students") 
    // @GetMapping("/reviews")
} 