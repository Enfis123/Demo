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

module.exports = router;
