const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./db"); // Reemplaza la ruta con la ubicación real de db.js

const router = express.Router();

// Middleware para analizar cookies
router.use(cookieParser());

// Ruta para la autenticación del usuario
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Consulta SQL para verificar las credenciales del usuario
  const sql = "SELECT * FROM usuarios WHERE username = ? AND password = ?";

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("Error al consultar la base de datos: " + err);
      return res.status(500).send("Error interno del servidor");
    }

    if (results.length === 1) {
      // Usuario autenticado con éxito
      res.cookie('username', results[0].username); // Almacena el nombre de usuario en la cookie

      // Envia una respuesta JSON con un mensaje de éxito
      res.status(200).json({ message: "Inicio de sesión exitoso" });
    } else {
      // Usuario no encontrado o contraseña incorrecta
      res.status(401).json({ message: "Credenciales incorrectas" });
    }
  });
});

module.exports = router;
