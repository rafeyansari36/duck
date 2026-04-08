package com.rspj.backend.bug;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BugEntryService {

    private final BugEntryRepository repository;

    public BugEntryService(BugEntryRepository repository) {
        this.repository = repository;
    }

    public BugEntryResponse create(BugEntryRequest request) {
        BugEntry bugEntry = new BugEntry(request.title().trim(), request.description().trim());
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
        return BugEntryResponse.from(repository.save(bugEntry));
    }

    public void delete(Long id) {
        repository.delete(getBugEntry(id));
    }

    private BugEntry getBugEntry(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new BugNotFoundException(id));
    }
}
