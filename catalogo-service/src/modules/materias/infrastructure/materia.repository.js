const db = require('../../../config/db');

class MateriaRepository {
  async findAll() {
    const [rows] = await db.query('SELECT * FROM materia');
    return rows;
  }

  async create(materia) {
    await db.query(
      'INSERT INTO materia (nombre, descripcion) VALUES (?, ?)',
      [materia.nombre, materia.descripcion]
    );
  }
}

module.exports = MateriaRepository;