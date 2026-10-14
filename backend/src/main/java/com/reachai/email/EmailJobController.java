package com.reachai.email;

import com.reachai.auth.UserPrincipal;
import com.reachai.email.dto.EmailJobDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/email-jobs")
@RequiredArgsConstructor
public class EmailJobController {

    private final EmailJobService emailJobService;

    @GetMapping("/campaign/{campaignId}")
    public List<EmailJobDTO> getJobsForCampaign(@PathVariable Long campaignId,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return emailJobService.getJobsForCampaign(campaignId, principal.getId());
    }
}
