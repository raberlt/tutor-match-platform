package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/showLogin")
    public String showLoginForm() {
        return "login"; // Thymeleaf view
    }

    @GetMapping("/showRegister")
    public String showRegisterForm(Model model) {
        model.addAttribute("user", new User());
        return "register";
    }

    @PostMapping("/register")
public String registerUser(@ModelAttribute("user") @Valid User user,
                           BindingResult result,
                           Model model) {
    if (result.hasErrors()) {
        // In tất cả lỗi ra console
        result.getAllErrors().forEach(error -> {
            System.out.println("Validation error: " + error.getDefaultMessage());
        });

        return "register"; // Quay lại trang register kèm lỗi
    }

    userService.save(user);
    return "redirect:/showLogin?registered";
}


}
