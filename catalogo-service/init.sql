CREATE TABLE IF NOT EXISTS materia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bloque_disponibilidad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tutor_id VARCHAR(100),
  fecha_inicio DATETIME,
  fecha_fin DATETIME,
  estado VARCHAR(20) DEFAULT 'LIBRE'
);

CREATE TABLE IF NOT EXISTS franja_horaria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bloque_id INT,
  hora_inicio DATETIME,
  hora_fin DATETIME,
  FOREIGN KEY (bloque_id) REFERENCES bloque_disponibilidad(id)
);