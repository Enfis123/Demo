const express = require("express");
const bcrypt = require("bcrypt");
const { db } = require('./db');

const router = express.Router();

// Endpoint para registrar un nuevo usuario
router.post("/register", (req, res) => {
  // Sanitización de los campos de entrada
  const { username, password, email, user_role, account_status } = sanitizeInputs(req.body);

  // Función para sanitizar los campos
  function sanitizeInputs(data) {
    const sanitizedUsername = sanitize(data.username);
    const sanitizedPassword = sanitize(data.password);
    const sanitizedEmail = sanitize(data.email);
    const sanitizedUserRole = sanitize(data.user_role);
    const sanitizedAccountStatus = sanitize(data.account_status);
    return {
      username: sanitizedUsername,
      password: sanitizedPassword,
      email: sanitizedEmail,
      user_role: sanitizedUserRole,
      account_status: sanitizedAccountStatus
    };
  }

  // Función para sanitizar un campo específico
  function sanitize(value) {
    // Implementa tu lógica de sanitización aquí (por ejemplo, limpieza de caracteres especiales)
    // En este ejemplo, se realiza una limpieza básica
    return value ? value.toString().trim() : '';
  }

  // Verificar si el usuario ya existe
  checkUserExists(username, (error, userExists) => {
    if (error) {
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (userExists) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    // Generar fecha y hora actual para registration_date
    const currentDateTime = new Date();

    // Hash de la contraseña antes de guardarla
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error al hashear la contraseña: " + err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      // Consulta SQL para insertar un nuevo usuario en la base de datos
      const insertSql =
        "INSERT INTO usuarios (username, password, email, registration_date, user_role, account_status) VALUES (?, ?, ?, ?, ?, ?)";

      db.query(
        insertSql,
        [username, hashedPassword, email, currentDateTime, user_role, account_status],
        (err, results) => {
          if (err) {
            console.error("Error al crear un nuevo usuario: " + err);
            return res.status(500).json({ error: "Error interno del servidor" });
          }

          // Verificar si se creó correctamente el nuevo usuario
          if (results.affectedRows === 1) {
            res.status(201).json({ message: "Usuario creado con éxito" });
          } else {
            res.status(500).json({ message: "Error al crear el usuario" });
          }
        }
      );
    });
  });
});

module.exports = router;
