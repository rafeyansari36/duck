package com.rspj.backend.bug;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bugs")
public class BugEntryController {

    private final BugEntryService service;

    public BugEntryController(BugEntryService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<BugEntryResponse> create(@Valid @RequestBody BugEntryRequest request) {
        BugEntryResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/bugs/" + created.id())).body(created);
    }

    @GetMapping
    public List<BugEntryResponse> findAll(@RequestParam(required = false) String q) {
        return service.findAll(q);
    }

    @GetMapping("/{id}")
    public BugEntryResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public BugEntryResponse update(@PathVariable Long id, @Valid @RequestBody BugEntryRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
