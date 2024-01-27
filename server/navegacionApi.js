const express = require("express");
const router = express.Router();
const { db, obtenerNuevosRegistros } = require('./db');
// Ruta para obtener todos los registros de navegación
router.get('/navegacion', async (req, res) => {
  try {
    // Realizar la consulta a la base de datos para obtener todos los registros de navegación
    const result = await db.promise().query('SELECT * FROM navegacion');

    // Verificar el resultado si es necesario
    console.log("Registros de navegación obtenidos:", result[0]);

    // Devolver los registros como respuesta
    res.status(200).json({ registros: result[0] });
  } catch (error) {
    console.error('Error al obtener los registros de navegación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para agregar un nuevo registro de navegación
router.post('/navegacion', async (req, res) => {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const { nombre, barco_id } = req.body;

    // Validar que se proporciona el id del barco
    if (!barco_id) {
      return res.status(400).json({ error: 'El id del barco es obligatorio' });
    }

    const fecha = new Date().toISOString().slice(0, 10); // Formato: YYYY-MM-DD
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Insertar el nuevo registro en la base de datos
    const result = await db.promise().query('INSERT INTO navegacion (nombre, hora, fecha, barco_id) VALUES (?, ?, ?, ?)', [nombre, hora, fecha, barco_id]);

    // Verificar el resultado si es necesario
    console.log("Resultado de la inserción:", result);

    res.status(201).json({ mensaje: 'Registro de navegación creado exitosamente' });
  } catch (error) {
    console.error('Error al insertar el registro de navegación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

