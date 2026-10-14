package com.reachai.campaign.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateCampaignDTO {

    @NotBlank(message = "Campaign name is required")
    private String name;

    private String objective;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull
    @Min(value = 1, message = "Hourly limit must be at least 1")
    private Integer hourlyLimit;

    @NotNull
    @Min(value = 1, message = "Delay must be at least 1 second")
    private Integer delaySeconds;
}
