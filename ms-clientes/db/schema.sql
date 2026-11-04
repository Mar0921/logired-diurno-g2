-- db/schema.sql
SET NAMES utf8mb4; -- para que las tildes y la ñ se guarden bien

CREATE TABLE clientes (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  documento VARCHAR(30)  NOT NULL UNIQUE,
  telefono  VARCHAR(20)  NOT NULL,
  email     VARCHAR(120) NULL,
  ciudad    VARCHAR(60)  NOT NULL
);

INSERT INTO clientes (nombre, documento, telefono, email, ciudad) VALUES
  ('Distribuidora El Valle', '900456789-1', '3155678901', 'contacto@distribuidoraelvalle.com', 'Cali'),
  ('Almacenes del Pacifico', '901234567-5', '3182345678', 'compras@almacenespacifico.com', 'Buenaventura'),
  ('Carolina Mejia Londoño', '1144556677', '3017654321', 'carolina.mejia@correo.com', 'Medellin'),
  ('Textiles Andinos', '860098765-3', '6013456789', 'logistica@textilesandinos.com', 'Bogota');