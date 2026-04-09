package com.rspj.backend.bug;

import java.time.LocalDateTime;
import java.util.List;

public record BugEntryResponse(
        Long id,
        String title,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Severity severity,
        BugStatus status,
        String resolution,
        LocalDateTime resolvedAt,
        List<String> tags) {

    public static BugEntryResponse from(BugEntry bugEntry) {
        return new BugEntryResponse(
                bugEntry.getId(),
                bugEntry.getTitle(),
                bugEntry.getDescription(),
                bugEntry.getCreatedAt(),
                bugEntry.getUpdatedAt(),
                bugEntry.getSeverity() != null ? bugEntry.getSeverity() : Severity.MEDIUM,
                bugEntry.getStatus() != null ? bugEntry.getStatus() : BugStatus.OPEN,
                bugEntry.getResolution(),
                bugEntry.getResolvedAt(),
                bugEntry.getTags() == null
                        ? java.util.List.of()
                        : bugEntry.getTags().stream().map(Tag::getName).sorted().toList());
    }
}
