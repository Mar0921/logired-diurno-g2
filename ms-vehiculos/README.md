# ms-vehiculos · Contrato de la API

Microservicio de **vehículos de reparto** de LogiRed.

| | |
|---|---|
| **Entidad** | Vehículo |
| **Responsable** | Santiago Peña Agudelo (`STiago521`) |
| **Puerto** | 3005 |
| **Base de datos** | `vehiculos_db` (MySQL/MariaDB), usuario `vehiculos_user` |
| **Recurso** | `/vehiculos` |

## Cómo ejecutarlo

**Requisitos:** Node.js 22 o superior y MySQL o MariaDB (por ejemplo, el de XAMPP) corriendo en el puerto 3306.

**1. Crear la base de datos y el usuario**, como administrador (en XAMPP: botón **Shell** → `mysql -u root`):

```sql
CREATE DATABASE vehiculos_db CHARACTER SET utf8mb4;
CREATE USER 'vehiculos_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON vehiculos_db.* TO 'vehiculos_user'@'localhost';
```

**2. Crear la tabla y los 3 registros iniciales**, desde la carpeta `ms-vehiculos`:

```
mysql -u vehiculos_user -p vehiculos_db
mysql> SOURCE db/schema.sql;
```

(Si la ruta tiene espacios o entraste desde otra carpeta, usa la ruta completa con `/`, por ejemplo `SOURCE E:/ruta/ms-vehiculos/db/schema.sql;`).

**3. Crear el archivo `.env`** copiando `.env.example` (`copy .env.example .env` en Windows; `cp .env.example .env` en Linux o Mac) y completando la contraseña:

| Variable | Valor de ejemplo | Para qué sirve |
|---|---|---|
| `PORT` | `3005` | Puerto en el que escucha el servicio |
| `HOST` | `127.0.0.1` | Dirección en la que escucha |
| `DB_HOST` | `localhost` | Servidor de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `DB_NAME` | `vehiculos_db` | Base de datos de este microservicio |
| `DB_USER` | `vehiculos_user` | Usuario de la base de datos |
| `DB_PASSWORD` | `una-clave-segura` | Contraseña del usuario (la que pusiste en `IDENTIFIED BY`) |
| `JWT_SECRET` | la frase del grupo | Clave para verificar los tokens; **la misma de ms-usuarios** |
| `CONDUCTORES_URL` | `http://127.0.0.1:3004` | Dirección de ms-conductores (para validar y componer) |

El archivo `.env` contiene la contraseña y **no se sube al repositorio**.

**4. Instalar y arrancar:**

```
npm install
npm run dev
```

Comprueba que responde: `http://localhost:3005/health` debe devolver `{"servicio":"ms-vehiculos","estado":"ok"}`.

## Representación de un vehículo

Así responde `GET /vehiculos/1`:

```json
{
  "id": 1,
  "placa": "ABC123",
  "tipo": "furgon",
  "capacidad_kg": 1500,
  "estado": "disponible",
  "conductor_id": 1,
  "conductor": { "id": 1, "nombre": "Carlos Pérez", "telefono": "3001234567" }
}
```

`conductor_id` es lo que se guarda en la base de datos de ms-vehiculos (puede ser `null` si el vehículo aún no tiene conductor asignado). El objeto `conductor` **no se guarda**: ms-vehiculos lo pide a ms-conductores cada vez que responde, en una sola petición por listado.

- Si `conductor_id` es `null`, la respuesta trae `"conductor": null` y no se consulta a ms-conductores.
- Si ms-conductores no responde al consultar, cada vehículo con conductor sale con `"conductor": null` y `"aviso": "ms-conductores no disponible"` (degradación controlada).

## Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| `id` | entero | No: lo asigna el servicio | Positivo y único; el cliente nunca lo envía |
| `placa` | texto | Sí | Formato colombiano `ABC123` (motos `ABC12D`); se guarda en mayúsculas y sin guiones; **única** (si se repite: 409) |
| `tipo` | texto | Sí | Uno de: `moto`, `furgon`, `camion` |
| `capacidad_kg` | número | Sí | Mayor que 0 |
| `estado` | texto | No (por defecto `disponible`) | Uno de: `disponible`, `en_ruta`, `mantenimiento` |
| `conductor_id` | entero o `null` | No (por defecto `null`) | Entero positivo; referencia a ms-conductores. `null` = sin conductor asignado |

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | `/vehiculos` | — | 200 + arreglo | — |
| Filtrar | GET | `/vehiculos?estado=disponible` (también `?tipo=furgon`) | — | 200 + arreglo filtrado | — |
| Consultar por lotes | GET | `/vehiculos?ids=1,3` | — | 200 + arreglo con esos registros | 400 ids inválidos |
| Obtener | GET | `/vehiculos/:id` | — | 200 + objeto | 400 id inválido · 404 |
| Crear | POST | `/vehiculos` | JSON sin `id` | 201 + objeto con `conductor` + cabecera `Location` | 400 · 401 · 403 · 409 · 503 |
| Actualizar | PUT | `/vehiculos/:id` | JSON completo sin `id` | 200 + objeto actualizado con `conductor` | 400 · 401 · 403 · 404 · 409 · 503 |
| Eliminar | DELETE | `/vehiculos/:id` | — | 204 sin cuerpo | 400 · 404 |
| Estado del servicio | GET | `/health` | — | 200 `{"servicio":"ms-vehiculos","estado":"ok"}` | — |

### Ejemplo: crear un vehículo

`POST /vehiculos` con `Content-Type: application/json`:

```json
{
  "placa": "DEF456",
  "tipo": "furgon",
  "capacidad_kg": 1200,
  "conductor_id": 3
}
```

Respuesta `201 Created`, con la cabecera `Location: /vehiculos/4`:

```json
{
  "id": 4,
  "placa": "DEF456",
  "tipo": "furgon",
  "capacidad_kg": 1200,
  "estado": "disponible",
  "conductor_id": 3
}
```

### Ejemplo: listar vehículos

`GET /vehiculos` (con `?estado=disponible` devuelve solo los que están en ese estado). Respuesta `200 OK`:

```json
[
  {
    "id": 1,
    "placa": "ABC123",
    "tipo": "furgon",
    "capacidad_kg": 1500,
    "estado": "disponible",
    "conductor_id": 1
  },
  {
    "id": 2,
    "placa": "XYZ45D",
    "tipo": "moto",
    "capacidad_kg": 30,
    "estado": "en_ruta",
    "conductor_id": 2
  },
  {
    "id": 3,
    "placa": "KLM789",
    "tipo": "camion",
    "capacidad_kg": 8000,
    "estado": "mantenimiento",
    "conductor_id": null
  }
]
```

Errores: `{ "error": "mensaje", "detalles": ["..."] }` (`detalles` solo en errores de validación).

## Seguridad (tokens JWT)

Todas las peticiones a `/vehiculos` llevan la cabecera `Authorization: Bearer <token>`. El token se obtiene con `POST /usuarios/login` en ms-usuarios (puerto 3001). ms-vehiculos lo verifica con `JWT_SECRET`, sin preguntarle nada a ms-usuarios (`src/middlewares/auth.js`).

| Operación | administrador | flota | despacho |
|---|---|---|---|
| Consultar (GET) | Sí | Sí | Sí |
| Crear, actualizar, eliminar (POST, PUT, DELETE) | Sí | Sí | No (403) |

- **401:** falta el token, es inválido o venció.
- **403:** el rol del token no tiene permiso para esa operación.
- **400** (al crear o actualizar): el `conductor_id` no existe en ms-conductores.
- **503** (al crear o actualizar con conductor): ms-conductores no respondió y no se pudo verificar el conductor; no se guarda nada.

## Relaciones

### Lo que ms-vehiculos consulta (quien guarda la referencia)

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
|---|---|---|---|---|
| `conductor_id` | ms-conductores | `GET /conductores/:id` (solo si `conductor_id` no es `null`) | `GET /conductores?ids=...` | `id`, `nombre`, `telefono` |

### Quién consulta a ms-vehiculos

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| Ningún microservicio en un grupo de 4 (ms-rutas, que lo consultaría, solo existe en grupos de 5) | — | — |

El token de la petición original se reenvía a ms-conductores (que también lo exige).
El código de la relación está en `src/clients/conductores.client.js` (las peticiones a ms-conductores) y en `src/services/vehiculos.service.js` (`validarConductor` y `componer`).

El filtro `?ids=` queda disponible como parte del contrato por si otro servicio lo necesita.

## Pruebas

Colección de Postman en [`docs/ms-vehiculos.postman_collection.json`](docs/ms-vehiculos.postman_collection.json) (casos 01 a 24, con login previo; los casos 23 y 24 se corren con **ms-conductores detenido**). Para Thunder Client: `docs/ms-vehiculos.thunder.json`, con las URLs escritas completas.