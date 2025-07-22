package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.dto.TutorDTO;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.service.TutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Optional;

@Controller
public class TutorController {

    @Autowired
    private TutorService tutorService;
    @GetMapping("/tutor-search")
    public String tutorSearch(Model model) {
        List<User> tutors = tutorService.findAllTutors(); // hoặc repo query tùy bạn
        model.addAttribute("tutors", tutors);
        model.addAttribute("message", "Danh sách gia sư");

        return "tutor-search"; // trả về view tutor-search.html
    }

}
