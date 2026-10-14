package com.reachai.campaign;

import com.reachai.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "campaigns")
@Data
@NoArgsConstructor
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String objective;

    private LocalDateTime startTime;

    @Column(nullable = false)
    private Integer hourlyLimit;

    @Column(nullable = false)
    private Integer delaySeconds;

    /** DRAFT -> SCHEDULED -> COMPLETED (or FAILED) */
    @Column(nullable = false)
    private String status = "DRAFT";

    @Column(nullable = false)
    private Boolean important = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
