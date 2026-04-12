const Materia = require('../domain/materia.entity');

class MateriaService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAll() {
    return this.repository.findAll();
  }

  async create(data) {
    const materia = new Materia(data.nombre, data.descripcion);
    return this.repository.create(materia);
  }
}

module.exports = MateriaService;