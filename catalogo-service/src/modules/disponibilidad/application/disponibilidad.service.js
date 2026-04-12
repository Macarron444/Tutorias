const dayjs = require('dayjs');

class DisponibilidadService {
  constructor(repository) {
    this.repository = repository;
  }

  async crearBloque(data) {
    const { tutor_id, fecha_inicio, fecha_fin } = data;

    const Bloque = require('../domain/bloque.entity');

    // Validar con la entidad (lanza error si las fechas son inválidas)
    new Bloque({ tutor_id, fecha_inicio, fecha_fin });

    const inicio = dayjs(fecha_inicio);
    const fin = dayjs(fecha_fin);

    if (fin.isBefore(inicio)) throw new Error('Fechas inválidas');

    const conflicto = await this.repository.existeSolapamiento(
      tutor_id, fecha_inicio, fecha_fin
    );
    if (conflicto) throw new Error('Conflicto de horario');

    const bloqueId = await this.repository.crearBloque(data);

    let actual = inicio;
    while (actual.isBefore(fin)) {
      const siguiente = actual.add(30, 'minute');
      await this.repository.crearFranja(
        bloqueId,
        actual.format('YYYY-MM-DD HH:mm:ss'),
        siguiente.format('YYYY-MM-DD HH:mm:ss')
      );
      actual = siguiente;
    }

    return bloqueId;
  }
  async obtenerBloque(bloqueId) {
    return this.repository.findById(bloqueId);
  }

  async cambiarEstado(bloqueId, nuevoEstado) {
    return this.repository.actualizarEstado(bloqueId, nuevoEstado);
  }
}

module.exports = DisponibilidadService;