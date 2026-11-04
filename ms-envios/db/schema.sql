-- db/schema.sql
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

CREATE TABLE envios (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  numero_guia       VARCHAR(20)   NOT NULL UNIQUE,
  cliente_id        INT           NOT NULL,   -- referencia a ms-clientes, sin FOREIGN KEY
  peso_kg           DECIMAL(8,2)  NOT NULL,
  ciudad_destino    VARCHAR(80)   NOT NULL,
  direccion_destino VARCHAR(150)  NOT NULL,
  estado            VARCHAR(20)   NOT NULL DEFAULT 'registrado',
  fecha_registro    DATE          NOT NULL
);

INSERT INTO envios (numero_guia, cliente_id, peso_kg, ciudad_destino, direccion_destino, estado, fecha_registro) VALUES
  ('LR-2026-000001', 1, 2.50, 'Medellín', 'Carrera 43A # 1-50', 'registrado', '2026-10-26'),
  ('LR-2026-000002', 2, 10.00, 'Bogotá', 'Calle 72 # 10-34', 'en_transito', '2026-10-26'),
  ('LR-2026-000003', 3, 0.80, 'Cali', 'Avenida 6N # 25-10', 'entregado', '2026-10-25');