package com.rspj.backend.bug;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Idempotent migration runner. Ensures the new columns and tag tables exist
 * even when {@code spring.jpa.hibernate.ddl-auto} is not honored in the
 * deployment environment (e.g. some managed Postgres providers override it
 * to {@code none} or {@code validate}). Runs before any JPA query that would
 * touch the new columns.
 */
@Component
@Order(0)
public class BugEntryBackfill implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(BugEntryBackfill.class);

    private final JdbcTemplate jdbcTemplate;

    public BugEntryBackfill(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) {
        ensureSchema();
        backfillDefaults();
    }

    private void ensureSchema() {
        log.info("Ensuring bug_entries schema is up to date");

        execute("ALTER TABLE bug_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP");
        execute("ALTER TABLE bug_entries ADD COLUMN IF NOT EXISTS severity VARCHAR(16)");
        execute("ALTER TABLE bug_entries ADD COLUMN IF NOT EXISTS status VARCHAR(16)");
        execute("ALTER TABLE bug_entries ADD COLUMN IF NOT EXISTS resolution VARCHAR(4000)");
        execute("ALTER TABLE bug_entries ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP");

        execute("""
                CREATE TABLE IF NOT EXISTS tags (
                    id BIGSERIAL PRIMARY KEY,
                    name VARCHAR(64) NOT NULL UNIQUE
                )
                """);

        execute("""
                CREATE TABLE IF NOT EXISTS bug_entry_tags (
                    bug_entry_id BIGINT NOT NULL REFERENCES bug_entries(id) ON DELETE CASCADE,
                    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
                    PRIMARY KEY (bug_entry_id, tag_id)
                )
                """);
    }

    private void backfillDefaults() {
        int severityFilled = jdbcTemplate.update(
                "UPDATE bug_entries SET severity = 'MEDIUM' WHERE severity IS NULL");
        int statusFilled = jdbcTemplate.update(
                "UPDATE bug_entries SET status = 'OPEN' WHERE status IS NULL");

        if (severityFilled > 0 || statusFilled > 0) {
            log.info("Backfilled defaults: severity={} rows, status={} rows",
                    severityFilled, statusFilled);
        }
    }

    private void execute(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ex) {
            log.warn("Schema migration step failed (continuing): {} -> {}", sql, ex.getMessage());
        }
    }
}
