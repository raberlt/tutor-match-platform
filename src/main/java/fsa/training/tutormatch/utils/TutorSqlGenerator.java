package fsa.training.tutormatch.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;

public class TutorSqlGenerator {

    public static void main(String[] args) throws IOException {
        String jsonFilePath = "src/main/java/fsa/training/tutormatch/utils/tutor.json"; // Đường dẫn file JSON

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(new File(jsonFilePath));

        StringBuilder userSql = new StringBuilder("INSERT INTO users (username, password, first_name, last_name, email, role) VALUES\n");
        StringBuilder profileSql = new StringBuilder("INSERT INTO profiles (tutor_id, bio, headline, experience, teaching_level, fees) VALUES\n");

        int count = 1; // Đếm số tutor để đặt tutor_id giả lập

        for (JsonNode tutor : root.get("data")) {
            // Thông tin user
            String username = "tutor" + String.format("%02d", count);
            String password = "$2a$10$DI7oF.FLpOhEY5w8275FAuvcWW4gS93xG16jaGpeR2.EzhxgRVMhi"; // Mật khẩu đã mã hóa
            String firstName = tutor.get("firstName").asText().replace("'", "''");
            String lastName = tutor.get("lastName").asText().replace("'", "''");
            String email = tutor.get("emailAddress").asText();

            userSql.append(String.format("('%s', '%s', '%s', '%s', '%s', 'TUTOR'),\n",
                    username, password, firstName, lastName, email));

            // Thông tin profile
            String bio = sanitizeText(tutor.get("bio").asText());
            String headline = sanitizeText(tutor.get("headline").asText());
            String experience = sanitizeText(tutor.get("experience").asText());
            String teachingLevel = sanitizeText(tutor.get("teachingLevel").asText());

            JsonNode tutorApp = tutor.get("tutorApplication");
            int fees = tutorApp != null && tutorApp.has("rate") ? tutorApp.get("rate").asInt() : 0;

            profileSql.append(String.format("(%d, '%s', '%s', '%s', '%s', %d),\n",
                    count, bio, headline, experience, teachingLevel, fees));

            count++;
        }

        // Xóa dấu phẩy cuối và thêm dấu ;
        userSql.setLength(userSql.length() - 2);
        userSql.append(";\n");

        profileSql.setLength(profileSql.length() - 2);
        profileSql.append(";\n");

        System.out.println("=== SQL for users ===");
        System.out.println(userSql);
        System.out.println("=== SQL for profiles ===");
        System.out.println(profileSql);
    }

    private static String sanitizeText(String text) {
        return text.replace("'", "''").replace("\n", " ").trim();
    }
}
