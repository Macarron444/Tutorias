class Materia {
  constructor(nombre, descripcion) {
    if (!nombre) throw new Error('Nombre requerido');
    this.nombre = nombre;
    this.descripcion = descripcion;
  }
}

module.exports = Materia;