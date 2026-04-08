package com.rspj.backend.duck;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/duck")
public class DuckQuestionController {

    private final DuckQuestionService service;

    public DuckQuestionController(DuckQuestionService service) {
        this.service = service;
    }

    @PostMapping("/analysis")
    public DuckAnalysisResponse generateAnalysis(@Valid @RequestBody DuckQuestionRequest request) {
        return service.generateAnalysis(request);
    }

    @PostMapping("/questions")
    public DuckAnalysisResponse generateQuestions(@Valid @RequestBody DuckQuestionRequest request) {
        return service.generateAnalysis(request);
    }
}
