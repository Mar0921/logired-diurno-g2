
# ms-conductores · Contrato de la API

Microservicio de conductores de la aplicación. Responsable: Juan Felipe Fernandez Lozada. Puerto: **3004**.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior y MySQL (XAMPP).

1. Crear la base de datos y su usuario (como root):

```sql
CREATE DATABASE conductores_db;
CREATE USER 'conductores_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON conductores_db.* TO 'conductores_user'@'localhost';
```

2. Crear la tabla: en la consola `mysql -u conductores_user -p conductores_db` y luego `SOURCE db/schema.sql;`
3. `npm install`
4. Copiar `.env.example` como `.env` y ajustar la contraseña de la base de datos.
5. `npm run dev`

## Representación

```json
{ "id": 1, "nombre": "Carlos Pérez", "cedula": "12345678", "categoria_licencia": "C2", "telefono": "3001234567", "sede": "Cali" }
```

## Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único |
| nombre | texto | Sí | No vacío |
| cedula | texto | Sí | **único** (409) |
| categoria_licencia | texto | Sí | Solo `C2` o `C3` (400) |
| telefono | texto | Sí | No vacío |
| sede | texto | Sí | Solo `Cali`, `Medellín` o `Bogotá` (400) |

## Endpoints

| Operación | Método | URI | Respuesta exitosa | Errores |
|---|---|---|---|---|
| Listar | GET | /conductores | 200 arreglo | — |
| Filtrar | GET | /conductores?sede=Cali | 200 arreglo | — |
| Consultar por lotes | GET | /conductores?ids=1,3 | 200 arreglo | 400 |
| Obtener | GET | /conductores/:id | 200 objeto | 400 · 404 |
| Crear | POST | /conductores | 201 objeto + Location | 400 · 409 |
| Actualizar | PUT | /conductores/:id | 200 objeto | 400 · 404 · 409 |
| Eliminar | DELETE | /conductores/:id | 204 | 400 · 404 |

Ejemplo para crear:

```json
{ "nombre": "Pedro Picapiedra", "cedula": "999888777", "categoria_licencia": "C3", "telefono": "3150001122", "sede": "Medellín" }
```

Errores: `{ "error": "mensaje", "detalles": ["..."] }` (detalles solo en errores de validación).

## Relaciones

**Consulto a:** ninguno.

**Me consultan:** `ms-vehiculos`. Me consultan para validar el `conductor_id` al crear un vehículo y para componer la respuesta incluyendo el objeto `conductor`. Los campos `id`, `nombre` y `telefono` no deben cambiar sin avisar (semana 2).

## Pruebas

Colección de Postman en `docs/ms-conductores.postman_collection.json` (13 casos).