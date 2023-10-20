const express = require('express');
const path = require('path');
const mysql = require('mysql2'); // Agrega el módulo mysql
const db = require('./db'); // Reemplaza la ruta con la ubicación real de db.js
const loginApi = require('./loginApi'); // Reemplaza la ruta con la ubicación real de loginApi.js


const app = express();
const port = 3000;

// Configura Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../client/public')));
app.use(express.json());
app.use('/api', loginApi);
//PRINCIPAL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.listen(port, () => {
  console.log(`El servidor Express está escuchando en el puerto ${port}`);
});

