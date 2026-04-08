const dayjs = require('dayjs');

class DisponibilidadService {
  constructor(repository) {
    this.repository = repository;
  }

  async crearBloque(data) {
    const { tutor_id, fecha_inicio, fecha_fin } = data;

    const Bloque = require('../domain/bloque.entity');

    const bloque = new Bloque({
      tutor_id,
      fecha_inicio,
      fecha_fin
    });

    if (fin.isBefore(inicio)) throw new Error('Fechas inválidas');

    const conflicto = await this.repository.existeSolapamiento(
      tutor_id,
      fecha_inicio,
      fecha_fin
    );

    if (conflicto) throw new Error('Conflicto de horario');

    const bloqueId = await this.repository.crearBloque(data);

    let actual = inicio;

    while (actual.isBefore(fin)) {
      const siguiente = actual.add(30, 'minute');
      await this.repository.crearFranja(
        bloqueId,
        actual.format(),
        siguiente.format()
      );
      actual = siguiente;
    }
  }
}

module.exports = DisponibilidadService;