const express = require('express');
const cors = require('cors'); // <-- Agregar
const conductoresRoutes = require('./routes/conductores.routes');

const app = express();

app.use(cors()); // <-- Agregar
app.use(express.json());

// NUEVO: Registro de peticiones entrantes (para ver cuando ms-vehiculos nos consulta)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] Petición recibida: ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ servicio: 'ms-conductores', estado: 'ok' });
});

app.use('/conductores', conductoresRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// MANEJADOR DE ERRORES GLOBAL (Debe ir al final)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  
  // Aquí es donde el HttpError(404) atrapado por el asyncHandler se convierte en JSON
  if (err.status) {
    const cuerpo = { error: err.message };
    if (err.detalles) cuerpo.detalles = err.detalles;
    return res.status(err.status).json(cuerpo);
  }
  
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;