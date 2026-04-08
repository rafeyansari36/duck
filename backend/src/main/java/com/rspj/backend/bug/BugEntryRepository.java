package com.rspj.backend.bug;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BugEntryRepository extends JpaRepository<BugEntry, Long> {

    List<BugEntry> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(
            String titleQuery,
            String descriptionQuery);
}
