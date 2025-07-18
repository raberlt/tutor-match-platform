package fsa.training.tutormatch.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    
    @GetMapping("/")
    public String home() {
        return "index";
    }
    
    @GetMapping("/tutor-search")
    public String tutorSearch() {
        return "tutor-search";
    }
    
    @GetMapping("/become-tutor")
    public String becomeTutor() {
        return "become-tutor";
    }
    
    // Routes cho Student
    @GetMapping("/messages")
    public String messages() {
        return "messages";
    }
    
    @GetMapping("/my-sessions")
    public String mySessions() {
        return "my-sessions";
    }
    
    // Routes cho Tutor
    @GetMapping("/teaching-schedule")
    public String teachingSchedule() {
        return "teaching-schedule";
    }
    
    @GetMapping("/students")
    public String students() {
        return "students";
    }
    
    @GetMapping("/reviews")
    public String reviews() {
        return "reviews";
    }
    
    // Routes chung
    @GetMapping("/profile")
    public String profile() {
        return "profile";
    }
    
    @GetMapping("/settings")
    public String settings() {
        return "settings";
    }
    
    @GetMapping("/debug")
    public String debug() {
        return "debug";
    }
} 