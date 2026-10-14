package com.reachai.email;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmailJobRepository extends JpaRepository<EmailJob, Long> {
    List<EmailJob> findByCampaignId(Long campaignId);

    /**
     * Reconciliation query: jobs still pending (SCHEDULED or RETRYING) that
     * should have been picked up by the delayed queue but might not be there
     * (e.g. Redis lost state on restart). Used at startup to re-enqueue
     * anything stuck, regardless of whether their scheduled time is in the
     * past or future.
     */
    List<EmailJob> findByStatusIn(List<String> statuses);
}
