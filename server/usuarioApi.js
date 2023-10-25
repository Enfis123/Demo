const express = require("express");
const router = express.Router();
const db = require("./db"); // Reemplaza la ruta con la ubicación real de db.js
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
router.post("/users", (req, res) => {
  const { username, password, email, user_role, account_status } = req.body;

  // Verificar si el usuario ya existe
  checkUserExists(username, (error, userExists) => {
    if (error) {
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (userExists) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }
    // Genera una fecha y hora actual para registration_date
    const currentDateTime = new Date();

    // Consulta SQL para insertar un nuevo usuario en la base de datos
    const insertSql =
      "INSERT INTO usuarios (username, password, email, registration_date, user_role, account_status) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(
      insertSql,
      [username, password, email, currentDateTime, user_role, account_status],
      (err, results) => {
        if (err) {
          console.error("Error al crear un nuevo usuario: " + err);
          return res.status(500).send("Error interno del servidor");
        }

        // Verifica si se creó correctamente el nuevo usuario
        if (results.affectedRows === 1) {
          res.status(201).json({ message: "Usuario creado con éxito" });
        } else {
          res.status(500).json({ message: "Error al crear el usuario" });
        }
      }
    );
  });
});

// Ruta para obtener un usuario por su ID
router.get("/users/:id", (req, res) => {
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
router.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const { username, password, email, user_role, account_status } = req.body;

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
router.delete("/users/:id", (req, res) => {
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
module.exports = router;
