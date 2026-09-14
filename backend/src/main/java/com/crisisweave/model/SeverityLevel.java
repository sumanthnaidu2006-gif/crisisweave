package com.crisisweave.model;

import lombok.Getter;

@Getter
public enum SeverityLevel {
    LOW(1),
    MODERATE(2),
    HIGH(3),
    CRITICAL(4),
    CATASTROPHIC(5);

    private final int score;

    SeverityLevel(int score) {
        this.score = score;
    }
}
