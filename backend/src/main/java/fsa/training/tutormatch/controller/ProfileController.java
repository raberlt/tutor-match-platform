package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.entity.BaseProfile;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.service.interfaces.IProfileService;
import fsa.training.tutormatch.service.interfaces.IUserService;
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
    private IProfileService profileService;

    @Autowired
    private IUserService userService;

    @GetMapping
    public String showProfileForm(Model model, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOptional = userService.findByUsername(username);

        if (userOptional.isEmpty()) {
            return "redirect:/login";
        }

        User user = userOptional.get();

        BaseProfile profile = profileService.findByUserId(user.getId())
                .orElseGet(() -> {
                    if (user.getRole() == User.Role.TUTOR) {
                        return new TutorProfile(); // Nếu là tutor thì tạo profile tutor
                    } else {
                        return new StudentProfile(); // Nếu là student thì tạo profile student
                    }
                });

        model.addAttribute("profile", profile);
        return "profile-form";
    }

    @PostMapping
    public String saveProfile(@ModelAttribute("profile") BaseProfile profile, Authentication authentication) {
        String username = authentication.getName();
        profileService.save(profile, username);
        return "redirect:/dashboard";
    }

}
