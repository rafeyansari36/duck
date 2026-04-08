package com.rspj.backend.bug;

import java.time.LocalDateTime;

public record BugEntryResponse(
        Long id,
        String title,
        String description,
        LocalDateTime createdAt) {

    public static BugEntryResponse from(BugEntry bugEntry) {
        return new BugEntryResponse(
                bugEntry.getId(),
                bugEntry.getTitle(),
                bugEntry.getDescription(),
                bugEntry.getCreatedAt());
    }
}
