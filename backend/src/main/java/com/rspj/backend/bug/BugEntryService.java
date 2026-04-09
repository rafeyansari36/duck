package com.rspj.backend.bug;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BugEntryService {

    private final BugEntryRepository repository;
    private final TagRepository tagRepository;

    public BugEntryService(BugEntryRepository repository, TagRepository tagRepository) {
        this.repository = repository;
        this.tagRepository = tagRepository;
    }

    public BugEntryResponse create(BugEntryRequest request) {
        BugEntry bugEntry = new BugEntry(request.title().trim(), request.description().trim());
        applyMutableFields(bugEntry, request);
        return BugEntryResponse.from(repository.save(bugEntry));
    }

    @Transactional(readOnly = true)
    public List<BugEntryResponse> findAll(String query) {
        List<BugEntry> bugEntries;
        if (query == null || query.isBlank()) {
            bugEntries = repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            String normalizedQuery = query.trim();
            bugEntries = repository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(
                    normalizedQuery,
                    normalizedQuery);
        }

        return bugEntries.stream()
                .map(BugEntryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BugEntryResponse findById(Long id) {
        return BugEntryResponse.from(getBugEntry(id));
    }

    public BugEntryResponse update(Long id, BugEntryRequest request) {
        BugEntry bugEntry = getBugEntry(id);
        bugEntry.setTitle(request.title().trim());
        bugEntry.setDescription(request.description().trim());
        applyMutableFields(bugEntry, request);
        return BugEntryResponse.from(repository.save(bugEntry));
    }

    public void delete(Long id) {
        repository.delete(getBugEntry(id));
    }

    private BugEntry getBugEntry(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new BugNotFoundException(id));
    }

    private void applyMutableFields(BugEntry bugEntry, BugEntryRequest request) {
        if (request.severity() != null) {
            bugEntry.setSeverity(request.severity());
        }

        BugStatus previousStatus = bugEntry.getStatus();
        if (request.status() != null) {
            bugEntry.setStatus(request.status());
        }

        if (request.resolution() != null) {
            bugEntry.setResolution(request.resolution().isBlank() ? null : request.resolution().trim());
        }

        // Stamp resolvedAt the first time we move into RESOLVED; clear if moved out.
        if (bugEntry.getStatus() == BugStatus.RESOLVED) {
            if (previousStatus != BugStatus.RESOLVED || bugEntry.getResolvedAt() == null) {
                bugEntry.setResolvedAt(LocalDateTime.now());
            }
        } else {
            bugEntry.setResolvedAt(null);
        }

        if (request.tags() != null) {
            bugEntry.setTags(resolveTags(request.tags()));
        }
    }

    private Set<Tag> resolveTags(List<String> rawNames) {
        List<String> normalized = rawNames.stream()
                .filter(name -> name != null && !name.isBlank())
                .map(name -> name.trim().toLowerCase(Locale.ROOT))
                .distinct()
                .toList();

        if (normalized.isEmpty()) {
            return new HashSet<>();
        }

        Map<String, Tag> existing = tagRepository.findByNameIn(normalized).stream()
                .collect(Collectors.toMap(Tag::getName, Function.identity()));

        List<Tag> toCreate = new ArrayList<>();
        for (String name : normalized) {
            if (!existing.containsKey(name)) {
                toCreate.add(new Tag(name));
            }
        }
        if (!toCreate.isEmpty()) {
            tagRepository.saveAll(toCreate).forEach(tag -> existing.put(tag.getName(), tag));
        }

        return new HashSet<>(existing.values());
    }
}
