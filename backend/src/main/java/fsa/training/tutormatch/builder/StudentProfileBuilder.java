package fsa.training.tutormatch.builder;

import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.User;
import java.sql.Timestamp;

public class StudentProfileBuilder {
    private StudentProfile profile;

    private StudentProfileBuilder(User user) {
        this.profile = new StudentProfile();
        this.profile.setUser(user);
        this.profile.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        this.profile.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
    }

    public static StudentProfileBuilder builderFor(User user) {
        return new StudentProfileBuilder(user);
    }

    public StudentProfileBuilder withLearningGoals(String learningGoals) {
        this.profile.setLearningGoals(learningGoals);
        return this;
    }

    public StudentProfileBuilder withPreferredSubjects(String preferredSubjects) {
        this.profile.setPreferredSubjects(preferredSubjects);
        return this;
    }

    public StudentProfileBuilder withLearningStyle(String learningStyle) {
        this.profile.setLearningStyle(learningStyle);
        return this;
    }

    public StudentProfileBuilder withBudget(Integer budgetMin, Integer budgetMax) {
        this.profile.setBudgetMin(budgetMin);
        this.profile.setBudgetMax(budgetMax);
        return this;
    }

    public StudentProfileBuilder withPreferredTimeSlots(String preferredTimeSlots) {
        this.profile.setPreferredTimeSlots(preferredTimeSlots);
        return this;
    }

    public StudentProfile build() {
        // Set default values if not provided
        if (profile.getLearningGoals() == null || profile.getLearningGoals().isEmpty()) {
            profile.setLearningGoals("General learning goals");
        }
        if (profile.getPreferredSubjects() == null || profile.getPreferredSubjects().isEmpty()) {
            profile.setPreferredSubjects("General subjects");
        }
        if (profile.getLearningStyle() == null || profile.getLearningStyle().isEmpty()) {
            profile.setLearningStyle("Interactive learning");
        }
        if (profile.getBudgetMin() == null) {
            profile.setBudgetMin(100000);
        }
        if (profile.getBudgetMax() == null) {
            profile.setBudgetMax(500000);
        }
        return profile;
    }
}
