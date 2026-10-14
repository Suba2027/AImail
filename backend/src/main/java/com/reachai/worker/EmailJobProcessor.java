package com.reachai.worker;

import com.reachai.email.EmailJob;
import com.reachai.email.EmailJobRepository;
import com.reachai.email.SmtpEmailService;
import com.reachai.scheduler.EmailSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * IMPORTANT: this logic lives in its OWN Spring bean, separate from
 * EmailWorkerService. @Transactional only works when the method is called
 * from a DIFFERENT bean, going through Spring's proxy - calling it from
 * within the same class (self-invocation) silently skips the transaction,
 * which causes LazyInitializationException on job.getLead(). This was a
 * real bug hit during development; keep this split.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailJobProcessor {

    private static final int[] BACKOFF_SECONDS = {10, 30, 60};
    private static final String RATE_LIMITER_PREFIX = "rate-limiter:campaign:";
    private static final String LOCK_PREFIX = "email-job-lock:";

    private final EmailJobRepository emailJobRepository;
    private final SmtpEmailService smtpEmailService;
    private final RedissonClient redissonClient;
    private final EmailSchedulerService emailSchedulerService;

    @Value("${app.email.max-retry-attempts:3}")
    private int maxRetryAttempts;

    /**
     * This is the single most important method in the whole project - it's
     * what actually turns a queued job into a sent (or failed) email. Read
     * it as five checkpoints a job must pass through, in order:
     *
     *   1. Already finished? (SENT/CANCELLED/FAILED) -> stop, nothing to do.
     *   2. Get the lock. If another worker already grabbed this exact job,
     *      back off instead of sending the same email twice.
     *   3. Re-check status now that we actually hold the lock (it might have
     *      changed while we were waiting for it).
     *   4. Are we over the campaign's hourly limit? If so, push this job an
     *      hour into the future and stop - don't count it as a failure.
     *   5. Actually send it. Success -> SENT. Failure -> handleFailure()
     *      decides whether to retry with backoff or give up for good.
     */
    @Transactional
    public void processJob(Long jobId) {
        Optional<EmailJob> jobOpt = emailJobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            log.warn("EmailJob [{}] not found in DB. Skipping.", jobId);
            return;
        }
        EmailJob job = jobOpt.get();

        // Idempotency fast-path: if it's already terminal, nothing to do.
        if ("SENT".equals(job.getStatus()) || "CANCELLED".equals(job.getStatus())
                || "FAILED".equals(job.getStatus())) {
            log.info("EmailJob [{}] already has terminal status {}. Skipping.", jobId, job.getStatus());
            return;
        }

        // Distributed lock keyed by idempotencyKey: prevents two workers (or two
        // instances of this app) from processing the same job concurrently, even
        // if it somehow got double-enqueued (e.g. after a restart reconciliation).
        RLock lock = redissonClient.getLock(LOCK_PREFIX + job.getIdempotencyKey());
        boolean locked = false;
        try {
            locked = lock.tryLock(5, 30, TimeUnit.SECONDS); // wait 5s, auto-release after 30s
            if (!locked) {
                log.warn("Could not acquire lock for EmailJob [{}], another worker is handling it. Skipping.", jobId);
                return;
            }

            // Re-check status now that we hold the lock - it may have changed
            // while we were waiting.
            job = emailJobRepository.findById(jobId).orElse(null);
            if (job == null || "SENT".equals(job.getStatus()) || "CANCELLED".equals(job.getStatus())
                    || "FAILED".equals(job.getStatus())) {
                return;
            }

            // Non-blocking rate limit check, scoped per campaign.
            Long campaignId = job.getCampaign().getId();
            Integer hourlyLimit = job.getCampaign().getHourlyLimit();
            RRateLimiter rateLimiter = redissonClient.getRateLimiter(RATE_LIMITER_PREFIX + campaignId);
            rateLimiter.trySetRate(RateType.OVERALL, hourlyLimit, 1, RateIntervalUnit.HOURS);

            if (!rateLimiter.tryAcquire()) {
                // Rate limit hit: push the job to the next window WITHOUT counting
                // this as a failed attempt - it was never actually tried.
                log.info("Hourly rate limit reached for campaign [{}]. Rescheduling EmailJob [{}] for next window.",
                        campaignId, jobId);
                emailSchedulerService.scheduleJob(jobId, LocalDateTime.now().plusHours(1));
                return;
            }

            log.info("Processing EmailJob [{}]", jobId);
            job.setStatus("PROCESSING");
            job.setAttemptCount(job.getAttemptCount() + 1);
            emailJobRepository.save(job);

            try {
                boolean success = smtpEmailService.sendEmail(
                        job.getLead().getEmail(), job.getSubject(), job.getBody());

                if (success) {
                    job.setStatus("SENT");
                    job.setSentAt(LocalDateTime.now());
                    emailJobRepository.save(job);
                } else {
                    handleFailure(job);
                }
            } catch (Exception e) {
                log.error("Unexpected error sending EmailJob [{}]", jobId, e);
                handleFailure(job);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Interrupted while waiting for lock on EmailJob [{}]", jobId);
        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    private void handleFailure(EmailJob job) {
        int attempt = job.getAttemptCount();
        if (attempt <= maxRetryAttempts) {
            int backoffIndex = Math.min(attempt - 1, BACKOFF_SECONDS.length - 1);
            int delaySeconds = BACKOFF_SECONDS[backoffIndex];
            job.setStatus("RETRYING");
            emailJobRepository.save(job);
            emailSchedulerService.scheduleJob(job.getId(), LocalDateTime.now().plusSeconds(delaySeconds));
            log.info("EmailJob [{}] failed (attempt {}). Retrying in {}s.", job.getId(), attempt, delaySeconds);
        } else {
            job.setStatus("FAILED");
            emailJobRepository.save(job);
            log.warn("EmailJob [{}] permanently FAILED after {} attempts.", job.getId(), attempt);
        }
    }
}
