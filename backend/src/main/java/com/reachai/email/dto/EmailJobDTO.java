package com.reachai.email.dto;

import com.reachai.email.EmailJob;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class EmailJobDTO {
    private Long id;
    private String leadEmail;
    private String subject;
    private String body;
    private LocalDateTime scheduledAt;
    private LocalDateTime sentAt;
    private String status;
    private Integer attemptCount;

    public static EmailJobDTO from(EmailJob job) {
        return new EmailJobDTO(
                job.getId(),
                job.getLead().getEmail(),
                job.getSubject(),
                job.getBody(),
                job.getScheduledAt(),
                job.getSentAt(),
                job.getStatus(),
                job.getAttemptCount()
        );
    }
}
