package com.tutorias.reservas.config;

import lombok.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

public class FeignClients {

    // URL fija al contenedor de Python (Elías)
    @FeignClient(name = "usuarios-service", url = "${servicios.usuarios-url}", fallback = CatalogoClientFallback.class)
    public interface UsuariosClient {

        @GetMapping("/api/usuarios/{usuarioId}/existe")
        boolean verificarUsuarioExiste(@PathVariable("usuarioId") String usuarioId);

        @GetMapping("/api/tutores/{tutorId}/tiene-materia")
        boolean verificarTutorTieneMateria(
                @PathVariable("tutorId") String tutorId,
                @RequestParam("materiaId") String materiaId);
    }

    // URL fija al contenedor de Node.js (Laura)
    @FeignClient(name = "catalogo-service", url = "${servicios.catalogo-url}", fallback = CatalogoClientFallback.class)
    public interface CatalogoClient {

        @GetMapping("/api/bloques/{bloqueId}/disponible")
        BloqueDisponibilidadDTO verificarBloqueDisponible(
                @PathVariable("bloqueId") Long bloqueId);

        @PutMapping("/api/bloques/{bloqueId}/bloquear")
        void bloquearBloque(@PathVariable("bloqueId") Long bloqueId);

        @PutMapping("/api/bloques/{bloqueId}/liberar")
        void liberarBloque(@PathVariable("bloqueId") Long bloqueId);

        @GetMapping("/api/materias/{materiaId}/activa")
        boolean verificarMateriaActiva(@PathVariable("materiaId") String materiaId);
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class BloqueDisponibilidadDTO {
        private Long id;
        private String tutorId;
        private String diaSemana;
        private String horaInicio;
        private String horaFin;
        @com.fasterxml.jackson.annotation.JsonProperty("fecha_inicio")
        private String fechaInicio;
        @com.fasterxml.jackson.annotation.JsonProperty("fecha_fin")
        private String fechaFin;
        private String estado;
    }

    public static class CatalogoClientFallback implements CatalogoClient {
        @Override public BloqueDisponibilidadDTO verificarBloqueDisponible(Long bloqueId) { return null; }
        @Override public void bloquearBloque(Long bloqueId) {}
        @Override public void liberarBloque(Long bloqueId) {}
        @Override public boolean verificarMateriaActiva(String materiaId) { return false; }
    }

    public static class UsuariosClientFallback implements UsuariosClient {
        @Override public boolean verificarUsuarioExiste(String usuarioId) { return false; }
        @Override public boolean verificarTutorTieneMateria(String tutorId, String materiaId) { return false; }
    }
}