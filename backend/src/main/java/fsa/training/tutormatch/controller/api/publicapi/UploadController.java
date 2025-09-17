package fsa.training.tutormatch.controller.api.publicapi;

import fsa.training.tutormatch.service.CloudinaryUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/upload")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"})
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryUploadService cloudinaryUploadService;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder
    ) {
        String url = cloudinaryUploadService.uploadImage(file, folder);
        return ResponseEntity.ok(java.util.Map.of("url", url));
    }
}


