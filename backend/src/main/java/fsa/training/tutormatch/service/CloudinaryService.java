package fsa.training.tutormatch.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> params = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image",
                "transformation", "w_500,h_500,c_fill,q_auto"
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), params);
            String imageUrl = (String) result.get("secure_url");
            
            log.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;
        } catch (IOException e) {
            log.error("Error uploading image to Cloudinary: ", e);
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    public String uploadDocument(MultipartFile file, String folder) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> params = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "raw"
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), params);
            String documentUrl = (String) result.get("secure_url");
            
            log.info("Document uploaded successfully: {}", documentUrl);
            return documentUrl;
        } catch (IOException e) {
            log.error("Error uploading document to Cloudinary: ", e);
            throw new RuntimeException("Failed to upload document", e);
        }
    }

    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Image deleted successfully: {}", publicId);
        } catch (Exception e) {
            log.error("Error deleting image from Cloudinary: ", e);
        }
    }
}