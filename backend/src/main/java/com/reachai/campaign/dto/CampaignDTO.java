package com.reachai.campaign.dto;

import com.reachai.campaign.Campaign;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CampaignDTO {
    private Long id;
    private String name;
    private String objective;
    private LocalDateTime startTime;
    private Integer hourlyLimit;
    private Integer delaySeconds;
    private String status;
    private Boolean important;
    private LocalDateTime createdAt;

    public static CampaignDTO from(Campaign c) {
        return new CampaignDTO(
                c.getId(), c.getName(), c.getObjective(), c.getStartTime(),
                c.getHourlyLimit(), c.getDelaySeconds(), c.getStatus(),
                c.getImportant(), c.getCreatedAt()
        );
    }
}
