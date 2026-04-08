package com.rspj.backend.common;

import java.time.LocalDateTime;
import java.util.List;

public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        List<String> details) {
}
