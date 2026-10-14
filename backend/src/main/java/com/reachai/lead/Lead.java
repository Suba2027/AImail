package com.reachai.lead;

import com.reachai.campaign.Campaign;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "leads")
@Data
@NoArgsConstructor
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String company;

    private String designation;

    /** IMPORTED -> QUEUED -> EMAILED */
    @Column(nullable = false)
    private String status = "IMPORTED";
}
