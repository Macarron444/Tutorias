package com.tutorias.reservas.controller;

import com.tutorias.reservas.dto.ReservaDTO;
import com.tutorias.reservas.model.EstadoReserva;
import com.tutorias.reservas.service.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    // RF07: Agendar tutoría
    @PostMapping
    public ResponseEntity<ReservaDTO.ApiResponse<ReservaDTO.ReservaResponse>> crearReserva(
            @Valid @RequestBody ReservaDTO.CrearReservaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ReservaDTO.ApiResponse.ok("Tutoría agendada exitosamente.", reservaService.crearReserva(request)));
    }

    // Obtener reserva por ID
    @GetMapping("/{id}")
    public ResponseEntity<ReservaDTO.ApiResponse<ReservaDTO.ReservaResponse>> getReserva(@PathVariable Long id) {
        return ResponseEntity.ok(ReservaDTO.ApiResponse.ok("Reserva encontrada.", reservaService.getReservaById(id)));
    }

    // RF10: Cancelar reserva
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ReservaDTO.ApiResponse<ReservaDTO.ReservaResponse>> cancelarReserva(
            @PathVariable Long id, @RequestParam Long estudianteId) {
        return ResponseEntity.ok(ReservaDTO.ApiResponse.ok(
                "Tutoría cancelada. El bloque ha sido liberado.", reservaService.cancelarReserva(id, estudianteId)));
    }

    // RF11: Registrar asistencia
    @PatchMapping("/{id}/asistencia")
    public ResponseEntity<ReservaDTO.ApiResponse<ReservaDTO.ReservaResponse>> registrarAsistencia(
            @PathVariable Long id,
            @RequestParam Long tutorId,
            @Valid @RequestBody ReservaDTO.RegistrarAsistenciaRequest request) {
        return ResponseEntity.ok(ReservaDTO.ApiResponse.ok(
                "Asistencia registrada.", reservaService.registrarAsistencia(id, tutorId, request.getEstado())));
    }

    // RF09: Próximas tutorías del estudiante
    @GetMapping("/estudiante/{estudianteId}/proximas")
    public ResponseEntity<ReservaDTO.ApiResponse<List<ReservaDTO.ReservaResponse>>> getProximasEstudiante(
            @PathVariable Long estudianteId) {
        return ResponseEntity.ok(ReservaDTO.ApiResponse.ok(
                "Próximas tutorías.", reservaService.getProximasTutoriasEstudiante(estudianteId)));
    }

    // RF12: Historial del estudiante
    @GetMapping("/estudiante/{estudianteId}/historial")
    public ResponseEntity<ReservaDTO.ApiResponse<List<ReservaDTO.ReservaResponse>>> getHistorial(
            @PathVariable Long estudianteId) {
        return ResponseEntity.ok(ReservaDTO.ApiResponse.ok(
                "Historial.", reservaService.getHistorialEstudiante(estudianteId)));
    }

    // RF09: Próximas tutorías del tutor
    @GetMapping("/tutor/{tutorId}/proximas")
    public ResponseEntity<ReservaDTO.ApiResponse<List<ReservaDTO.ReservaResponse>>> getProximasTutor(
            @PathVariable Long tutorId) {
        return ResponseEntity.ok(ReservaDTO.ApiResponse.ok(
                "Próximas tutorías del tutor.", reservaService.getProximasTutoriasTutor(tutorId)));
    }

    // RF11: Sesiones del tutor pendientes de asistencia
    @GetMapping("/tutor/{tutorId}/pendientes-asistencia")
    public ResponseEntity<ReservaDTO.ApiResponse<List<ReservaDTO.ReservaResponse>>> getPendientes(
            @PathVariable Long tutorId) {
        return ResponseEntity.ok(ReservaDTO.ApiResponse.ok(
                "Sesiones pendientes.", reservaService.getSesionesPendientesAsistencia(tutorId)));
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("reservas-service OK");
    }
}