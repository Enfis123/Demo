const express = require("express");
const router = express.Router();
const { db, obtenerNuevosRegistros } = require('./db');

// Ruta para agregar un nuevo registro de navegación
router.post('/navegacion', async (req, res) => {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const { nombre, barco_id } = req.body;

    // Validar que se proporciona el id del barco
    if (!barco_id) {
      return res.status(400).json({ error: 'El id del barco es obligatorio' });
    }

    // Obtener la fecha y hora actual
    const fecha = new Date().toISOString().slice(0, 10); // Formato: YYYY-MM-DD
    const hora = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

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

