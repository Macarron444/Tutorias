package com.tutorias.reservas.config;

import lombok.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

public class FeignClients {

    // Cliente para el microservicio de Catálogo (Laura - Node.js)
    @FeignClient(name = "catalogo-service", fallback = CatalogoClientFallback.class)
    public interface CatalogoClient {

        @GetMapping("/api/bloques/{bloqueId}/disponible")
        BloqueDisponibilidadDTO verificarBloqueDisponible(@PathVariable("bloqueId") Long bloqueId);

        @PutMapping("/api/bloques/{bloqueId}/bloquear")
        void bloquearBloque(@PathVariable("bloqueId") Long bloqueId);

        @PutMapping("/api/bloques/{bloqueId}/liberar")
        void liberarBloque(@PathVariable("bloqueId") Long bloqueId);

        @GetMapping("/api/materias/{materiaId}/activa")
        boolean verificarMateriaActiva(@PathVariable("materiaId") Long materiaId);
    }

    // Cliente para el microservicio de Usuarios (Elías - Python)
    @FeignClient(name = "usuarios-service", fallback = UsuariosClientFallback.class)
    public interface UsuariosClient {

        @GetMapping("/api/usuarios/{usuarioId}/existe")
        boolean verificarUsuarioExiste(@PathVariable("usuarioId") Long usuarioId);

        @GetMapping("/api/tutores/{tutorId}/tiene-materia")
        boolean verificarTutorTieneMateria(
                @PathVariable("tutorId") Long tutorId,
                @RequestParam("materiaId") Long materiaId);
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class BloqueDisponibilidadDTO {
        private Long id;
        private Long tutorId;
        private String diaSemana;
        private String horaInicio;
        private String horaFin;
        private String estado; // "LIBRE" o "RESERVADO"
    }

    // Fallback si el servicio de catálogo está caído
    public static class CatalogoClientFallback implements CatalogoClient {
        @Override public BloqueDisponibilidadDTO verificarBloqueDisponible(Long bloqueId) { return null; }
        @Override public void bloquearBloque(Long bloqueId) {}
        @Override public void liberarBloque(Long bloqueId) {}
        @Override public boolean verificarMateriaActiva(Long materiaId) { return false; }
    }

    // Fallback si el servicio de usuarios está caído
    public static class UsuariosClientFallback implements UsuariosClient {
        @Override public boolean verificarUsuarioExiste(Long usuarioId) { return false; }
        @Override public boolean verificarTutorTieneMateria(Long tutorId, Long materiaId) { return false; }
    }
}