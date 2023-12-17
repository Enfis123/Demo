const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'proyectobarco'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conexión a la base de datos MySQL exitosa');
});

function obtenerNuevosRegistros() {
  return new Promise((resolve, reject) => {
    const consultaSQL = `
      SELECT * FROM datos_temporales
      WHERE timestamp > (NOW() - INTERVAL 3  SECOND);  -- Ajusta el intervalo según tus necesidades
    `;

    db.query(consultaSQL, (error, resultados) => {
      if (error) {
        reject(error);
      } else {
        resolve(resultados);
      }
    });
  });
}

module.exports = {
  db,
  obtenerNuevosRegistros
};
