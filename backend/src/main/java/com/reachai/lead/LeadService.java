package com.reachai.lead;

import com.reachai.campaign.Campaign;
import com.reachai.campaign.CampaignRepository;
import com.reachai.common.exception.ResourceNotFoundException;
import com.reachai.common.exception.UnauthorizedActionException;
import com.reachai.lead.dto.CSVImportResultDTO;
import com.reachai.lead.dto.LeadDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeadService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$");

    private final LeadRepository leadRepository;
    private final CampaignRepository campaignRepository;

    @Transactional
    public CSVImportResultDTO uploadCsv(Long campaignId, Long userId, MultipartFile file) {
        Campaign campaign = getOwnedCampaign(campaignId, userId);

        Set<String> existingEmails = leadRepository.findByCampaignId(campaignId).stream()
                .map(l -> l.getEmail().toLowerCase())
                .collect(Collectors.toCollection(HashSet::new));

        int totalProcessed = 0;
        int validLeads = 0;
        int invalidEmails = 0;
        int duplicates = 0;

        try (CSVParser parser = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreSurroundingSpaces(true)
                .build()
                .parse(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            for (CSVRecord record : parser) {
                totalProcessed++;
                String email = safeGet(record, "email");
                String name = safeGet(record, "name");
                String company = safeGet(record, "company");
                String designation = safeGet(record, "designation");

                if (email == null || email.isBlank() || !EMAIL_PATTERN.matcher(email).matches()) {
                    invalidEmails++;
                    continue;
                }

                String normalizedEmail = email.toLowerCase();
                if (existingEmails.contains(normalizedEmail)) {
                    duplicates++;
                    continue;
                }

                Lead lead = new Lead();
                lead.setCampaign(campaign);
                lead.setEmail(email);
                lead.setName(name != null ? name : "");
                lead.setCompany(company);
                lead.setDesignation(designation);
                lead.setStatus("IMPORTED");
                leadRepository.save(lead);

                existingEmails.add(normalizedEmail);
                validLeads++;
            }
        } catch (IOException e) {
            log.error("Failed to parse CSV for campaign {}", campaignId, e);
            throw new IllegalArgumentException("Could not parse CSV file: " + e.getMessage());
        }

        return new CSVImportResultDTO(totalProcessed, validLeads, invalidEmails, duplicates);
    }

    @Transactional(readOnly = true)
    public List<LeadDTO> getLeadsForCampaign(Long campaignId, Long userId) {
        getOwnedCampaign(campaignId, userId);
        return leadRepository.findByCampaignId(campaignId).stream()
                .map(LeadDTO::from)
                .collect(Collectors.toList());
    }

    private Campaign getOwnedCampaign(Long campaignId, Long userId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));
        if (!campaign.getUser().getId().equals(userId)) {
            throw new UnauthorizedActionException("You do not have access to this campaign");
        }
        return campaign;
    }

    private String safeGet(CSVRecord record, String column) {
        try {
            String value = record.get(column);
            return value != null ? value.trim() : null;
        } catch (IllegalArgumentException e) {
            return null; // column not present in this CSV
        }
    }
}
