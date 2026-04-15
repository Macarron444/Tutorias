package com.tutorias.reservas.exception;

import com.tutorias.reservas.dto.ReservaDTO;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ReservaNotFoundException.class)
    public ResponseEntity<ReservaDTO.ApiResponse<Void>> handleNotFound(ReservaNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ReservaDTO.ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BloqueNoDisponibleException.class)
    public ResponseEntity<ReservaDTO.ApiResponse<Void>> handleBloqueNoDisponible(BloqueNoDisponibleException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ReservaDTO.ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ReservaDTO.ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        System.out.println("ERROR 400 - IllegalArgumentException: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ReservaDTO.ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ReservaDTO.ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errores = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ReservaDTO.ApiResponse.error("Validación fallida: " + errores));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ReservaDTO.ApiResponse<Void>> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ReservaDTO.ApiResponse.error("Error interno: " + ex.getMessage()));
    }
}