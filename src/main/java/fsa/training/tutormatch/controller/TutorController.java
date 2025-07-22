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
    public String tutorSearch(
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "minFee", required = false) Integer minFee,
            @RequestParam(value = "maxFee", required = false) Integer maxFee,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            Model model) {
        
        List<TutorDTO> tutors = tutorService.findAllTutorDTOs();
        
        // Temporary: Add some mock subjects for dropdown
        List<String> allSubjects = List.of("Tiếng Anh", "Toán", "IELTS", "TOEIC", "Cambridge");
        
        model.addAttribute("tutors", tutors);
        model.addAttribute("allSubjects", allSubjects);
        model.addAttribute("currentSubject", subject);
        model.addAttribute("currentMinFee", minFee);
        model.addAttribute("currentMaxFee", maxFee);
        model.addAttribute("currentKeyword", keyword);
        model.addAttribute("currentSortBy", sortBy);
        model.addAttribute("message", "Danh sách gia sư");
        
        return "tutor-search"; // trả về view tutor-search.html
    }

}
