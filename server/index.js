const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const db = require('./db');
const loginApi = require('./loginApi');
const usuarioApi = require('./usuarioApi'); // Asegúrate de que la ruta sea correcta
const barcoApi = require('./barcoApi'); // Asegúrate de que la ruta sea correcta
const varibalesApi = require('./variablesApi'); // Asegúrate de que la ruta sea correcta

const app = express();
const port = 3000;
// Configuración de Multer para manejar la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../client/public/fotos/barcos'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Puedes personalizar el nombre del archivo si lo deseas
  },
});

const upload = multer({ storage: storage }); // Inicializa multer con la configuración


// Configura Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../client/public')));

// Configura el middleware para analizar cookies
app.use(cookieParser());

app.use(express.json());
app.use('/api', loginApi);
app.use('/api', usuarioApi);
app.use('/api', barcoApi);
app.use('/api', varibalesApi);

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
// Ruta para manejar la subida de la imagen
app.post('/api/subir-imagen', upload.single('imagen'), (req, res) => {
  // Aquí puedes acceder a la información de la imagen subida
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
  }

  const imagenPath = `/fotos/barcos/${req.file.filename}`;

  // Realiza las operaciones necesarias con la información de la imagen y otros datos

  // Devuelve la respuesta adecuada al cliente
  res.status(200).json({ url: imagenPath });
});


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
