package com.reachai.email;

import com.reachai.campaign.Campaign;
import com.reachai.campaign.CampaignRepository;
import com.reachai.common.exception.ResourceNotFoundException;
import com.reachai.common.exception.UnauthorizedActionException;
import com.reachai.email.dto.EmailJobDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailJobService {

    private final EmailJobRepository emailJobRepository;
    private final CampaignRepository campaignRepository;

    @Transactional(readOnly = true)
    public List<EmailJobDTO> getJobsForCampaign(Long campaignId, Long userId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));
        if (!campaign.getUser().getId().equals(userId)) {
            throw new UnauthorizedActionException("You do not have access to this campaign");
        }
        return emailJobRepository.findByCampaignId(campaignId).stream()
                .map(EmailJobDTO::from)
                .collect(Collectors.toList());
    }
}
