const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const csurf = require('csurf');
const { db } = require('./db');
const xss = require('xss');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const router = express.Router();

// Middleware para analizar cookies
router.use(cookieParser());

// Middleware para manejar CSRF
const csrfProtection = csurf({ cookie: true });

// Ruta para la autenticación del usuario
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Sanitizar los datos de entrada
  const sanitizedUsername = xss(username);

  // Consulta SQL para obtener la contraseña almacenada del usuario
  const sql = "SELECT * FROM usuarios WHERE username = ?";
  
  try {
    db.query(sql, [sanitizedUsername], async (err, results) => {
      if (err) {
        console.error("Error al consultar la base de datos: " + err);
        return res.status(500).send("Error interno del servidor");
      }

      if (results.length === 1) {
        const user = results[0];
        const currentDateTime = new Date();
        const expirationDate = new Date(currentDateTime.getTime() + 30 * 60 * 1000);

        // Comparar la contraseña ingresada con la contraseña almacenada utilizando bcrypt
        try {
          const match = await bcrypt.compare(password, user.password); // No sanitizar la contraseña
          if (match) {
            if (user.secret) {
              // Si el usuario ya tiene un secreto para 2FA, solicita el código de autenticación
              res.status(200).json({ success: true, message: "Introduce el código de autenticación." });
            } else {
              // Si no tiene secreto, genera uno nuevo y envía el código QR
              const secret = speakeasy.generateSecret({ length: 20 });
              const otpauth_url = secret.otpauth_url;
              const qrCodeUrl = await QRCode.toDataURL(otpauth_url);

              // Actualiza el secreto en la base de datos
              const updateSecretSql = "UPDATE usuarios SET secret = ? WHERE id = ?";
              db.query(updateSecretSql, [secret.base32, user.id], (err) => {
                if (err) {
                  console.error("Error al actualizar el secreto de 2FA: " + err);
                  return res.status(500).send("Error interno del servidor");
                }

                res.status(200).json({ success: true, qrCodeUrl, message: "Escanea el código QR con tu aplicación de autenticación.",role: user.role  });
              });
            }
          } else {
            // Contraseña incorrecta
            res.status(401).json({ message: "Credenciales incorrectas" });
          }
        } catch (error) {
          console.error("Error al comparar contraseñas: " + error);
          res.status(500).send("Error interno del servidor");
        }
      } else {
        // Usuario no encontrado
        res.status(401).json({ message: "Credenciales incorrectas" });
      }
    });
  } catch (error) {
    console.error("Error inesperado: " + error);
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta para verificar el código de autenticación 2FA
router.post("/verify", async (req, res) => {
  const { username, code } = req.body;

  // Sanitizar los datos de entrada
  const sanitizedUsername = xss(username);

  // Consulta SQL para obtener el secreto del usuario
  const sql = "SELECT secret, user_role FROM usuarios WHERE username = ?";
  
  try {
    db.query(sql, [sanitizedUsername], (err, results) => {
      if (err) {
        console.error("Error al consultar la base de datos: " + err);
        return res.status(500).send("Error interno del servidor");
      }

      if (results.length === 1) {
        const user = results[0];

        // Verificar el código de autenticación
        const isValid = speakeasy.totp.verify({
          secret: user.secret,
          encoding: 'base32',
          token: code
        });

        if (isValid) {
          const currentDateTime = new Date();
          const expirationDate = new Date(currentDateTime.getTime() + 30 * 60 * 1000);

          // Actualizar la hora de último acceso en la base de datos
          const updateLastAccessSql = "UPDATE usuarios SET last_access = ? WHERE id = ?";
          db.query(updateLastAccessSql, [currentDateTime, user.id], (err) => {
            if (err) {
              console.error("Error al actualizar la hora de último acceso: " + err);
            }
          });

          // Configurar la cookie y devolver la respuesta
          res.cookie('username', sanitizedUsername, { expires: expirationDate, httpOnly: true, secure: true });
          res.status(200).json({ success: true, role: user.user_role, message: "Autenticación 2FA exitosa" });
        } else {
          res.status(401).json({ message: "Código de autenticación incorrecto" });
        }
      } else {
        res.status(401).json({ message: "Usuario no encontrado" });
      }
    });
  } catch (error) {
    console.error("Error inesperado: " + error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;