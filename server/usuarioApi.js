const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { db, obtenerNuevosRegistros } = require('./db');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const xss = require('xss');

// Configurar middleware para CSRF
const csrfProtection = csrf({ cookie: true });
router.use(cookieParser());

// Función para verificar la existencia de un usuario por nombre de usuario
function checkUserExists(username, callback) {
  const checkUserExistsQuery = "SELECT * FROM usuarios WHERE username = ?";
  db.query(checkUserExistsQuery, [username], (error, results) => {
    if (error) {
      console.error("Error al verificar la existencia del usuario: " + error);
      return callback(error, null);
    }

    callback(null, results.length > 0);
  });
}

// Ruta para obtener todos los usuarios
router.get("/users", (req, res) => {
  // Consulta SQL para obtener todos los usuarios de la base de datos
  const getUsersQuery = "SELECT * FROM usuarios";

  db.query(getUsersQuery, (error, results) => {
    if (error) {
      console.error("Error al obtener usuarios: " + error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    res.status(200).json(results);
  });
});

// Middleware de validación para el cuerpo de la solicitud
const validateRegisterInput = [
  body('username').trim().isLength({ min: 1 }).escape().withMessage('Username es requerido'),
  body('password').trim().isLength({ min: 6 }).escape().withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('email').trim().isEmail().normalizeEmail().escape().withMessage('Correo electrónico no válido'),
  body('user_role').trim().escape(),
  body('account_status').trim().escape()
];

// Endpoint para registrar un nuevo usuario
router.post("/users", validateRegisterInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let { username, password, email, user_role, account_status } = req.body;

  // Sanitizar los datos de entrada
  username = xss(username);
  email = xss(email);
  user_role = xss(user_role);
  account_status = xss(account_status);

  try {
    // Verificar si el usuario ya existe en la base de datos
    const checkUserExistsQuery = "SELECT * FROM usuarios WHERE username = ?";
    db.query(checkUserExistsQuery, [username], async (error, results) => {
      if (error) {
        console.error("Error al consultar la base de datos:", error);
        return res.status(500).send("Error del servidor");
      }

      if (results.length > 0) {
        return res.status(409).json({ error: "El usuario ya existe" });
      }

      // Hash de la contraseña
      const saltRounds = 10;
      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar nuevo usuario en la base de datos
        const insertSql = "INSERT INTO usuarios (username, password, email, user_role, account_status) VALUES (?, ?, ?, ?, ?)";
        db.query(insertSql, [username, hashedPassword, email, user_role, account_status], (err, result) => {
          if (err) {
            console.error("Error al insertar en la base de datos:", err);
            return res.status(500).send("Error del servidor");
          }
          console.log("Usuario registrado con éxito");
          res.status(201).json({ message: "Usuario registrado con éxito" });
        });
      } catch (hashError) {
        console.error("Error al hashear la contraseña:", hashError);
        res.status(500).send("Error del servidor");
      }
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    res.status(500).send("Error del servidor");
  }
});
// Ruta para obtener un usuario por su ID
router.get("/users/:id", csrfProtection, (req, res) => {
  const userId = req.params.id;
  // Consulta SQL para obtener un usuario específico por su ID
  const getUserByIdQuery = "SELECT * FROM usuarios WHERE id = ?";

  db.query(getUserByIdQuery, [userId], (error, results) => {
    if (error) {
      console.error("Error al obtener el usuario: " + error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(results[0]);
  });
});

// Ruta para editar un usuario por su ID
router.put("/users/:id", csrfProtection, (req, res) => {
  const userId = req.params.id;
  const { username, password, email, user_role, account_status } = req.body;

  // Sanitizar los datos de entrada
  username = xss(username);
  password = xss(password); // La contraseña no se debe sanitizar para mantener su seguridad.
  email = xss(email);
  user_role = xss(user_role);
  account_status = xss(account_status);
  // Consulta SQL para actualizar un usuario por su ID
  const updateUserQuery =
    "UPDATE usuarios SET username = ?, password = ?, email = ?, user_role = ?, account_status = ? WHERE id = ?";

  db.query(
    updateUserQuery,
    [username, password, email, user_role, account_status, userId],
    (error, results) => {
      if (error) {
        console.error("Error al editar el usuario: " + error);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.status(200).json({ message: "Usuario editado con éxito" });
    }
  );
});

// Ruta para eliminar un usuario por su ID
router.delete("/users/:id", csrfProtection, (req, res) => {
  const userId = req.params.id;

  // Consulta SQL para eliminar un usuario por su ID
  const deleteUserQuery = "DELETE FROM usuarios WHERE id = ?";

  db.query(deleteUserQuery, [userId], (error, results) => {
    if (error) {
      console.error("Error al eliminar el usuario: " + error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Usuario eliminado con éxito" });
  });
});

// Ruta para obtener el token CSRF
router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;

