package com.rspj.backend.duck;

import java.util.List;

public record GroqChatRequest(
        String model,
        List<GroqMessage> messages,
        double temperature,
        int max_completion_tokens) {
}
