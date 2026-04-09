package com.rspj.backend.bug;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Backfills severity and status on rows that pre-date those columns.
 * Hibernate ddl-auto=update adds the columns as NULL for existing rows;
 * this populates sensible defaults so the API never returns nulls.
 */
@Component
public class BugEntryBackfill implements CommandLineRunner {

    private final BugEntryRepository repository;

    public BugEntryBackfill(BugEntryRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        for (BugEntry entry : repository.findAll()) {
            boolean dirty = false;
            if (entry.getSeverity() == null) {
                entry.setSeverity(Severity.MEDIUM);
                dirty = true;
            }
            if (entry.getStatus() == null) {
                entry.setStatus(BugStatus.OPEN);
                dirty = true;
            }
            if (dirty) {
                repository.save(entry);
            }
        }
    }
}
