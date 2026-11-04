# ms-envios · Contrato de la API

Microservicio de **envíos** (paquetes registrados para entrega) de LogiRed.

| | |
|---|---|
| **Entidad** | Envío |
| **Responsable** | Mariana Parra Acosta (`Mar0921`) |
| **Puerto** | 3003 |
| **Base de datos** | `envios_db` (MySQL/MariaDB), usuario `envios_user` |
| **Recurso** | `/envios` |

## Cómo ejecutarlo

**Requisitos:** Node.js 22 o superior y MySQL o MariaDB (por ejemplo, el de XAMPP) corriendo en el puerto 3306.

**1. Crear la base de datos y el usuario**, como administrador (`mysql -u root`):

```sql
CREATE DATABASE envios_db CHARACTER SET utf8mb4;
CREATE USER 'envios_user'@'localhost' IDENTIFIED BY 'envioskey';
GRANT ALL PRIVILEGES ON envios_db.* TO 'envios_user'@'localhost';
```

**2. Crear la tabla y los 3 registros iniciales**, desde la carpeta `ms-envios`:

```
mysql -u envios_user -p envios_db
mysql> SOURCE db/schema.sql;
```

(Si lo ejecutas dentro del cliente como root, selecciona antes la base con `use envios_db`.)

**3. Crear el archivo `.env`** copiando `.env.example` (`copy .env.example .env` en Windows; `cp .env.example .env` en Linux o Mac) y completando la contraseña:

| Variable | Valor de ejemplo | Para qué sirve |
|---|---|---|
| `PORT` | `3003` | Puerto en el que escucha el servicio |
| `HOST` | `127.0.0.1` | Dirección en la que escucha |
| `DB_HOST` | `localhost` | Servidor de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `DB_NAME` | `envios_db` | Base de datos de este microservicio |
| `DB_USER` | `envios_user` | Usuario de la base de datos |
| `DB_PASSWORD` | `envioskey` | Contraseña del usuario (la que pusiste en `IDENTIFIED BY`) |

El archivo `.env` contiene la contraseña y **no se sube al repositorio**.

**4. Instalar y arrancar:**

```
npm install
npm run dev
```

Comprueba que responde: `http://localhost:3003/health` debe devolver `{"servicio":"ms-envios","estado":"ok"}`.

## Representación de un envío

Así responde `GET /envios/7`:

```json
{
  "id": 7,
  "numero_guia": "LR-2026-000123",
  "cliente_id": 3,
  "peso_kg": 2.5,
  "ciudad_destino": "Medellín",
  "direccion_destino": "Carrera 43A # 1-50",
  "estado": "registrado",
  "fecha_registro": "2026-10-26",
  "cliente": { "id": 3, "nombre": "Distribuidora El Valle", "ciudad": "Cali" }
}
```

`cliente_id` es lo que se guarda en la base de datos de ms-envios. El objeto `cliente` **no se guarda**: ms-envios lo pide a ms-clientes cada vez que responde (se agrega cuando se implementan las relaciones, en la semana 2). Mientras tanto, la respuesta trae los mismos atributos sin ese objeto.

## Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| `id` | entero | No: lo asigna el servicio | Positivo y único; el cliente nunca lo envía |
| `numero_guia` | texto | No: si no se envía, lo genera el servicio | Formato `LR-AAAA-NNNNNN`; **único** (si se repite: 409) |
| `cliente_id` | entero | Sí | Entero positivo; referencia a ms-clientes |
| `peso_kg` | número | Sí | Mayor que 0 |
| `ciudad_destino` | texto | Sí | No vacío; se guarda sin espacios al inicio ni al final |
| `direccion_destino` | texto | Sí | No vacío; se guarda sin espacios al inicio ni al final |
| `estado` | texto | No (por defecto `registrado`) | Uno de: `registrado`, `en_transito`, `entregado` |
| `fecha_registro` | texto (fecha) | No: la asigna el servicio | Formato `AAAA-MM-DD`; no cambia al actualizar |

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | `/envios` | — | 200 + arreglo | — |
| Filtrar | GET | `/envios?estado=en_transito` | — | 200 + arreglo filtrado | 400 estado no permitido |
| Consultar por lotes | — | No aplica: ningún microservicio consulta a ms-envios | — | — | — |
| Obtener | GET | `/envios/:id` | — | 200 + objeto | 400 id inválido · 404 |
| Crear | POST | `/envios` | JSON sin `id` ni `fecha_registro`; `numero_guia` y `estado` opcionales | 201 + objeto + cabecera `Location` | 400 · 409 |
| Actualizar | PUT | `/envios/:id` | JSON completo sin `id` ni `fecha_registro` | 200 + objeto actualizado | 400 · 404 · 409 |
| Eliminar | DELETE | `/envios/:id` | — | 204 sin cuerpo | 400 · 404 |
| Estado del servicio | GET | `/health` | — | 200 `{"servicio":"ms-envios","estado":"ok"}` | — |

### Ejemplo: crear un envío

`POST /envios` con `Content-Type: application/json`:

```json
{
  "cliente_id": 3,
  "peso_kg": 2.5,
  "ciudad_destino": "Medellín",
  "direccion_destino": "Carrera 43A # 1-50"
}
```

Respuesta `201 Created`, con la cabecera `Location: /envios/4`:

```json
{
  "id": 4,
  "numero_guia": "LR-2026-000004",
  "cliente_id": 3,
  "peso_kg": 2.5,
  "ciudad_destino": "Medellín",
  "direccion_destino": "Carrera 43A # 1-50",
  "estado": "registrado",
  "fecha_registro": "2026-11-03"
}
```

### Ejemplo: listar envíos

`GET /envios` (con `?estado=en_transito` devuelve solo los que están en ese estado). Respuesta `200 OK`:

```json
[
  {
    "id": 1,
    "numero_guia": "LR-2026-000001",
    "cliente_id": 1,
    "peso_kg": 2.5,
    "ciudad_destino": "Medellín",
    "direccion_destino": "Carrera 43A # 1-50",
    "estado": "registrado",
    "fecha_registro": "2026-10-26"
  },
  {
    "id": 2,
    "numero_guia": "LR-2026-000002",
    "cliente_id": 2,
    "peso_kg": 10,
    "ciudad_destino": "Bogotá",
    "direccion_destino": "Calle 72 # 10-34",
    "estado": "en_transito",
    "fecha_registro": "2026-10-26"
  }
]
```

Errores: `{ "error": "mensaje", "detalles": ["..."] }` (`detalles` solo en errores de validación).

## Relaciones

### Lo que ms-envios consulta (quien guarda la referencia)

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
|---|---|---|---|---|
| `cliente_id` | ms-clientes | `GET /clientes/:id` | `GET /clientes?ids=...` | `id`, `nombre`, `ciudad` |

### Quién consulta a ms-envios

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| Ningún microservicio | — | — |

## Pruebas

Colección de Postman en [`docs/ms-envios.postman_collection.json`](docs/ms-envios.postman_collection.json).