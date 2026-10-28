# ms-envios

Microservicio de envíos de LogiRed (Node.js + Express, capas, datos en memoria).

```
npm install
copy .env.example .env
npm run dev
```
Puerto 3003. Endpoints: GET /health, GET /envios, GET /envios/:id, POST /envios.
Referencia a otro microservicio: cliente_id (ms-clientes). En el Taller 3 se valida y se compone el objeto cliente.
