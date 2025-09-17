package fsa.training.tutormatch.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    
    @Size(max = 20, message = "Số điện thoại không được quá 20 ký tự")
    @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;
    
    @Size(max = 255, message = "Địa chỉ không được quá 255 ký tự")
    private String addressLine1;
    
    @Size(max = 100, message = "Trình độ học vấn không được quá 100 ký tự")
    private String educationLevel;
    
    @Size(max = 255, message = "Trường đại học không được quá 255 ký tự")
    private String university;
    
    @Size(max = 255, message = "Chuyên ngành không được quá 255 ký tự")
    private String major;
    
    @Size(max = 100, message = "Thành phố không được quá 100 ký tự")
    private String city;
    
    private String dateOfBirth; // Format: YYYY-MM-DD
    
    private String gender; // MALE, FEMALE, OTHER
    
    // Thông tin cá nhân cơ bản (có thể update)
    @Size(max = 50, message = "Họ không được quá 50 ký tự")
    private String firstName;
    
    @Size(max = 50, message = "Tên không được quá 50 ký tự")
    private String lastName;
    
    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được quá 100 ký tự")
    private String email;
    
    // Cho TUTOR
    @Size(max = 2000, message = "Bio không được quá 2000 ký tự")
    private String bio;
    
    @Size(max = 200, message = "Headline không được quá 200 ký tự")
    private String headline;
    
    @Size(max = 2000, message = "Teaching level không được quá 2000 ký tự")
    private String teachingLevel;
    
    private Integer fees; // Học phí cho tutor
    
    private String experience; // Số năm kinh nghiệm
} 