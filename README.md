# LogiRed · Jornada diurno · Grupo 2

Aplicación web de LogiRed S.A.S., empresa de logística y mensajería, para gestionar clientes, envíos, conductores y vehículos mediante microservicios (Node.js + Express). Proyecto del Módulo 3 de Redes y Servicios Multimedia, Universidad Autónoma de Occidente.

## Integrantes

|Integrante|Usuario de GitHub|Microservicio a cargo|
|-|-|-|
|Alejandro Arias Ramirez|xAlejo17|ms-clientes|
|Mariana Parra Acosta|Mar0921|ms-envios|
|Juan Felipe Fernandez Losada|JuanfeFernandez|ms-conductores|
|Santiago Peña Agudelo|Stiago521|ms-vehiculos|

## Microservicios

|Carpeta|Entidad|Responsable|Puerto|Depende de|
|-|-|-|-|-|
|`ms-usuarios`|Usuario|Docente|3001|—|
|`ms-clientes`|Cliente|(nombre)|3002|—|
|`ms-envios`|Envío|(nombre)|3003|`ms-clientes` (guarda `cliente\_id`)|
|`ms-conductores`|Conductor|(nombre)|3004|(es consultado por `ms-vehiculos`)|
|`ms-vehiculos`|Vehículo|(nombre)|3005|`ms-conductores` (guarda `conductor_id`)|



Cada microservicio es dueño exclusivo de sus datos. Las relaciones entre microservicios se guardan como un id y se consultan por REST.

## 

## Estructura del repositorio

```
logired-diurno-g2/
├── README.md          ← este archivo
├── ms-usuarios/       ← entregado por la docente (nadie lo modifica)
├── ms-clientes/       ← microservicio de clientes
├── ms-envios/         ← microservicio de envíos
├── ms-conductores/    ← microservicio de conductores
├── ms-vehiculos/      ← microservicio de vehículos
├── frontend/          ← interfaz web (desde la semana 2)
└── deploy/            ← archivos de despliegue (Taller 3)
```

Dentro de cada microservicio el código está en capas: `src/routes` → `src/controllers` → `src/services` → `src/repositories`, más `src/models`.



## Cómo ejecutar un microservicio

Requisitos: Node.js 22 o superior. Desde la raíz del repositorio, entra a la carpeta del microservicio y ejecuta:

```
cd ms-envios
npm install
copy .env.example .env      # en Linux o Mac: cp .env.example .env
npm run dev
```

El servicio queda en `http://localhost:<puerto>` (por ejemplo `http://localhost:3003/health`). El archivo `.env` y la carpeta `node\_modules` no se suben al repositorio.

