package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.service.ProfileService;
import fsa.training.tutormatch.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserService userService;

    @GetMapping("/profile-setup")
    public String showProfileForm(Model model, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOptional = userService.findByUsername(username);
        Profile profile = new Profile();

        if (userOptional.isPresent() && userOptional.get().getProfile() != null) {
            profile = userOptional.get().getProfile();
        }

        model.addAttribute("profile", profile);
        return "profile-form";

    }

    @PostMapping("/profile-setup")
    public String saveProfile(@ModelAttribute("profile") Profile profile, Authentication authentication) {
        String username = authentication.getName();
        profileService.save(profile, username);
        return "redirect:/dashboard";
    }
}
