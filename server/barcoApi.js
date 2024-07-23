const express = require('express');
const router = express.Router();
const { db, obtenerNuevosRegistros } = require('./db');
const { body, validationResult } = require('express-validator');
const xss = require('xss');


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
router.post(
  '/barcos',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('anio').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Año no válido'),
    body('tipo_motor').trim().notEmpty().withMessage('El tipo de motor es obligatorio'),
    body('horas_trabajo_motor').isInt({ min: 0 }).withMessage('Horas de trabajo del motor deben ser un número positivo'),
    body('tipo_control').trim().notEmpty().withMessage('El tipo de control es obligatorio'),
    body('imagen').trim().notEmpty().withMessage('La imagen es obligatoria')
  ],
  (req, res) => {
    // Maneja los resultados de la validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Obtén los datos del cuerpo de la solicitud
    const { nombre, anio, tipo_motor, horas_trabajo_motor, tipo_control, imagen } = req.body;
    const sanitizedNombre = xss(nombre);
    const sanitizedTipoMotor = xss(tipo_motor);
    const sanitizedTipoControl = xss(tipo_control);
    const sanitizedImagen = xss(imagen);
    // Consulta SQL para insertar un nuevo barco en la base de datos
    const sql = 'INSERT INTO barcos (nombre, anio, tipo_motor, horas_trabajo_motor, tipo_control, imagen) VALUES (?, ?, ?, ?, ?, ?)';

    // Ejecuta la consulta en la base de datos
    db.query(sql, [sanitizedNombre, anio, sanitizedTipoMotor, horas_trabajo_motor, sanitizedTipoControl, sanitizedImagen], (err, result) => {

        if (err) {
          console.error('Error al insertar en la base de datos: ' + err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.status(201).json({ message: 'Barco creado correctamente', barcoId: result.insertId });
      }
    );
  }
);
// Ruta para actualizar un barco por su ID
router.put(
  '/barcos/:id',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('anio').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Año no válido'),
    body('tipo_motor').trim().notEmpty().withMessage('El tipo de motor es obligatorio'),
    body('horas_trabajo_motor').isInt({ min: 0 }).withMessage('Horas de trabajo del motor deben ser un número positivo'),
    body('tipo_control').trim().notEmpty().withMessage('El tipo de control es obligatorio'),
    body('imagen').trim().notEmpty().withMessage('La imagen es obligatoria')
  ],
  (req, res) => {
    // Maneja los resultados de la validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Obtén el ID del barco de los parámetros de la URL
    const barcoId = req.params.id;

    // Obtén los datos actualizados del cuerpo de la solicitud
    const { nombre, anio, tipo_motor, horas_trabajo_motor, tipo_control, imagen } = req.body;
    const sanitizedNombre = xss(nombre);
    const sanitizedTipoMotor = xss(tipo_motor);
    const sanitizedTipoControl = xss(tipo_control);
    const sanitizedImagen = xss(imagen);

    // Consulta SQL para actualizar un barco en la base de datos
    const sql = 'UPDATE barcos SET nombre=?, anio=?, tipo_motor=?, horas_trabajo_motor=?, tipo_control=?, imagen=? WHERE id=?';

     // Ejecuta la consulta en la base de datos
  db.query(
    sql,
    [sanitizedNombre, anio, sanitizedTipoMotor, horas_trabajo_motor, sanitizedTipoControl, sanitizedImagen, barcoId],
    (err, results) => {
        if (err) {
          console.error('Error al actualizar en la base de datos: ' + err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Verifica si se actualizó correctamente
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Barco no encontrado' });
        }

        res.status(200).json({ message: 'Barco actualizado correctamente' });
      }
    );
  }
);
// Ruta para eliminar un barco por su ID
router.delete('/barcos/:id', (req, res) => {
  // Obtén el ID del barco de los parámetros de la URL
  const barcoId = req.params.id;

  // Consulta SQL para eliminar un barco de la base de datos
  const sql = 'DELETE FROM barcos WHERE id=?';

  // Ejecuta la consulta en la base de datos
  db.query(sql, [barcoId], (err, results) => {
    if (err) {
      console.error('Error al eliminar de la base de datos: ' + err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Verifica si se eliminó correctamente
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Barco no encontrado' });
    }

    res.status(200).json({ message: 'Barco eliminado correctamente' });
  });
});
// Ruta para obtener un barco por su ID
router.get('/barcos/:id', (req, res) => {
  // Obtén el ID del barco de los parámetros de la URL
  const barcoId = req.params.id;

  // Consulta SQL para seleccionar un barco por su ID
  const sql = 'SELECT * FROM barcos WHERE id = ?';

  // Ejecuta la consulta en la base de datos
  db.query(sql, [barcoId], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos: ' + err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Verifica si se encontró un barco con el ID proporcionado
    if (results.length === 0) {
      return res.status(404).json({ error: 'Barco no encontrado' });
    }

    // Devuelve el resultado como respuesta
    res.status(200).json(results[0]);
  });
});
// Ruta para obtener todas las variables de un barco por su ID
router.get('/barcos/:id/variables', (req, res) => {
  // Obtén el ID del barco de los parámetros de la URL
  const barcoId = req.params.id;

  // Consulta SQL con JOIN para seleccionar todas las variables de un barco por su ID
  const sql = `
    SELECT Variable.*, Escala.rangoMin, Escala.rangoMax, barcos.nombre as nombreBarco
    FROM Variable
    JOIN barcos ON Variable.idBarco = barcos.id
    LEFT JOIN Escala ON Variable.idVariable = Escala.idVariable
    WHERE idBarco = ?
  `;

  // Ejecuta la consulta en la base de datos
  db.query(sql, [barcoId], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos: ' + err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Devuelve los resultados como respuesta
    res.status(200).json(results);
  });
});
router.get('/barcos/:id_barco/todas-las-tablas', (req, res) => {
  // Obtén el ID del barco de los parámetros de la URL
  const idBarco = req.params.id_barco;

  // Consulta SQL que realiza un JOIN en las tablas para obtener la información del barco específico
  const sql = `
  SELECT Variable.*, df.timestamp, df.valor, Escala.rangoMin, Escala.rangoMax
  FROM Variable
  LEFT JOIN (
      SELECT id_variable, MAX(timestamp) as ultimaFecha
      FROM datos_fijos
      GROUP BY id_variable
  ) ultimosDatos ON Variable.idVariable = ultimosDatos.id_variable
  LEFT JOIN datos_fijos df ON ultimosDatos.id_variable = df.id_variable AND ultimosDatos.ultimaFecha = df.timestamp
  LEFT JOIN Escala ON Variable.idVariable = Escala.idVariable
  WHERE Variable.idBarco = ?;
  
  `;

  // Ejecuta la consulta en la base de datos
  db.query(sql, [idBarco], (err, results) => {
      if (err) {
          console.error('Error al consultar la base de datos: ' + err);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }

      // Devuelve los resultados como respuesta
      res.status(200).json(results);
  });
});



// Ruta para obtener una variable de un barco por su ID
router.get('/barcos/:barcoId/variables/:variableId', (req, res) => {
  // Obtén el ID del barco y de la variable de los parámetros de la URL
  const barcoId = req.params.barcoId;
  const variableId = req.params.variableId;

  // Consulta SQL con JOIN para seleccionar una variable de un barco por su ID
  const sql = 'SELECT Variable.*, barcos.nombre as nombreBarco FROM Variable JOIN barcos ON Variable.idBarco = barcos.id WHERE idBarco = ? AND idVariable = ?';

  // Ejecuta la consulta en la base de datos
  db.query(sql, [barcoId, variableId], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos: ' + err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Verifica si se encontró una variable con el ID proporcionado
    if (results.length === 0) {
      return res.status(404).json({ error: 'Variable no encontrada' });
    }

    // Devuelve el resultado como respuesta
    res.status(200).json(results[0]);
  });
});

module.exports = router;
