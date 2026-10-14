package com.reachai.campaign;

import com.reachai.auth.UserPrincipal;
import com.reachai.campaign.dto.CampaignDTO;
import com.reachai.campaign.dto.CreateCampaignDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignDTO createCampaign(@Valid @RequestBody CreateCampaignDTO dto,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        return campaignService.createCampaign(dto, principal.getId());
    }

    @GetMapping
    public List<CampaignDTO> getCampaigns(@AuthenticationPrincipal UserPrincipal principal) {
        return campaignService.getCampaignsForUser(principal.getId());
    }

    @GetMapping("/{id}")
    public CampaignDTO getCampaign(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return campaignService.getCampaign(id, principal.getId());
    }

    @PostMapping("/{id}/schedule")
    public void scheduleCampaign(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        campaignService.scheduleCampaign(id, principal.getId());
    }

    @PatchMapping("/{id}/star")
    public CampaignDTO toggleImportant(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return campaignService.toggleImportant(id, principal.getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCampaign(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        campaignService.deleteCampaign(id, principal.getId());
    }
}
