package com.tutorias.reservas.repository;

import com.tutorias.reservas.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // RF08: Verificar si un bloque ya está reservado en esa fecha
    @Query("SELECT r FROM Reserva r WHERE r.bloqueDisponibilidadId = :bloqueId " +
           "AND r.fechaSesion = :fechaSesion AND r.estado = 'ACTIVA'")
    Optional<Reserva> findReservaActivaEnBloque(
            @Param("bloqueId") Long bloqueId,
            @Param("fechaSesion") LocalDate fechaSesion);

    // RF09: Próximas tutorías del estudiante
    @Query("SELECT r FROM Reserva r WHERE r.estudianteId = :estudianteId " +
           "AND r.fechaSesion >= :hoy AND r.estado = 'ACTIVA' ORDER BY r.fechaSesion ASC")
    List<Reserva> findProximasTutoriasEstudiante(
            @Param("estudianteId") Long estudianteId,
            @Param("hoy") LocalDate hoy);

    // RF09: Próximas tutorías del tutor
    @Query("SELECT r FROM Reserva r WHERE r.tutorId = :tutorId " +
           "AND r.fechaSesion >= :hoy AND r.estado = 'ACTIVA' ORDER BY r.fechaSesion ASC")
    List<Reserva> findProximasTutoriasTutor(
            @Param("tutorId") Long tutorId,
            @Param("hoy") LocalDate hoy);

    // RF12: Historial completo del estudiante
    @Query("SELECT r FROM Reserva r WHERE r.estudianteId = :estudianteId ORDER BY r.fechaSesion DESC")
    List<Reserva> findHistorialEstudiante(@Param("estudianteId") Long estudianteId);

    // RF11: Sesiones pasadas del tutor sin asistencia registrada
    @Query("SELECT r FROM Reserva r WHERE r.tutorId = :tutorId " +
           "AND r.fechaSesion < :hoy AND r.estado = 'ACTIVA'")
    List<Reserva> findSesionesPendientesAsistencia(
            @Param("tutorId") Long tutorId,
            @Param("hoy") LocalDate hoy);

    // Verificar reserva duplicada del mismo estudiante con el mismo tutor en la misma fecha
    @Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.estudianteId = :estudianteId " +
           "AND r.tutorId = :tutorId AND r.fechaSesion = :fechaSesion AND r.estado = 'ACTIVA'")
    boolean existeReservaDuplicada(
            @Param("estudianteId") Long estudianteId,
            @Param("tutorId") Long tutorId,
            @Param("fechaSesion") LocalDate fechaSesion);
}