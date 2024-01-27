const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { db, obtenerNuevosRegistros } = require('./db');
const loginApi = require('./loginApi');
const usuarioApi = require('./usuarioApi'); // Asegúrate de que la ruta sea correcta
const barcoApi = require('./barcoApi'); // Asegúrate de que la ruta sea correcta
const variablesApi = require('./variablesApi'); // Asegúrate de que la ruta sea correcta
const navegacionApi = require('./navegacionApi'); // Asegúrate de que la ruta sea correcta
const fs = require('fs');

const app = express();
const port = 3000;
// Paso 3: Pasa el servidor Express a Socket.IO
const server = require('http').createServer(app);
const socketIO = require('socket.io')
// Paso 2: Pasa el servidor a Socket.IO
const io = socketIO(server);

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

const storagePortada = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../client/public/fotos/portadas'));
  },
  filename: (req, file, cb) => {
    const nombreArchivo = 'portadaRobotron';

    // Obtén la extensión del archivo original
    const extension = path.extname(file.originalname).toLowerCase();

    // Elimina la imagen existente antes de guardar la nueva de forma sincrónica
    try {
      fs.unlinkSync(path.join(__dirname, '../client/public/fotos/portadas', nombreArchivo + extension));
    } catch (err) {
      // Si hay un error que no sea "no existe", manejarlo
      if (err.code !== 'ENOENT') {
        return cb(err);
      }
    }

    // Luego, llama a la función de callback con el nombre del nuevo archivo y su extensión
    cb(null, nombreArchivo + extension);
  },
});

const uploadPortada = multer({ storage: storagePortada });


//COMENTAR PARA QUITAR LLENADO
// Función para insertar datos automáticamente para una variable específica
function insertarDatosAutomaticos(variableIds) {
  // Aquí implementa la lógica para insertar datos automáticamente
  const timestamp = new Date(); // Puedes generar una marca de tiempo actual

  // Realiza la inserción en la base de datos para cada variable
  const insertDatosSql = `
    INSERT INTO datos_fijos (id_variable, timestamp, valor)
    VALUES (?, ?, ?)
  `;

  // Itera sobre cada ID de variable y realiza la inserción
  variableIds.forEach((variableId) => {
    const valor = Math.random() * 100; // Puedes generar un valor aleatorio (simulación)
    db.promise().query(insertDatosSql, [variableId, timestamp, valor])
      .then(() => {
        // Después de la inserción, emite el evento para notificar a los clientes
        console.log(`Dato insertado automáticamente para la variable ${variableId}. Valor: ${valor}`);
      })
      .catch((error) => {
        console.error(`Error al insertar datos automáticamente para la variable ${variableId}:`, error);
      });
  });
}

// Llama a la función de inserción automática en un intervalo de tiempo (por ejemplo, cada 10 segundos)
setInterval(() => {
  const variableIds = [8,10,12]; // Reemplaza con los IDs de las variables específicas
  insertarDatosAutomaticos(variableIds);
}, 3 * 1000); // 10 segundos en milisegundos

////////////////////////////////////////////////////////////





// Configura Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../client/public')));

// Configura el middleware para analizar cookies
app.use(cookieParser());

app.use(express.json());
app.use('/api', loginApi);
app.use('/api', usuarioApi);
app.use('/api', barcoApi);
app.use('/api', navegacionApi);
app.use('/api', variablesApi.router); // Asegúrate de utilizar '.router' aquí
// Suscripción a datos temporales en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado a Socket.IO');

  // Manejar la suscripción del cliente a datos temporales
  socket.on('subscribeToDatosTemporales', (variableId) => {
    console.log(`Cliente suscrito a datos temporales para la variable ${variableId}`);

    // Configurar una sala para la variable específica
    socket.join(`datos_temporales_${variableId}`);
  });
  // Manejar la anulación de la suscripción del cliente a datos temporales
  socket.on('unsubscribeFromDatosTemporales', (variableId) => {
    console.log(`Cliente anulado de la suscripción a datos temporales para la variable ${variableId}`);

    // Dejar la sala para la variable específica
    socket.leave(`datos_temporales_${variableId}`);
  });
  // Desconectar el socket
  socket.on('disconnect', () => {
    console.log('Cliente desconectado de Socket.IO');
  });
});
// Esta función emite eventos de Socket.IO con los nuevos registros
async function emitirNuevosRegistros() {
  try {
    const nuevosRegistros = await obtenerNuevosRegistros();

    if (Array.isArray(nuevosRegistros) && nuevosRegistros.length > 0) {
      nuevosRegistros.forEach((nuevoRegistro) => {
        const { id_variable } = nuevoRegistro;

        if (id_variable) {
          io.to(`datos_temporales_${id_variable}`).emit('nuevoRegistro', nuevoRegistro);
          console.log(`Se emitió con éxito el evento 'nuevoRegistro' para la variable ${id_variable}`);
        } else {
          console.warn('El nuevo registro no tiene un id_variable válido:', nuevoRegistro);
        }
      });
      console.log('Se emitieron eventos con éxito para todos los nuevos registros.');
    } else {
      console.log('No hay nuevos registros para emitir.');
    }
  } catch (error) {
    console.error('Error al obtener nuevos registros:', error);
  }
}

// Puedes configurar un temporizador para ejecutar la emisión periódicamente
setInterval(emitirNuevosRegistros, 3000); // Emitir cada 5 segundos, ajusta según tus necesidades


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
// Ruta para manejar la subida de la imagen de portada
app.post('/api/subir-imagen-portada', uploadPortada.single('portada'), (req, res) => {
  // Accede a la información de la imagen subida
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó ninguna imagen de portada' });
  }

  const portadaPath = `/fotos/portadas/${req.file.filename}`;

  // Realiza las operaciones necesarias con la información de la imagen y otros datos

  // Devuelve la respuesta adecuada al cliente
  res.status(200).json({ url: portadaPath });
});
// Ruta para obtener la única imagen de portada
app.get('/api/obtener-imagen-portada', (req, res) => {
  const carpetaPortadas = path.join(__dirname, '../client/public/fotos/portadas');

  // Esto es solo un ejemplo, debes ajustar esta lógica según tus necesidades
  const imagenesPortada = fs.readdirSync(carpetaPortadas).filter(file => file.endsWith('.jpg') || file.endsWith('.png'));

  if (imagenesPortada.length === 0) {
    return res.status(404).json({ error: 'No se encontró ninguna imagen de portada' });
  }

  const primeraImagenPortada = imagenesPortada[0];
  const urlImagenPortada = `/fotos/portadas/${primeraImagenPortada}`;

  // Devuelve la URL o la imagen directamente como respuesta
  res.status(200).json({ url: urlImagenPortada });
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

server.listen(port, () => {
  console.log(`El servidor Express está escuchando en el puerto ${port}`);
});
