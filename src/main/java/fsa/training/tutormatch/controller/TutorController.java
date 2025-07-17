package fsa.training.tutormatch.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/tutor")
public class TutorController {

    @GetMapping("/dashboard")
    public String tutorDashboard() {
        return "tutor/tutor-dashboard";
    }
}
