package fsa.training.tutormatch.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import jakarta.annotation.PreDestroy;

@Service
public class SimpleIOService {

    private static final String UPLOAD_DIR = "uploads";
    private static final String IO_LOG_FILE = "io.log";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final ExecutorService executorService = Executors.newFixedThreadPool(4);

    public SimpleIOService() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory", e);
        }
    }

    // NIO: Save single file
    public String saveFileNio(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        try {
            Path destination = Paths.get(UPLOAD_DIR).resolve(file.getOriginalFilename()).normalize();
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return destination.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + file.getOriginalFilename(), e);
        }
    }

    // NIO + Concurrency: Save multiple files in parallel using CompletableFuture
    public List<String> saveFilesNioAsync(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        List<CompletableFuture<String>> futures = new ArrayList<>();
        for (MultipartFile file : files) {
            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> saveFileNio(file), executorService);
            futures.add(future);
        }

        CompletableFuture<Void> all = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
        all.join();

        return futures.stream().map(CompletableFuture::join).collect(Collectors.toList());
    }

    // IO (java.io): Append log line to file
    public void writeLogUsingIO(String category, String message) {
        String timestamp = LocalDateTime.now().format(FORMATTER);
        String line = String.format("[%s] [%s] %s%n", timestamp, category, message);
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(IO_LOG_FILE, true))) {
            writer.write(line);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write IO log", e);
        }
    }

    // NIO read all logs
    public String readIoLogs() {
        try {
            Path logPath = Paths.get(IO_LOG_FILE);
            if (!Files.exists(logPath)) {
                return "";
            }
            return Files.readString(logPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read IO log", e);
        }
    }

    @PreDestroy
    public void shutdown() {
        executorService.shutdown();
    }
}




