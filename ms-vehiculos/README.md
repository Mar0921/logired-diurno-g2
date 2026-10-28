# ms-vehiculos · Taller 1 (Módulo 3) · LogiRed S.A.S.

Redes y Servicios Multimedia · UAO · Microservicio de **vehículos de reparto** de la aplicación
de LogiRed, con **Node.js + Express** organizado en capas, a partir de la plantilla de ms-usuarios.

Versión del Taller 1: datos en memoria y tres operaciones (GET listado, GET por id, POST).

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```
npm install                 # descarga Express en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Prueben en el navegador: http://localhost:3005/health y http://localhost:3005/vehiculos

## Entidad

| Atributo | Tipo | Reglas |
|---|---|---|
| id | entero | Lo asigna el servicio |
| placa | texto | Obligatoria, única, formato `ABC123` (motos `ABC12D`); se guarda en mayúsculas |
| tipo | texto | `moto` · `furgon` · `camion` |
| capacidad_kg | número | Obligatoria, mayor que 0 |
| estado | texto | `disponible` (por defecto) · `en_ruta` · `mantenimiento` |
| conductor_id | entero o null | Referencia a **ms-conductores** (se valida por REST en el Taller 3) |

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/vehiculos.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/vehiculos.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/vehiculos.service.js | Lógica de negocio | Validaciones y reglas (placa única); no conoce HTTP ni la base de datos |
| src/repositories/vehiculos.repository.js | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| src/models/vehiculo.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Endpoints (Taller 1)

| Método | URI | Respuesta |
|---|---|---|
| GET | /health | 200 `{"servicio":"ms-vehiculos","estado":"ok"}` |
| GET | /vehiculos | 200 arreglo de vehículos |
| GET | /vehiculos/:id | 200 vehículo · 400 id inválido · 404 no existe |
| POST | /vehiculos | 201 vehículo creado · 400 datos inválidos · 409 placa repetida |

Ejemplo de cuerpo para POST:
`{"placa": "DEF456", "tipo": "furgon", "capacidad_kg": 1200, "estado": "disponible", "conductor_id": 3}`
