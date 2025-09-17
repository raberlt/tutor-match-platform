package fsa.training.tutormatch.controller.api.student;

import fsa.training.tutormatch.service.SimpleIOService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/io-demo")
public class StudentIODemoController {

    @Autowired
    private SimpleIOService simpleIOService;

    // IO: Ghi log ra file bằng java.io
    @PostMapping("/log-io")
    public ResponseEntity<Map<String, Object>> writeIoLog(@RequestParam String category, @RequestParam String message) {
        simpleIOService.writeLogUsingIO(category, message);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Logged using java.io");
        return ResponseEntity.ok(resp);
    }

    // NIO: Upload 1 file
    @PostMapping("/upload-nio")
    public ResponseEntity<Map<String, Object>> uploadSingle(@RequestParam("file") MultipartFile file) {
        String path = simpleIOService.saveFileNio(file);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("path", path);
        return ResponseEntity.ok(resp);
    }

    // NIO + Concurrency: Upload nhiều file song song (ExecutorService + CompletableFuture)
    @PostMapping("/upload-multiple-async")
    public ResponseEntity<Map<String, Object>> uploadMultiple(@RequestParam("files") List<MultipartFile> files) {
        List<String> paths = simpleIOService.saveFilesNioAsync(files);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("uploaded", paths);
        return ResponseEntity.ok(resp);
    }

    // Đọc toàn bộ IO log (NIO read)
    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> readLogs() {
        String logs = simpleIOService.readIoLogs();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("logs", logs);
        return ResponseEntity.ok(resp);
    }
}




