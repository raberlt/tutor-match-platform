package fsa.training.tutormatch.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class DotenvConfig {

    @PostConstruct
    public void loadEnv() {
        try {
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
            
            // Set system properties for environment variables
            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
            
            System.out.println("Environment variables loaded from .env file");
        } catch (Exception e) {
            System.err.println("Could not load .env file: " + e.getMessage());
        }
    }
}
