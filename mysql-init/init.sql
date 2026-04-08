CREATE TABLE materia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE bloque_disponibilidad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tutor_id INT,
  fecha_inicio DATETIME,
  fecha_fin DATETIME,
  estado VARCHAR(20)
);

CREATE TABLE franja_horaria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bloque_id INT,
  hora_inicio DATETIME,
  hora_fin DATETIME,
  FOREIGN KEY (bloque_id) REFERENCES bloque_disponibilidad(id)
);