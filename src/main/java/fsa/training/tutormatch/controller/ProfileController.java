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
@RequestMapping("/profile-setup")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserService userService;

    @GetMapping
    public String showProfileForm(Model model, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOptional = userService.findByUsername(username);

        if (userOptional.isEmpty()) {
            return "redirect:/login";
        }

        User user = userOptional.get();

        Profile profile = profileService.findByTutorId(user.getId())
                .orElse(new Profile());

        model.addAttribute("profile", profile);
        return "profile-form";
    }

    @PostMapping
    public String saveProfile(@ModelAttribute("profile") Profile profile, Authentication authentication) {
        String username = authentication.getName();
        profileService.save(profile, username);
        return "redirect:/dashboard";
    }
}
