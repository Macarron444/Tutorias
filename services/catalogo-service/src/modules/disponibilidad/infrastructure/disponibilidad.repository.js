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
      'INSERT INTO bloque_disponibilidad (tutor_id, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, "DISPONIBLE")',
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
}

module.exports = DisponibilidadRepository;