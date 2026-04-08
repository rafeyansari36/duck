package com.rspj.backend.duck;

import java.util.List;

public record DuckGroqPayload(
        List<String> questions,
        List<DuckLikelyCause> likelyCauses,
        List<String> debugPlan,
        List<String> suggestedFixes,
        List<String> testIdeas) {
}
