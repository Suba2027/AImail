package com.reachai.scheduler;

import com.reachai.email.EmailJob;
import com.reachai.email.EmailJobRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RDelayedQueue;
import org.redisson.api.RBlockingQueue;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailSchedulerService {

    public static final String QUEUE_NAME = "email-jobs-blocking-queue";

    private final RedissonClient redissonClient;
    private final EmailJobRepository emailJobRepository;

    /**
     * Push a job onto the Redis-backed delayed queue. It will only become
     * available to workers once its delay elapses - this is the "no cron"
     * scheduling mechanism the project requires.
     */
    public void scheduleJob(Long jobId, LocalDateTime scheduledAt) {
        RBlockingQueue<Long> blockingQueue = redissonClient.getBlockingQueue(QUEUE_NAME);
        RDelayedQueue<Long> delayedQueue = redissonClient.getDelayedQueue(blockingQueue);

        long delayMillis = Math.max(0,
                Duration.between(LocalDateTime.now(), scheduledAt).toMillis());

        delayedQueue.offer(jobId, delayMillis, TimeUnit.MILLISECONDS);
        log.info("Scheduled EmailJob [{}] to run in {} seconds", jobId, delayMillis / 1000);
    }

    /**
     * Reconciliation: if Redis lost its state (restart with no persistence,
     * container recreated, etc.) while jobs were still SCHEDULED or RETRYING
     * in the database, those jobs would otherwise never fire again. On every
     * application startup, re-enqueue anything that's still pending so no
     * campaign silently stalls.
     */
    @PostConstruct
    public void reconcileOnStartup() {
        List<EmailJob> pending = emailJobRepository.findByStatusIn(List.of("SCHEDULED", "RETRYING"));

        if (pending.isEmpty()) {
            log.info("Startup reconciliation: no pending email jobs to re-enqueue.");
            return;
        }

        log.info("Startup reconciliation: re-enqueuing {} pending email job(s).", pending.size());
        for (EmailJob job : pending) {
            LocalDateTime target = job.getScheduledAt() != null ? job.getScheduledAt() : LocalDateTime.now();
            scheduleJob(job.getId(), target);
        }
    }
}
