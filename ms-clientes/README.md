# ms-clientes · Contrato de la API

Microservicio de **clientes** de LogiRed: gestiona las personas y empresas que despachan paquetes.
Responsable: Alejandro Arias Ramírez. Puerto: **3002**.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior (`node -v`) y MySQL 8 o MariaDB (sirve la que trae XAMPP).

1. Crear la base de datos y su usuario (como root):

```sql
CREATE DATABASE clientes_db;
CREATE USER 'clientes_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'localhost';
```

2. Crear la tabla: en la consola `mysql -u clientes_user -p clientes_db` y luego `SOURCE db/schema.sql;`
3. `npm install`
4. Copiar `.env.example` como `.env` y ajustar la contraseña de la base de datos.
5. `npm run dev`

Comprobación rápida: http://localhost:3002/health debe responder `{"servicio":"ms-clientes","estado":"ok"}`.

## Representación

```json
{
  "id": 1,
  "nombre": "Distribuidora El Valle",
  "documento": "900456789-1",
  "telefono": "3155678901",
  "email": "contacto@distribuidoraelvalle.com",
  "ciudad": "Cali"
}
```

## Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único; el cliente nunca lo envía |
| nombre | texto | Sí | No vacío; se guarda sin espacios al inicio ni al final |
| documento | texto | Sí | No vacío; **único** (409). Cédula o NIT de quien despacha |
| telefono | texto | Sí | Entre 7 y 15 caracteres numéricos |
| email | texto | No | Si viene, formato válido de correo; se guarda en minúsculas |
| ciudad | texto | Sí | No vacío. Se usa en el filtro `?ciudad=` |

Todas las peticiones llevan la cabecera `Authorization: Bearer <token>`. El token se obtiene en `POST /usuarios/login` de ms-usuarios. Quien consulte a ms-clientes desde otro microservicio debe reenviar el mismo token que recibió en la petición original; si no lo hace, ms-clientes responde 401.

## Endpoints

| Operación | Método | URI | Respuesta exitosa | Errores |
|---|---|---|---|---|
| Listar | GET | /clientes | 200 arreglo | 401 |
| Filtrar | GET | /clientes?ciudad=Cali | 200 arreglo | 401 |
| Consultar por lotes | GET | /clientes?ids=1,3,4 | 200 arreglo | 400 · 401 |
| Obtener | GET | /clientes/:id | 200 objeto | 400 · 401 · 404 |
| Crear | POST | /clientes | 201 objeto + Location | 400 · 401 · 403 · 409 |
| Actualizar | PUT | /clientes/:id | 200 objeto | 400 · 401 · 403 · 404 · 409 |
| Eliminar | DELETE | /clientes/:id | 204 | 400 · 401 · 403 · 404 |

- **401:** falta el token, es inválido o venció.
- **403:** el rol del token no tiene permiso para esa operación. Los tres roles pueden consultar; solo administrador y despacho pueden crear, actualizar y eliminar.

Ejemplo para crear. Petición:

```json
{
  "nombre": "Comercializadora del Norte",
  "documento": "901778899-4",
  "telefono": "3124455667",
  "email": "ventas@comnorte.com",
  "ciudad": "Palmira"
}
```

Respuesta `201` con la cabecera `Location: /clientes/5`:

```json
{
  "id": 5,
  "nombre": "Comercializadora del Norte",
  "documento": "901778899-4",
  "telefono": "3124455667",
  "email": "ventas@comnorte.com",
  "ciudad": "Palmira"
}
```

Ejemplo para listar. Petición: `GET /clientes?ids=1,3`. Respuesta `200`:

```json
[
  {
    "id": 1,
    "nombre": "Distribuidora El Valle",
    "documento": "900456789-1",
    "telefono": "3155678901",
    "email": "contacto@distribuidoraelvalle.com",
    "ciudad": "Cali"
  },
  {
    "id": 3,
    "nombre": "Carolina Mejia Londoño",
    "documento": "1144556677",
    "telefono": "3017654321",
    "email": "carolina.mejia@correo.com",
    "ciudad": "Medellin"
  }
]
```

Errores: `{ "error": "mensaje", "detalles": ["..."] }` (detalles solo en errores de validación).

El `409` corresponde a la regla de negocio del microservicio: no pueden existir dos clientes con el mismo documento.

## Relaciones

**Consulto a:** ninguno. ms-clientes no guarda referencias a otros microservicios, así que su representación no trae objetos relacionados.

**Me consultan:**

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| ms-envios | GET /clientes/:id · GET /clientes?ids=... | id, nombre, ciudad |

ms-envios guarda `cliente_id` y me usa de dos formas: `GET /clientes/:id` al crear o actualizar un envío, para validar que el cliente exista, y `GET /clientes?ids=...` al listar envíos, para traer en una sola petición los datos de todos los clientes involucrados. Por eso el filtro por lotes y los nombres de esos tres campos no cambian sin avisarle al grupo.

## Pruebas

Colección de Postman en `docs/ms-clientes.postman_collection.json` (13 casos).

## Organización del código

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/clientes.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/clientes.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/clientes.service.js | Lógica de negocio | Validaciones y reglas (documento único); no conoce HTTP ni la base de datos |
| src/repositories/clientes.repository.js | Acceso a datos | Consultas SQL parametrizadas sobre `clientes_db` |
| src/models/cliente.js | Modelo | Atributos de la entidad y su validación |
| src/db.js | Acceso a datos | Pool de conexiones a MySQL con los datos del `.env` |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |
