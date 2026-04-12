package com.tutorias.reservas.dto;

import com.tutorias.reservas.model.EstadoReserva;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservaDTO {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CrearReservaRequest {

        @NotNull(message = "El ID del estudiante es obligatorio")
        private String estudianteId;

        @NotNull(message = "El ID del tutor es obligatorio")
        private String tutorId;

        @NotNull(message = "El ID del bloque de disponibilidad es obligatorio")
        private Long bloqueDisponibilidadId;

        @NotNull(message = "El ID de la materia es obligatorio")
        private String materiaId;

        @NotNull(message = "La fecha de la sesión es obligatoria")
        @Future(message = "La fecha de la sesión debe ser en el futuro")
        private LocalDate fechaSesion;

        private String notasEstudiante;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReservaResponse {
        private Long id;
        private String estudianteId;
        private String tutorId;
        private Long bloqueDisponibilidadId;
        private String materiaId;
        private LocalDate fechaSesion;
        private LocalDate fechaCreacion;
        private LocalDateTime fechaHoraCreacion;
        private EstadoReserva estado;
        private String notasEstudiante;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegistrarAsistenciaRequest {
        @NotNull(message = "El estado es obligatorio")
        private EstadoReserva estado;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse<T> {
        private boolean success;
        private String mensaje;
        private T data;

        public static <T> ApiResponse<T> ok(String mensaje, T data) {
            return ApiResponse.<T>builder().success(true).mensaje(mensaje).data(data).build();
        }

        public static <T> ApiResponse<T> error(String mensaje) {
            return ApiResponse.<T>builder().success(false).mensaje(mensaje).data(null).build();
        }
    }
}