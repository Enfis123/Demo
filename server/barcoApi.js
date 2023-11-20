const express = require('express');
const router = express.Router();
const db = require('./db'); // Asegúrate de reemplazar la ruta con la ubicación real de tu archivo de conexión a la base de datos

// Ruta para obtener todos los barcos
router.get('/barcos', (req, res) => {
  // Consulta SQL para seleccionar todos los atributos de la tabla barco
  const sql = 'SELECT * FROM barcos';

  // Ejecuta la consulta en la base de datos
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos: ' + err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Devuelve los resultados como respuesta
    res.status(200).json(results);
  });
});
// Ruta para crear un nuevo barco
router.post('/barcos', (req, res) => {
  // Obtén los datos del cuerpo de la solicitud
  const { nombre, anio, tipo_motor, horas_trabajo_motor, tipo_control, imagen } = req.body;

  // Realiza las validaciones necesarias antes de insertar en la base de datos
  if (!nombre || !anio || !tipo_motor || !tipo_control || !imagen) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Consulta SQL para insertar un nuevo barco en la base de datos
  const sql = 'INSERT INTO barcos (nombre, anio, tipo_motor, horas_trabajo_motor, tipo_control, imagen) VALUES (?, ?, ?, ?, ?, ?)';

  // Ejecuta la consulta en la base de datos
  db.query(
    sql,
    [nombre, anio, tipo_motor, horas_trabajo_motor, tipo_control, imagen],
    (err, results) => {
      if (err) {
        console.error('Error al insertar en la base de datos: ' + err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      res.status(201).json({ message: 'Barco creado correctamente', barcoId: results.insertId });
    }
  );
});
module.exports = router;
