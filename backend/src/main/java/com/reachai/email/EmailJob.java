package com.reachai.email;

import com.reachai.campaign.Campaign;
import com.reachai.lead.Lead;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_jobs")
@Data
@NoArgsConstructor
public class EmailJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    private LocalDateTime scheduledAt;

    private LocalDateTime sentAt;

    /** SCHEDULED -> PROCESSING -> SENT | RETRYING -> FAILED | CANCELLED */
    @Column(nullable = false)
    private String status;

    private Integer attemptCount = 0;

    @Column(unique = true, nullable = false)
    private String idempotencyKey;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
