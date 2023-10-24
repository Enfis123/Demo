const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./db');
const loginApi = require('./loginApi');
const usuarioApi = require('./usuarioApi'); // Asegúrate de que la ruta sea correcta

const app = express();
const port = 3000;

// Configura Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../client/public')));

// Configura el middleware para analizar cookies
app.use(cookieParser());

app.use(express.json());
app.use('/api', loginApi);
app.use('/api', usuarioApi);

// Middleware de autenticación
function requireAuthentication(req, res, next) {
  const username = req.cookies.username;

  if (!username) {
    console.log('Middleware: Usuario no autenticado. Redirigiendo a la página de inicio.');
    return res.redirect('/'); 
  }
  console.log(`Middleware: Usuario autenticado como ${username}`);

  next();
}

// Agrega el middleware de autenticación a la ruta de datos.html
app.get('/datos.html', requireAuthentication, (req, res) => {
  console.log('Accediendo a datos.html');
  res.sendFile(path.join(__dirname, '../client/src/datos.html'));
});
app.get('/barco.html', (req, res) => {
  console.log('Accediendo a barco.html');
  res.sendFile(path.join(__dirname, '../client/src/barco.html'));
});

// Ruta para servir control.html sin autenticación
app.get('/control.html', (req, res) => {
  console.log('Accediendo a control.html');
  res.sendFile(path.join(__dirname, '../client/src/control.html'));
});

// Ruta para servir estadisticas.html sin autenticación
app.get('/estadisticas.html', (req, res) => {
  console.log('Accediendo a estadisticas.html');
  res.sendFile(path.join(__dirname, '../client/src/estadisticas.html'));
});


// Ruta de inicio
app.get('/', (req, res) => {
  console.log('Accediendo a la página de inicio');
  res.sendFile(path.join(__dirname, '../client/src/index.html'));
});

app.listen(port, () => {
  console.log(`El servidor Express está escuchando en el puerto ${port}`);
});
