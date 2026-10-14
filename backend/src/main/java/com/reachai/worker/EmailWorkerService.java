package com.reachai.worker;

import com.reachai.scheduler.EmailSchedulerService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBlockingQueue;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailWorkerService {

    private final RedissonClient redissonClient;
    private final EmailJobProcessor emailJobProcessor; // separate bean - see its class doc

    @Value("${app.email.worker-concurrency:5}")
    private int workerConcurrency;

    private ExecutorService executorService;
    private volatile boolean isRunning = true;

    @PostConstruct
    public void startWorkers() {
        log.info("Starting Email Workers with concurrency = {}", workerConcurrency);
        executorService = Executors.newFixedThreadPool(workerConcurrency);

        RBlockingQueue<Long> blockingQueue = redissonClient.getBlockingQueue(EmailSchedulerService.QUEUE_NAME);

        for (int i = 0; i < workerConcurrency; i++) {
            executorService.submit(() -> {
                while (isRunning) {
                    try {
                        Long jobId = blockingQueue.take(); // blocks until a job matures
                        emailJobProcessor.processJob(jobId); // cross-bean call: proxy applies
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("Worker thread interrupted, shutting down.");
                        break;
                    } catch (Exception e) {
                        log.error("Unexpected error in worker loop", e);
                    }
                }
            });
        }
    }

    @PreDestroy
    public void stopWorkers() {
        isRunning = false;
        if (executorService != null) {
            executorService.shutdownNow();
        }
    }
}
