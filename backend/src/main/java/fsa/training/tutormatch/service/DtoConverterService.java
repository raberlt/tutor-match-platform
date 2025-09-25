package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.enums.UserRole;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class DtoConverterService {
    
    public Map<String, Object> convertToUserMap(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("username", user.getUsername());
        dto.put("email", user.getEmail());
        dto.put("firstName", user.getFirstName());
        dto.put("lastName", user.getLastName());
        dto.put("role", user.getRole());
        // dto.put("enabled", user.isEnabled()); // enabled field removed
        dto.put("createdAt", user.getCreatedAt());
        dto.put("updatedAt", user.getUpdatedAt());
        return dto;
    }
    
    public Map<String, Object> convertToTutorProfileMap(TutorProfile profile) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", profile.getId());
        dto.put("bio", profile.getBio());
        dto.put("headline", profile.getHeadline());
        dto.put("experience", profile.getExperience());
        dto.put("fees", profile.getFees());
        // teachingLevel field removed
        dto.put("ratePointAverage", profile.getRatePointAverage());
        dto.put("totalPoint", profile.getTotalPoint());
        dto.put("videoIntro", profile.getVideoIntro());
        return dto;
    }
    
    
    public User convertMapToUser(Map<String, Object> dto) {
        User user = new User();
        user.setId((Integer) dto.get("id"));
        user.setUsername((String) dto.get("username"));
        user.setEmail((String) dto.get("email"));
        user.setFirstName((String) dto.get("firstName"));
        user.setLastName((String) dto.get("lastName"));
        user.setRole((UserRole) dto.get("role"));
        // user.setEnabled((Boolean) dto.get("enabled")); // enabled field removed
        return user;
    }
}
