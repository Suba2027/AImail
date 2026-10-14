package com.reachai.campaign;

import com.reachai.ai.AiPersonalizationService;
import com.reachai.campaign.dto.CampaignDTO;
import com.reachai.campaign.dto.CreateCampaignDTO;
import com.reachai.common.exception.ResourceNotFoundException;
import com.reachai.common.exception.UnauthorizedActionException;
import com.reachai.email.EmailJob;
import com.reachai.email.EmailJobRepository;
import com.reachai.lead.Lead;
import com.reachai.lead.LeadRepository;
import com.reachai.scheduler.EmailSchedulerService;
import com.reachai.user.User;
import com.reachai.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final EmailJobRepository emailJobRepository;
    private final EmailSchedulerService emailSchedulerService;
    private final AiPersonalizationService aiPersonalizationService;

    @Value("${app.email.min-delay-seconds:1}")
    private int minDelaySeconds;

    @Transactional
    public CampaignDTO createCampaign(CreateCampaignDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Campaign campaign = new Campaign();
        campaign.setUser(user);
        campaign.setName(dto.getName());
        campaign.setObjective(dto.getObjective());
        campaign.setStartTime(dto.getStartTime());
        campaign.setHourlyLimit(dto.getHourlyLimit());
        campaign.setDelaySeconds(dto.getDelaySeconds());
        campaign.setStatus("DRAFT");

        Campaign saved = campaignRepository.save(campaign);
        return CampaignDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public List<CampaignDTO> getCampaignsForUser(Long userId) {
        return campaignRepository.findByUserId(userId).stream()
                .map(CampaignDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CampaignDTO getCampaign(Long campaignId, Long userId) {
        Campaign campaign = getOwnedCampaign(campaignId, userId);
        return CampaignDTO.from(campaign);
    }

    @Transactional
    public CampaignDTO toggleImportant(Long campaignId, Long userId) {
        Campaign campaign = getOwnedCampaign(campaignId, userId);
        campaign.setImportant(!Boolean.TRUE.equals(campaign.getImportant()));
        Campaign saved = campaignRepository.save(campaign);
        return CampaignDTO.from(saved);
    }

    /**
     * Deletes a campaign along with its leads and email jobs. Any jobs
     * already sitting in the Redis delayed queue are left alone - when they
     * eventually mature, EmailJobProcessor looks them up by id, finds
     * nothing, logs it, and skips harmlessly. No separate queue cleanup is
     * needed for correctness.
     */
    @Transactional
    public void deleteCampaign(Long campaignId, Long userId) {
        Campaign campaign = getOwnedCampaign(campaignId, userId);

        emailJobRepository.deleteAll(emailJobRepository.findByCampaignId(campaignId));
        leadRepository.deleteAll(leadRepository.findByCampaignId(campaignId));
        campaignRepository.delete(campaign);

        log.info("Deleted campaign [{}] and its leads/email jobs", campaignId);
    }

    /**
     * Creates one EmailJob per lead (with AI-personalized or templated
     * content), staggers their scheduledAt times based on the campaign's
     * start time / delay / hourly limit, and pushes each into the Redis
     * delayed queue. This is the step that was completely missing from the
     * original frontend - uploading leads alone never triggered sending.
     */
    @Transactional
    public void scheduleCampaign(Long campaignId, Long userId) {
        Campaign campaign = getOwnedCampaign(campaignId, userId);

        if (!"DRAFT".equals(campaign.getStatus())) {
            throw new IllegalArgumentException(
                    "Campaign is already " + campaign.getStatus() + " - cannot schedule again.");
        }

        List<Lead> leads = leadRepository.findByCampaignId(campaignId);
        if (leads.isEmpty()) {
            throw new IllegalArgumentException("Cannot schedule a campaign with no leads.");
        }

        LocalDateTime baseTime = campaign.getStartTime() != null
                ? campaign.getStartTime()
                : LocalDateTime.now();

        // Effective per-email delay must respect BOTH the user-chosen delay
        // AND the hourly rate limit - whichever requires more spacing wins.
        // This is the first line of defense; the worker's RRateLimiter is the
        // second, authoritative one at send time.
        //
        // In plain terms: if hourlyLimit=100, that means "no more than one
        // email every 36 seconds" (3600 seconds / 100). If the user's chosen
        // delaySeconds is smaller than that (say, 5s), 36s wins anyway,
        // because otherwise we'd blow past the hourly limit almost
        // immediately. If delaySeconds is bigger than 36s, the user's own
        // choice wins instead, since they asked to go slower than required.
        double secondsPerEmailForRate = 3600.0 / campaign.getHourlyLimit();
        long effectiveDelaySeconds = Math.max(minDelaySeconds,
                Math.max(campaign.getDelaySeconds(), (long) Math.ceil(secondsPerEmailForRate)));

        long offset = 0;
        int scheduled = 0;
        for (Lead lead : leads) {
            var content = aiPersonalizationService.generate(campaign.getObjective(), lead);

            EmailJob job = new EmailJob();
            job.setCampaign(campaign);
            job.setLead(lead);
            job.setSubject(content.subject());
            job.setBody(content.body());
            job.setStatus("SCHEDULED");
            job.setAttemptCount(0);
            job.setIdempotencyKey(UUID.randomUUID().toString());
            LocalDateTime scheduledAt = baseTime.plusSeconds(offset);
            job.setScheduledAt(scheduledAt);

            EmailJob saved = emailJobRepository.save(job);
            emailSchedulerService.scheduleJob(saved.getId(), scheduledAt);

            lead.setStatus("QUEUED");
            leadRepository.save(lead);

            offset += effectiveDelaySeconds;
            scheduled++;
        }

        campaign.setStatus("SCHEDULED");
        campaignRepository.save(campaign);

        log.info("Scheduled {} emails for campaign [{}]", scheduled, campaignId);
    }

    private Campaign getOwnedCampaign(Long campaignId, Long userId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));
        if (!campaign.getUser().getId().equals(userId)) {
            throw new UnauthorizedActionException("You do not have access to this campaign");
        }
        return campaign;
    }
}
