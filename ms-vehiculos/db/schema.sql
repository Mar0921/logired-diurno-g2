-- db/schema.sql
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

CREATE TABLE vehiculos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  placa         VARCHAR(6)    NOT NULL UNIQUE,
  tipo          VARCHAR(10)   NOT NULL,
  capacidad_kg  DECIMAL(10,2) NOT NULL,
  estado        VARCHAR(20)   NOT NULL DEFAULT 'disponible',
  conductor_id  INT           NULL        -- referencia a ms-conductores (sin FOREIGN KEY)
);

INSERT INTO vehiculos (placa, tipo, capacidad_kg, estado, conductor_id) VALUES
  ('ABC123', 'furgon', 1500, 'disponible', 1),
  ('XYZ45D', 'moto', 30, 'en_ruta', 2),
  ('KLM789', 'camion', 8000, 'mantenimiento', NULL);
