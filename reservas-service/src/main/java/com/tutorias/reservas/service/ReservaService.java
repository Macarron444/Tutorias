package com.tutorias.reservas.service;

import com.tutorias.reservas.config.FeignClients;
import com.tutorias.reservas.dto.ReservaDTO;
import com.tutorias.reservas.exception.BloqueNoDisponibleException;
import com.tutorias.reservas.exception.ReservaNotFoundException;
import com.tutorias.reservas.model.EstadoReserva;
import com.tutorias.reservas.model.Reserva;
import com.tutorias.reservas.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final FeignClients.CatalogoClient catalogoClient;
    private final FeignClients.UsuariosClient usuariosClient;

    @Transactional
    public ReservaDTO.ReservaResponse crearReserva(ReservaDTO.CrearReservaRequest request) {
        log.info("Creando reserva: estudiante={}, bloque={}, fecha={}",
                request.getEstudianteId(), request.getBloqueDisponibilidadId(), request.getFechaSesion());

        // 1. Verificar que el estudiante existe (microservicio de Elías)
        if (!usuariosClient.verificarUsuarioExiste(request.getEstudianteId())) {
            throw new IllegalArgumentException("El estudiante con ID " + request.getEstudianteId() + " no existe.");
        }

        // 2. Verificar que el tutor tiene la materia (microservicio de Elías)
        if (!usuariosClient.verificarTutorTieneMateria(request.getTutorId(), request.getMateriaId())) {
            throw new IllegalArgumentException("El tutor no tiene autorización para dictar esa materia.");
        }

        // 3. Verificar que el bloque está LIBRE (microservicio de Laura)
        FeignClients.BloqueDisponibilidadDTO bloque =
                catalogoClient.verificarBloqueDisponible(request.getBloqueDisponibilidadId());

        if (bloque == null) {
            throw new BloqueNoDisponibleException(
                    "El bloque no existe o el servicio de catálogo no está disponible.");
        }
        if (!"LIBRE".equals(bloque.getEstado())) {
            throw new BloqueNoDisponibleException(
                    "El bloque seleccionado ya está reservado. Elige otro horario.");
        }

        // 4. Doble verificación en BD propia (protección ante race conditions)
        Optional<Reserva> reservaExistente = reservaRepository
                .findReservaActivaEnBloque(request.getBloqueDisponibilidadId(), request.getFechaSesion());
        if (reservaExistente.isPresent()) {
            throw new BloqueNoDisponibleException(
                    "Ese horario acaba de ser reservado. Selecciona otro bloque.");
        }

        // 5. Verificar reserva duplicada del mismo estudiante con el mismo tutor ese día
        if (reservaRepository.existeReservaDuplicada(
                request.getEstudianteId(), request.getTutorId(), request.getFechaSesion())) {
            throw new BloqueNoDisponibleException(
                    "Ya tienes una tutoría agendada con este tutor en esa fecha.");
        }

        // 6. Guardar la reserva
        Reserva reserva = Reserva.builder()
                .estudianteId(request.getEstudianteId())
                .tutorId(request.getTutorId())
                .bloqueDisponibilidadId(request.getBloqueDisponibilidadId())
                .materiaId(request.getMateriaId())
                .fechaSesion(request.getFechaSesion())
                .estado(EstadoReserva.ACTIVA)
                .notasEstudiante(request.getNotasEstudiante())
                .build();

        Reserva guardada = reservaRepository.save(reserva);

        // 7. Notificar a catálogo que bloquee el slot
        try {
            catalogoClient.bloquearBloque(request.getBloqueDisponibilidadId());
        } catch (Exception e) {
            log.error("No se pudo bloquear el bloque en catálogo: {}", e.getMessage());
        }

        log.info("Reserva creada con ID={}", guardada.getId());
        return mapToResponse(guardada);
    }

    @Transactional
    public ReservaDTO.ReservaResponse cancelarReserva(Long reservaId, String estudianteId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new ReservaNotFoundException(reservaId));

        if (!reserva.getEstudianteId().equals(estudianteId)) {
            throw new IllegalArgumentException("No tienes permiso para cancelar esta reserva.");
        }
        if (reserva.getEstado() != EstadoReserva.ACTIVA) {
            throw new IllegalArgumentException(
                    "Solo se pueden cancelar reservas activas. Estado actual: " + reserva.getEstado());
        }
        if (reserva.getFechaSesion().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("No se puede cancelar una tutoría que ya pasó.");
        }

        reserva.setEstado(EstadoReserva.CANCELADA);
        Reserva actualizada = reservaRepository.save(reserva);

        try {
            catalogoClient.liberarBloque(reserva.getBloqueDisponibilidadId());
        } catch (Exception e) {
            log.error("No se pudo liberar el bloque en catálogo: {}", e.getMessage());
        }

        return mapToResponse(actualizada);
    }

    @Transactional
    public ReservaDTO.ReservaResponse registrarAsistencia(
            Long reservaId, String tutorId, EstadoReserva nuevoEstado) {

        if (nuevoEstado != EstadoReserva.COMPLETADA && nuevoEstado != EstadoReserva.INASISTENCIA) {
            throw new IllegalArgumentException("Solo se puede marcar COMPLETADA o INASISTENCIA.");
        }

        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new ReservaNotFoundException(reservaId));

        if (!reserva.getTutorId().equals(tutorId)) {
            throw new IllegalArgumentException("No tienes permiso para modificar esta reserva.");
        }
        if (reserva.getEstado() != EstadoReserva.ACTIVA) {
            throw new IllegalArgumentException("Solo se puede registrar asistencia en reservas activas.");
        }
        if (!reserva.getFechaSesion().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Solo puedes registrar asistencia de sesiones que ya ocurrieron.");
        }

        reserva.setEstado(nuevoEstado);
        return mapToResponse(reservaRepository.save(reserva));
    }

    @Transactional(readOnly = true)
    public List<ReservaDTO.ReservaResponse> getProximasTutoriasEstudiante(String estudianteId) {
        return reservaRepository.findProximasTutoriasEstudiante(estudianteId, LocalDate.now())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaDTO.ReservaResponse> getProximasTutoriasTutor(String tutorId) {
        return reservaRepository.findProximasTutoriasTutor(tutorId, LocalDate.now())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaDTO.ReservaResponse> getSesionesPendientesAsistencia(String tutorId) {
        return reservaRepository.findSesionesPendientesAsistencia(tutorId, LocalDate.now())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaDTO.ReservaResponse> getHistorialEstudiante(String estudianteId) {
        return reservaRepository.findHistorialEstudiante(estudianteId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservaDTO.ReservaResponse getReservaById(Long reservaId) {
        return mapToResponse(reservaRepository.findById(reservaId)
                .orElseThrow(() -> new ReservaNotFoundException(reservaId)));
    }

    private ReservaDTO.ReservaResponse mapToResponse(Reserva r) {
        return ReservaDTO.ReservaResponse.builder()
                .id(r.getId())
                .estudianteId(r.getEstudianteId())
                .tutorId(r.getTutorId())
                .bloqueDisponibilidadId(r.getBloqueDisponibilidadId())
                .materiaId(r.getMateriaId())
                .fechaSesion(r.getFechaSesion())
                .fechaCreacion(r.getFechaCreacion())
                .fechaHoraCreacion(r.getFechaHoraCreacion())
                .estado(r.getEstado())
                .notasEstudiante(r.getNotasEstudiante())
                .build();
    }
}