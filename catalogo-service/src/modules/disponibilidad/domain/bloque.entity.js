class BloqueDisponibilidad {
  constructor({ tutor_id, fecha_inicio, fecha_fin }) {
    if (!tutor_id) {
      throw new Error('El tutor_id es obligatorio');
    }

    if (!fecha_inicio || !fecha_fin) {
      throw new Error('Las fechas son obligatorias');
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (isNaN(inicio) || isNaN(fin)) {
      throw new Error('Formato de fecha inválido');
    }

    if (fin <= inicio) {
      throw new Error('La fecha_fin debe ser mayor a fecha_inicio');
    }

    this.tutor_id = tutor_id;
    this.fecha_inicio = inicio;
    this.fecha_fin = fin;
    this.estado = 'DISPONIBLE';
  }

  duracionEnMinutos() {
    return (this.fecha_fin - this.fecha_inicio) / 60000;
  }

  esValido() {
    return this.duracionEnMinutos() > 0;
  }
}

module.exports = BloqueDisponibilidad;