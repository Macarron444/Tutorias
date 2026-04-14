const db = require('../../../config/db');

class DisponibilidadRepository {
  async existeSolapamiento(tutor_id, inicio, fin) {
    const [rows] = await db.query(`
      SELECT * FROM bloque_disponibilidad
      WHERE tutor_id = ?
      AND (fecha_inicio < ? AND fecha_fin > ?)
    `, [tutor_id, fin, inicio]);

    return rows.length > 0;
  }

  async crearBloque(data) {
    const [res] = await db.query(
      'INSERT INTO bloque_disponibilidad (tutor_id, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, "LIBRE")',
      [data.tutor_id, data.fecha_inicio, data.fecha_fin]
    );

    return res.insertId;
  }

  async crearFranja(bloqueId, inicio, fin) {
    await db.query(
      'INSERT INTO franja_horaria (bloque_id, hora_inicio, hora_fin) VALUES (?, ?, ?)',
      [bloqueId, inicio, fin]
    );
  }
  async findById(bloqueId) {
    const [rows] = await db.query(
      'SELECT * FROM bloque_disponibilidad WHERE id = ?',
      [bloqueId]
    );
    if (rows.length === 0) return null;
    const b = rows[0];
    return {
      id: b.id,
      tutorId: b.tutor_id,
      diaSemana: b.fecha_inicio,
      horaInicio: b.fecha_inicio,
      horaFin: b.fecha_fin,
      estado: b.estado === 'DISPONIBLE' ? 'LIBRE' : b.estado
    };
  }

  async actualizarEstado(bloqueId, nuevoEstado) {
    await db.query(
      'UPDATE bloque_disponibilidad SET estado = ? WHERE id = ?',
      [nuevoEstado, bloqueId]
    );
  }

  async getDisponibilidadByMateria(materiaId) {
    const [rows] = await db.query(
      'SELECT bd.id, bd.tutor_id, bd.fecha_inicio, bd.fecha_fin, m.nombre as materia_nombre ' +
      'FROM bloque_disponibilidad bd ' +
      'JOIN materia m ON m.id = bd.materia_id ' +
      'WHERE bd.estado = "LIBRE" AND m.id = ?',
      [materiaId]
    );
    return rows;
  }


  async getDisponibilidadByTutor(tutorId) {
    const [rows] = await db.query(
      'SELECT bd.id as bloque_id, bd.tutor_id, bd.fecha_inicio, bd.fecha_fin, bd.estado, m.nombre as materia_nombre ' +
      'FROM bloque_disponibilidad bd ' +
      'JOIN materia m ON m.id = bd.materia_id ' +
      'WHERE bd.tutor_id = ?',
      [tutorId]
    );
    return rows;
  }
}
module.exports = DisponibilidadRepository;


