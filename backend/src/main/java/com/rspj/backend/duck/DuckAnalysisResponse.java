package com.rspj.backend.duck;

import java.util.List;

public record DuckAnalysisResponse(
        List<String> questions,
        List<DuckLikelyCause> likelyCauses,
        List<String> debugPlan,
        List<String> suggestedFixes,
        List<String> testIdeas,
        String source) {
}
