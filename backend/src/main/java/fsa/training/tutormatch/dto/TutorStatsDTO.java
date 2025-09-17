package fsa.training.tutormatch.dto;

import lombok.Data;

@Data
public class TutorStatsDTO {
    private int todayClasses;
    private int pendingRequests;
    private int upcomingClasses;
    private String monthlyEarnings;
} 