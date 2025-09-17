package fsa.training.tutormatch.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/student")
public class StudentController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public String dashboard(Model model) {
        return "student-dashboard";
    }

    @GetMapping("/my-sessions")
    @PreAuthorize("hasRole('STUDENT')")
    public String mySessions(Model model) {
        return "my-sessions";
    }

    @GetMapping("/booking-form")
    @PreAuthorize("hasRole('STUDENT')")
    public String bookingForm(@RequestParam(required = false) Integer tutorId, Model model) {
        if (tutorId != null) {
            model.addAttribute("tutorId", tutorId);
    }
        return "booking-form";
    }
}
