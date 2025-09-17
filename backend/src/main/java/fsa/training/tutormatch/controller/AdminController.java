package fsa.training.tutormatch.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public String dashboard(Model model) {
        return "admin/admin-dashboard";
    }

    @GetMapping("/tutor-applications")
    @PreAuthorize("hasRole('ADMIN')")
    public String tutorApplications(Model model) {
        return "admin/tutor-applications";
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public String users(Model model) {
        return "admin/users";
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public String bookings(Model model) {
        return "admin/bookings";
    }

    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public String payments(Model model) {
        return "admin/payments";
    }

    @GetMapping("/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public String reports(Model model) {
        return "admin/reports";
    }
}
