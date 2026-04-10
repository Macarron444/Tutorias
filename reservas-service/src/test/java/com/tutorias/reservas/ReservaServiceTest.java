package com.tutorias.reservas;

import com.tutorias.reservas.config.FeignClients;
import com.tutorias.reservas.dto.ReservaDTO;
import com.tutorias.reservas.exception.BloqueNoDisponibleException;
import com.tutorias.reservas.model.EstadoReserva;
import com.tutorias.reservas.model.Reserva;
import com.tutorias.reservas.repository.ReservaRepository;
import com.tutorias.reservas.service.ReservaService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock private ReservaRepository reservaRepository;
    @Mock private FeignClients.CatalogoClient catalogoClient;
    @Mock private FeignClients.UsuariosClient usuariosClient;
    @InjectMocks private ReservaService reservaService;

    private ReservaDTO.CrearReservaRequest requestValido;
    private FeignClients.BloqueDisponibilidadDTO bloqueLibre;

    @BeforeEach
    void setUp() {
        requestValido = ReservaDTO.CrearReservaRequest.builder()
                .estudianteId(1L).tutorId(2L).bloqueDisponibilidadId(10L)
                .materiaId(5L).fechaSesion(LocalDate.now().plusDays(3))
                .notasEstudiante("Tengo dudas en integrales").build();

        bloqueLibre = new FeignClients.BloqueDisponibilidadDTO(10L, 2L, "LUNES", "14:00", "16:00", "LIBRE");
    }

    @Test
    @DisplayName("RF07: Crear reserva exitosamente")
    void crearReserva_exitoso() {
        when(usuariosClient.verificarUsuarioExiste(1L)).thenReturn(true);
        when(usuariosClient.verificarTutorTieneMateria(2L, 5L)).thenReturn(true);
        when(catalogoClient.verificarBloqueDisponible(10L)).thenReturn(bloqueLibre);
        when(reservaRepository.findReservaActivaEnBloque(anyLong(), any())).thenReturn(Optional.empty());
        when(reservaRepository.existeReservaDuplicada(anyLong(), anyLong(), any())).thenReturn(false);

        Reserva guardada = Reserva.builder().id(1L).estudianteId(1L).tutorId(2L)
                .bloqueDisponibilidadId(10L).materiaId(5L)
                .fechaSesion(requestValido.getFechaSesion())
                .fechaCreacion(LocalDate.now()).estado(EstadoReserva.ACTIVA).build();
        when(reservaRepository.save(any())).thenReturn(guardada);

        ReservaDTO.ReservaResponse response = reservaService.crearReserva(requestValido);

        assertNotNull(response);
        assertEquals(EstadoReserva.ACTIVA, response.getEstado());
        verify(catalogoClient).bloquearBloque(10L);
    }

    @Test
    @DisplayName("RF08: Bloque ocupado lanza excepción")
    void crearReserva_bloqueOcupado() {
        FeignClients.BloqueDisponibilidadDTO bloqueReservado =
                new FeignClients.BloqueDisponibilidadDTO(10L, 2L, "LUNES", "14:00", "16:00", "RESERVADO");

        when(usuariosClient.verificarUsuarioExiste(1L)).thenReturn(true);
        when(usuariosClient.verificarTutorTieneMateria(2L, 5L)).thenReturn(true);
        when(catalogoClient.verificarBloqueDisponible(10L)).thenReturn(bloqueReservado);

        assertThrows(BloqueNoDisponibleException.class, () -> reservaService.crearReserva(requestValido));
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("RF08: Race condition - doble reserva simultánea")
    void crearReserva_raceCondition() {
        when(usuariosClient.verificarUsuarioExiste(1L)).thenReturn(true);
        when(usuariosClient.verificarTutorTieneMateria(2L, 5L)).thenReturn(true);
        when(catalogoClient.verificarBloqueDisponible(10L)).thenReturn(bloqueLibre);
        when(reservaRepository.findReservaActivaEnBloque(anyLong(), any()))
                .thenReturn(Optional.of(Reserva.builder().id(99L).build()));

        assertThrows(BloqueNoDisponibleException.class, () -> reservaService.crearReserva(requestValido));
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("RF10: Cancelar reserva exitosamente")
    void cancelarReserva_exitoso() {
        Reserva reserva = Reserva.builder().id(1L).estudianteId(1L).tutorId(2L)
                .bloqueDisponibilidadId(10L).estado(EstadoReserva.ACTIVA)
                .fechaSesion(LocalDate.now().plusDays(2)).build();

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(reservaRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        ReservaDTO.ReservaResponse response = reservaService.cancelarReserva(1L, 1L);

        assertEquals(EstadoReserva.CANCELADA, response.getEstado());
        verify(catalogoClient).liberarBloque(10L);
    }

    @Test
    @DisplayName("RF11: Tutor registra asistencia como COMPLETADA")
    void registrarAsistencia_completada() {
        Reserva reserva = Reserva.builder().id(1L).tutorId(2L)
                .estado(EstadoReserva.ACTIVA).fechaSesion(LocalDate.now().minusDays(1)).build();

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(reservaRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        ReservaDTO.ReservaResponse response = reservaService.registrarAsistencia(1L, 2L, EstadoReserva.COMPLETADA);

        assertEquals(EstadoReserva.COMPLETADA, response.getEstado());
    }
}