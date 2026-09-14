package com.crisisweave.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CascadeEvent {
    private int hourOffset;
    private String serviceAffected;
    private String impactDescription;
    private String severity;
    private int probabilityPercent;
    private String recommendedAction;
}
