package com.reachai.email.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateEmailJobDTO {
    @NotNull(message = "Campaign ID is required")
    private Long campaignId;

    @NotNull(message = "Lead ID is required")
    private Long leadId;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;

    private LocalDateTime scheduledAt;
    private String idempotencyKey;
}
