package fsa.training.tutormatch.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;

@Service
public class CloudinaryUploadService {

    @Value("${cloudinary.cloud_name}")
    private String cloudName;

    @Value("${cloudinary.api_key}")
    private String apiKey;

    @Value("${cloudinary.api_secret}")
    private String apiSecret;

    @Value("${cloudinary.folder:tutor-match}")
    private String defaultFolder;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadImage(MultipartFile file, String folder) {
        // Kiểm tra cấu hình, nếu thiếu thì báo lỗi rõ ràng khi gọi upload
        if (isBlank(cloudName) || isBlank(apiKey) || isBlank(apiSecret)) {
            throw new IllegalStateException("Thiếu cấu hình Cloudinary. Vui lòng đặt CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
        }
        if (folder == null || folder.isBlank()) {
            folder = defaultFolder;
        }

        long timestamp = Instant.now().getEpochSecond();

        // Signature string: folder=<folder>&timestamp=<timestamp><api_secret>
        String toSign = String.format("folder=%s&timestamp=%d%s", folder, timestamp, apiSecret);
        String signature = sha1Hex(toSign);

        String url = String.format("https://api.cloudinary.com/v1_1/%s/image/upload", cloudName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", file.getResource());
        body.add("api_key", apiKey);
        body.add("timestamp", String.valueOf(timestamp));
        body.add("signature", signature);
        body.add("folder", folder);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        var response = restTemplate.postForObject(url, requestEntity, java.util.Map.class);

        if (response == null || (!response.containsKey("secure_url") && !response.containsKey("url"))) {
            throw new RuntimeException("Upload Cloudinary thất bại: không có URL trả về");
        }

        Object secureUrl = response.get("secure_url");
        if (secureUrl instanceof String s && !s.isBlank()) {
            return s;
        }
        Object urlField = response.get("url");
        if (urlField instanceof String s2 && !s2.isBlank()) {
            return s2;
        }
        throw new RuntimeException("Upload Cloudinary thất bại: URL rỗng");
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static String sha1Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo chữ ký SHA-1", e);
        }
    }
}


