package fsa.training.tutormatch.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/tutor")
public class TutorController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('TUTOR')")
    public String dashboard(Model model) {
        return "tutor-dashboard";
    }

    @GetMapping("/schedule")
    @PreAuthorize("hasRole('TUTOR')")
    public String schedule(Model model) {
        return "teaching-schedule";
    }

    @GetMapping("/students")
    @PreAuthorize("hasRole('TUTOR')")
    public String students(Model model) {
        return "tutor-students";
    }

    @GetMapping("/reviews")
    @PreAuthorize("hasRole('TUTOR')")
    public String reviews(Model model) {
        return "tutor-reviews";
    }
}
