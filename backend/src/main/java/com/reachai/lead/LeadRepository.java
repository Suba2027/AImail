package com.reachai.lead;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByCampaignId(Long campaignId);
    Optional<Lead> findByCampaignIdAndEmail(Long campaignId, String email);
}
