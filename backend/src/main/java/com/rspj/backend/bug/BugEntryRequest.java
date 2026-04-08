package com.rspj.backend.bug;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BugEntryRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 120, message = "Title must be 120 characters or fewer")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 4000, message = "Description must be 4000 characters or fewer")
        String description) {
}
