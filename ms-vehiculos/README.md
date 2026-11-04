# ms-vehiculos · Contrato de la API

Microservicio de vehículos de reparto de LogiRed. Responsable: Santiago Peña Agudelo. Puerto: **3005**.

## Cómo ejecutarlo

Requisitos: Node.js 22 o superior. Por ahora los datos están en memoria (se pierden al reiniciar).

```
npm install
copy .env.example .env      # en Linux/Mac: cp .env.example .env
npm run dev
```

## Representación

```json
{ "id": 1, "placa": "ABC123", "tipo": "furgon", "capacidad_kg": 1500, "estado": "disponible", "conductor_id": 1 }
```

## Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único |
| placa | texto | Sí | Formato `ABC123` (motos `ABC12D`); se guarda en mayúsculas; **única** (409) |
| tipo | texto | Sí | `moto` · `furgon` · `camion` |
| capacidad_kg | decimal | Sí | Mayor que 0 |
| estado | texto | No (por defecto `disponible`) | `disponible` · `en_ruta` · `mantenimiento` |
| conductor_id | entero o null | No (por defecto `null`) | Entero positivo; referencia a ms-conductores |

## Endpoints

| Operación | Método | URI | Respuesta exitosa | Errores |
|---|---|---|---|---|
| Listar | GET | /vehiculos | 200 arreglo | — |
| Filtrar | GET | /vehiculos?estado=disponible (también ?tipo=) | 200 arreglo | — |
| Consultar por lotes | GET | /vehiculos?ids=1,3 | 200 arreglo | 400 |
| Obtener | GET | /vehiculos/:id | 200 objeto | 400 · 404 |
| Crear | POST | /vehiculos | 201 objeto + Location | 400 · 409 |
| Actualizar | PUT | /vehiculos/:id | 200 objeto | 400 · 404 · 409 |
| Eliminar | DELETE | /vehiculos/:id | 204 | 400 · 404 |

Ejemplo para crear:

```json
{ "placa": "DEF456", "tipo": "furgon", "capacidad_kg": 1200, "conductor_id": 3 }
```

Errores: `{ "error": "mensaje", "detalles": ["..."] }` (detalles solo en errores de validación).

## Relaciones

**Consulto a:**

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
|---|---|---|---|---|
| conductor_id | ms-conductores | GET /conductores/:id | GET /conductores?ids=… | id, nombre, telefono |

**Me consultan:** ninguno en un grupo de 4 (ms-rutas solo existe en grupos de 5).
