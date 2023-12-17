const express = require("express");
const cookieParser = require("cookie-parser");
const { db, obtenerNuevosRegistros } = require('./db');

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
      const user = results[0];
      const currentDateTime = new Date();
      const expirationDate = new Date(currentDateTime.getTime() + 30 * 60 * 1000);

      // Verifica si el usuario es de tipo "admin"
      if (user.user_role === 'admin') {
        // Actualiza la hora de último acceso en la base de datos
        const updateLastAccessSql = "UPDATE usuarios SET last_access = ? WHERE id = ?";
        db.query(updateLastAccessSql, [currentDateTime, user.id], (err, updateResults) => {
          if (err) {
            console.error("Error al actualizar la hora de último acceso: " + err);
            return res.status(500).send("Error interno del servidor");
          }
        });
        res.cookie('username', user.username, { expires: expirationDate }); // Almacena el nombre de usuario en la cookie con expiración

        // Envia una respuesta JSON con un mensaje de éxito
        res.status(200).json({ message: "Inicio de sesión exitoso" });
      } else {
        // Usuario no es de tipo "admin"
        res.status(403).json({ message: "No tienes permisos de administrador" });
      }
    } else {
      // Usuario no encontrado o contraseña incorrecta
      res.status(401).json({ message: "Credenciales incorrectas" });
    }
  });
});


module.exports = router;
