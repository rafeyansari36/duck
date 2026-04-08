package com.rspj.backend.bug;

public class BugNotFoundException extends RuntimeException {

    public BugNotFoundException(Long id) {
        super("Bug entry " + id + " was not found.");
    }
}
