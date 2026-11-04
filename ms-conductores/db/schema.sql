SET NAMES utf8mb4;

CREATE TABLE conductores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  categoria_licencia VARCHAR(5) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  sede VARCHAR(30) NOT NULL
);

INSERT INTO conductores (nombre, cedula, categoria_licencia, telefono, sede) VALUES
  ('Carlos Pérez', '12345678', 'C2', '3001234567', 'Cali'),
  ('Ana Gómez', '87654321', 'C3', '3109876543', 'Medellín'),
  ('Luis Rodríguez', '11223344', 'C2', '3205556677', 'Bogotá');