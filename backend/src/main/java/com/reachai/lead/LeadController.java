package com.reachai.lead;

import com.reachai.auth.UserPrincipal;
import com.reachai.lead.dto.CSVImportResultDTO;
import com.reachai.lead.dto.LeadDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @PostMapping("/campaign/{campaignId}/upload")
    public CSVImportResultDTO uploadCsv(@PathVariable Long campaignId,
                                         @RequestParam("file") MultipartFile file,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        return leadService.uploadCsv(campaignId, principal.getId(), file);
    }

    @GetMapping("/campaign/{campaignId}")
    public List<LeadDTO> getLeads(@PathVariable Long campaignId,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        return leadService.getLeadsForCampaign(campaignId, principal.getId());
    }
}
