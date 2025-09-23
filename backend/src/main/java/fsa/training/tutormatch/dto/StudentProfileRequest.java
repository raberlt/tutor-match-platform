package fsa.training.tutormatch.dto;

import fsa.training.tutormatch.enums.EducationLevel;
import fsa.training.tutormatch.enums.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentProfileRequest {
    
    // Personal information for admin approval
    private String firstName;
    private String lastName;
    private String imageAvatar;
    
    // Student-specific fields
    private EducationLevel educationLevel;
    
    // User info (can be updated directly)
    private LocalDate dateOfBirth;
    private Gender gender;
    private String phoneNumber;
    private String address;
    private String timezone;
}
