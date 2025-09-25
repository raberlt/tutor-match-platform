package fsa.training.tutormatch.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping
    public String test() {
        return "Backend is running!";
    }
    
    @GetMapping("/users")
    public Map<String, Object> testUsers() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Test users API");
        response.put("users", new Object[0]);
        return response;
    }
    
    @GetMapping("/admin-users")
    public Map<String, Object> testAdminUsers() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Test admin users API");
        response.put("users", new Object[0]);
        return response;
    }
}
