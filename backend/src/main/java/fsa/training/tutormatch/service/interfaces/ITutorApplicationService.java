package fsa.training.tutormatch.service.interfaces;

import fsa.training.tutormatch.dto.BecomeTutorRequest;
import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.Subject;

import java.util.List;
import java.util.Map;

public interface ITutorApplicationService {
    
    // Application management
    Profile submitTutorApplication(String studentUsername, BecomeTutorRequest request);
    Profile updateTutorApplication(String username, BecomeTutorRequest request);
    boolean cancelTutorApplication(String username);
    
    // Application status
    Map<String, Object> getApplicationStatus(String username);
    Map<String, Object> getApplicationDetails(String username);
    
    // Subject management
    List<Subject> getAllAvailableSubjects();
    
    // Validation
    boolean hasExistingApplication(String username);
    boolean canSubmitApplication(String username);
} 