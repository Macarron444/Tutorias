package com.tutorias.reservas.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID del estudiante - viene del microservicio de Elías
    @Column(name = "estudiante_id", nullable = false)
    private Long estudianteId;

    // ID del tutor - viene del microservicio de Elías
    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    // ID del bloque de disponibilidad - viene del microservicio de Laura
    @Column(name = "bloque_disponibilidad_id", nullable = false)
    private Long bloqueDisponibilidadId;

    // ID de la materia - viene del microservicio de Laura
    @Column(name = "materia_id", nullable = false)
    private Long materiaId;

    @Column(name = "fecha_sesion", nullable = false)
    private LocalDate fechaSesion;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;

    @Column(name = "fecha_hora_creacion", nullable = false)
    private LocalDateTime fechaHoraCreacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoReserva estado;

    @Column(name = "notas_estudiante", length = 500)
    private String notasEstudiante;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDate.now();
        this.fechaHoraCreacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = EstadoReserva.ACTIVA;
        }
    }
}