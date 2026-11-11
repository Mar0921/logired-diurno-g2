// =====================================================================
// DATOS DE EJEMPLO DE CLIENTES (Taller 2)
// Tienen la misma forma que la respuesta de ms-clientes descrita en el
// contrato de la API:
//   { id, nombre, documento, telefono, email, ciudad }
// email es el único atributo opcional: puede venir en null.
// En el Taller 3, cuando el frontend consulte al gateway de Apache,
// este archivo se elimina y los datos llegan de GET /clientes.
// =====================================================================
const CLIENTES_EJEMPLO = [
  { id: 1, nombre: 'Distribuidora El Valle', documento: '900456789-1', telefono: '3155678901', email: 'contacto@distribuidoraelvalle.com', ciudad: 'Cali' },
  { id: 2, nombre: 'Almacenes del Pacifico', documento: '901234567-5', telefono: '3182345678', email: 'compras@almacenespacifico.com', ciudad: 'Buenaventura' },
  { id: 3, nombre: 'Carolina Mejia Londoño', documento: '1144556677', telefono: '3017654321', email: 'carolina.mejia@correo.com', ciudad: 'Medellin' },
  { id: 4, nombre: 'Textiles Andinos', documento: '860098765-3', telefono: '6013456789', email: 'logistica@textilesandinos.com', ciudad: 'Bogota' },
  { id: 5, nombre: 'Ferreteria La Catorce', documento: '1098765432', telefono: '3124567890', email: null, ciudad: 'Cali' },
  { id: 6, nombre: 'Agroinsumos del Norte', documento: '805112233-7', telefono: '3209988776', email: 'ventas@agroinsumosnorte.com', ciudad: 'Palmira' },
];