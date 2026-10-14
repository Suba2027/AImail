package com.reachai.lead.dto;

import com.reachai.lead.Lead;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeadDTO {
    private Long id;
    private String name;
    private String email;
    private String company;
    private String designation;
    private String status;

    public static LeadDTO from(Lead lead) {
        return new LeadDTO(lead.getId(), lead.getName(), lead.getEmail(),
                lead.getCompany(), lead.getDesignation(), lead.getStatus());
    }
}
