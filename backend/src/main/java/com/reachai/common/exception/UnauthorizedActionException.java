package com.reachai.common.exception;

/** Thrown when an authenticated user tries to access or modify a resource they don't own. */
public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) {
        super(message);
    }
}
