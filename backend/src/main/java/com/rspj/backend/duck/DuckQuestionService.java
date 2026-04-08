package com.rspj.backend.duck;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class DuckQuestionService {

    private static final String SYSTEM_PROMPT = """
            You are a pragmatic debugging copilot.
            Return STRICT JSON only with these keys:
            questions: array of exactly 3 short clarifying questions
            likelyCauses: array of 3 objects with keys cause and confidence
            debugPlan: array of 4-6 actionable debugging steps
            suggestedFixes: array of 2-4 likely fixes
            testIdeas: array of 3-5 targeted regression test ideas
            Keep each list item concise and concrete.
            """;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String groqApiKey;
    private final String groqApiUrl;

    public DuckQuestionService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${groq.api.key}") String groqApiKey,
            @Value("${groq.api.url}") String groqApiUrl) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
        this.groqApiKey = groqApiKey;
        this.groqApiUrl = groqApiUrl;
    }

    public DuckAnalysisResponse generateAnalysis(DuckQuestionRequest request) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            return fallbackAnalysis(request, "fallback");
        }

        try {
            GroqChatRequest payload = new GroqChatRequest(
                    "llama-3.3-70b-versatile",
                    List.of(
                            new GroqMessage("system", SYSTEM_PROMPT),
                            new GroqMessage(
                                    "user",
                                    "Bug title: " + request.title().trim()
                                            + "\nBug description: " + request.description().trim())),
                    0.2,
                    500);

            GroqChatResponse response = restClient.post()
                    .uri(groqApiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + groqApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(GroqChatResponse.class);

            DuckGroqPayload parsed = parseGroqPayload(response);
            if (parsed != null && isValid(parsed)) {
                return new DuckAnalysisResponse(
                        parsed.questions(),
                        parsed.likelyCauses(),
                        parsed.debugPlan(),
                        parsed.suggestedFixes(),
                        parsed.testIdeas(),
                        "groq");
            }
        } catch (RuntimeException ignored) {
        }

        return fallbackAnalysis(request, "fallback");
    }

    private DuckGroqPayload parseGroqPayload(GroqChatResponse response) {
        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            return null;
        }

        String content = response.choices().get(0).message() == null
                ? ""
                : response.choices().get(0).message().content();

        if (content.isBlank()) {
            return null;
        }

        String cleaned = cleanJson(content);

        try {
            return objectMapper.readValue(cleaned, DuckGroqPayload.class);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String cleanJson(String content) {
        String trimmed = content.trim();
        if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
            int firstNewLine = trimmed.indexOf('\n');
            if (firstNewLine > -1) {
                trimmed = trimmed.substring(firstNewLine + 1, trimmed.length() - 3).trim();
            }
        }
        return trimmed;
    }

    private boolean isValid(DuckGroqPayload payload) {
        return payload.questions() != null
                && payload.questions().size() == 3
                && payload.likelyCauses() != null
                && !payload.likelyCauses().isEmpty()
                && payload.debugPlan() != null
                && !payload.debugPlan().isEmpty()
                && payload.suggestedFixes() != null
                && !payload.suggestedFixes().isEmpty()
                && payload.testIdeas() != null
                && !payload.testIdeas().isEmpty();
    }

    private DuckAnalysisResponse fallbackAnalysis(DuckQuestionRequest request, String source) {
        String title = request.title().trim();
        List<String> questions = List.of(
                "What exact result did you expect, and what happened instead?",
                "What changed right before this bug started showing up in " + title + "?",
                "What is the smallest repeatable set of steps that triggers this issue?");

        List<DuckLikelyCause> likelyCauses = List.of(
                new DuckLikelyCause("State or data is stale between user action and UI render", "High"),
                new DuckLikelyCause("An unchecked null/undefined value is breaking one path", "Medium"),
                new DuckLikelyCause("Backend validation or contract mismatch on one input shape", "Medium"));

        List<String> debugPlan = List.of(
                "Reproduce with the smallest deterministic steps and capture exact input values.",
                "Check browser/server logs for the first failing line and request payload.",
                "Compare expected vs actual API response shape for the failing path.",
                "Add temporary guard logs around state transitions to find where data diverges.",
                "Patch the failing branch, then rerun the same reproduction steps.");

        List<String> suggestedFixes = List.of(
                "Add defensive checks around nullable fields before rendering or mapping.",
                "Normalize request/response DTOs so the UI and backend use one stable contract.",
                "Fail fast with user-friendly validation errors for missing required fields.");

        List<String> testIdeas = new ArrayList<>();
        testIdeas.add("Add one backend integration test for the failing payload shape.");
        testIdeas.add("Add one frontend test for the exact reproduction steps and expected state.");
        testIdeas.add("Add a regression test covering the null/empty edge case that caused the bug.");

        return new DuckAnalysisResponse(
                questions,
                likelyCauses,
                debugPlan,
                suggestedFixes,
                testIdeas,
                source);
    }
}
