package com.reachai.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String name;

    @Column(name = "google_id", unique = true)
    private String googleId;

    private String avatar;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
