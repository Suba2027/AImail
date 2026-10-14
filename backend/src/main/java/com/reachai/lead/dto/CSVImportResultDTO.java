package com.reachai.lead.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CSVImportResultDTO {
    private int totalProcessed;
    private int validLeads;
    private int invalidEmails;
    private int duplicates;
}
