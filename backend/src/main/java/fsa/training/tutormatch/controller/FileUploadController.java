package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:5173")
public class FileUploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File không được để trống"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận file ảnh"));
            }

            // Validate file size (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File ảnh không được vượt quá 10MB"));
            }

            String url = cloudinaryService.uploadImage(file, "tutormatch/avatars");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", url);
            response.put("message", "Upload ảnh đại diện thành công");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi khi upload file: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @PostMapping("/upload/cv")
    public ResponseEntity<?> uploadCV(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File không được để trống"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("application/pdf") && 
                !contentType.equals("application/msword") && 
                !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận file PDF, DOC, DOCX"));
            }

            // Validate file size (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File CV không được vượt quá 10MB"));
            }

            String url = cloudinaryService.uploadDocument(file, "tutormatch/cvs");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", url);
            response.put("message", "Upload CV thành công");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi khi upload file: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @PostMapping("/upload/certificate")
    public ResponseEntity<?> uploadCertificate(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File không được để trống"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận file ảnh"));
            }

            // Validate file size (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File ảnh không được vượt quá 10MB"));
            }

            String url = cloudinaryService.uploadImage(file, "tutormatch/certificates");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", url);
            response.put("message", "Upload chứng chỉ thành công");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi khi upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/upload/degree")
    public ResponseEntity<?> uploadDegree(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File không được để trống"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận file ảnh"));
            }

            // Validate file size (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File ảnh không được vượt quá 10MB"));
            }

            String url = cloudinaryService.uploadImage(file, "tutormatch/degrees");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", url);
            response.put("message", "Upload bằng cấp thành công");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi khi upload file: " + e.getMessage()));
        }
    }
}
