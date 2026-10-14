package com.reachai.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reachai.lead.Lead;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

/**
 * Generates a personalized email subject + opening line per lead, based on
 * the campaign's stated objective and the lead's own name/company/designation.
 *
 * This mirrors ReachInbox's actual "single prompt -> personalized sequences"
 * pitch, which is the strongest AI angle for this project.
 *
 * Falls back to a plain templated email (no AI call) if app.ai.enabled=false
 * or no API key is configured, so the rest of the pipeline never depends on
 * having a live AI key to function.
 */
@Service
@Slf4j
public class AiPersonalizationService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ai.enabled:false}")
    private boolean aiEnabled;

    @Value("${app.ai.provider-api-key:}")
    private String apiKey;

    @Value("${app.ai.model:gpt-4o-mini}")
    private String model;

    @Value("${app.ai.api-url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    public AiPersonalizationService() {
        this.webClient = WebClient.builder().build();
    }

    public record PersonalizedContent(String subject, String body) {}

    public PersonalizedContent generate(String campaignObjective, Lead lead) {
        // Local providers (e.g. Ollama) typically need no API key at all -
        // only aiEnabled gates whether we attempt the call.
        if (!aiEnabled) {
            return fallback(campaignObjective, lead);
        }

        try {
            String prompt = buildPrompt(campaignObjective, lead);

            Map<String, Object> requestBody = new java.util.HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", new Object[]{
                    Map.of("role", "system", "content",
                            "You write short, personalized cold outreach emails. " +
                            "Respond ONLY with a JSON object shaped exactly like " +
                            "{\"subject\": \"...\", \"body\": \"...\"} and nothing else - " +
                            "no markdown, no code fences, no explanation before or after it. " +
                            "Keep the body under 120 words, friendly and specific to the lead."),
                    Map.of("role", "user", "content", prompt)
            });
            requestBody.put("temperature", 0.7);
            // Honored by OpenAI and by Ollama's OpenAI-compatible endpoint;
            // silently ignored by providers that don't support it.
            requestBody.put("response_format", Map.of("type", "json_object"));

            WebClient.RequestBodySpec request = webClient.post()
                    .uri(apiUrl)
                    .header("Content-Type", "application/json");
            if (apiKey != null && !apiKey.isBlank()) {
                request.header("Authorization", "Bearer " + apiKey);
            }

            String response = request
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            return parseResponse(response, campaignObjective, lead);

        } catch (Exception e) {
            log.warn("AI personalization failed for lead {}, falling back to template: {}",
                    lead.getEmail(), e.getMessage());
            return fallback(campaignObjective, lead);
        }
    }

    private String buildPrompt(String objective, Lead lead) {
        return String.format(
                "Campaign objective: %s%nLead name: %s%nCompany: %s%nDesignation: %s%n" +
                "Write a personalized cold outreach email subject and body for this lead.",
                objective != null ? objective : "General outreach",
                lead.getName(), lead.getCompany(), lead.getDesignation()
        );
    }

    private PersonalizedContent parseResponse(String rawResponse, String objective, Lead lead) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            JsonNode parsed = objectMapper.readTree(content);
            String subject = parsed.path("subject").asText();
            String body = parsed.path("body").asText();
            if (subject.isBlank() || body.isBlank()) {
                return fallback(objective, lead);
            }
            return new PersonalizedContent(subject, body);
        } catch (Exception e) {
            log.warn("Could not parse AI response, falling back to template: {}", e.getMessage());
            return fallback(objective, lead);
        }
    }

    private PersonalizedContent fallback(String objective, Lead lead) {
        String subject = "Quick question for " + (lead.getCompany() != null ? lead.getCompany() : "you");
        String body = String.format(
                "Hi %s,%n%nI wanted to reach out regarding: %s.%n%nWould you be open to a quick chat?%n%nBest,%nReachAI",
                lead.getName() != null && !lead.getName().isBlank() ? lead.getName() : "there",
                objective != null && !objective.isBlank() ? objective : "an opportunity that might interest you"
        );
        return new PersonalizedContent(subject, body);
    }
}
