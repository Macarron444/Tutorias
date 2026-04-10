package com.tutorias.reservas.exception;

public class BloqueNoDisponibleException extends RuntimeException {
    public BloqueNoDisponibleException(String message) {
        super(message);
    }
}