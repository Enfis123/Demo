const express = require("express");
const router = express.Router();
const { db, obtenerNuevosRegistros } = require('./db');

// Función para verificar la existencia de un usuario por nombre de usuario
router.post("/variables", async (req, res) => {
    const { nombreVariable, unidadMedida, graficoEstadistico, idBarco } = req.body;

    // Genera una fecha y hora actual para fechaCreacion
    const currentDateTime = new Date();
    const connection = await db.promise(); // Use the promise() method to work with promises instead of callbacks

    try {
        // Check if the provided idBarco exists in the barcos table
        const barcoCheckSql = "SELECT * FROM barcos WHERE id = ?";
        const [barcoRows] = await connection.query(barcoCheckSql, [idBarco]);

        if (barcoRows.length === 0) {
            // If no matching barco is found, handle the error
            throw new Error("Invalid idBarco. No matching record in barcos table.");
        }

        // Begin a transaction
        await connection.beginTransaction();

        // SQL query to insert a new variable into the database
        const insertVariableSql =
            "INSERT INTO Variable (nombre, unidadMedida, fechaCreacion, graficoEstadistico, idBarco) VALUES (?, ?, ?, ?, ?)";

        // Insert the new variable
        const variableResult = await connection.query(insertVariableSql, [
            nombreVariable,
            unidadMedida,
            currentDateTime,
            graficoEstadistico,
            idBarco,
        ]);

        // Get the ID of the newly inserted variable
        const idVariable = variableResult[0].insertId;

        // SQL query to insert a new scale into the database
        const insertEscalaSql =
            "INSERT INTO Escala (nombre, unidadMedida, rangoMin, rangoMax, idVariable) VALUES (?, ?, ?, ?, ?)";

        // Insert the new scale with default values (0 to 100)
        await connection.query(insertEscalaSql, [
            graficoEstadistico,
            unidadMedida,
            0,
            100,
            idVariable,
        ]);

        // Commit the transaction
        await connection.commit();

        // Send the successful response
        res.status(201).json({ message: "Variable y escala creadas con éxito" });
    } catch (error) {
        // Rollback the transaction in case of an error
        if (connection) {
            await connection.rollback();
        }

        console.error("Error al crear una nueva variable y escala: " + error.message);
        res.status(500).send("Error interno del servidor");
    }
});
router.get("/variables", async (req, res) => {
    const connection = await db.promise();

    try {
        // Consulta SQL para obtener todas las variables con sus datos de la tabla Escala
        const selectVariablesSql = `
        SELECT 
        V.idVariable, V.idBarco, V.nombre AS nombreVariable, V.unidadMedida, V.fechaCreacion, V.graficoEstadistico,
        E.idEscala, E.nombre AS nombreEscala, E.rangoMin, E.rangoMax,
        B.nombre AS nombreBarco
        FROM Variable V
        LEFT JOIN Escala E ON V.idVariable = E.idVariable
        LEFT JOIN Barcos B ON V.idBarco = B.id
        `;

        // Ejecuta la consulta
        const [variables] = await connection.query(selectVariablesSql);

        // Envia la respuesta con las variables y sus datos de la tabla Escala
        res.status(200).json(variables);
    } catch (error) {
        console.error("Error al obtener todas las variables con datos de la tabla Escala: " + error.message);
        res.status(500).send("Error interno del servidor");
    } 
});
// Ruta PUT para actualizar una variable
router.put("/variables/:id", async (req, res) => {
    const { nombreVariable, unidadMedida, graficoEstadistico, idBarco } = req.body;
    const variableId = req.params.id;
  
    const connection = await db.promise();
  
    try {
      // Verificar si el idBarco existe en la tabla barcos
      const barcoCheckSql = "SELECT * FROM barcos WHERE id = ?";
      const [barcoRows] = await connection.query(barcoCheckSql, [idBarco]);
  
      if (barcoRows.length === 0) {
        // Si no se encuentra un barco con el id proporcionado, maneja el error
        throw new Error("Invalid idBarco. No matching record in barcos table.");
      }
  
      // Actualizar la variable en la base de datos
      const updateVariableSql =
        "UPDATE Variable SET nombre = ?, unidadMedida = ?, graficoEstadistico = ?, idBarco = ? WHERE idVariable = ?";
  
      await connection.query(updateVariableSql, [
        nombreVariable,
        unidadMedida,
        graficoEstadistico,
        idBarco,
        variableId,
      ]);
  
      res.status(200).json({ message: "Variable actualizada con éxito" });
    } catch (error) {
      console.error("Error al actualizar la variable:", error);
      res.status(500).send("Error interno del servidor");
    } 
  });
  router.delete("/variables/:id", async (req, res) => {
    const variableId = req.params.id;

    const connection = await db.promise();

    try {
        // Comenzar una transacción
        await connection.beginTransaction();

        // Eliminar la escala asociada a la variable
        const deleteEscalaSql = "DELETE FROM Escala WHERE idVariable = ?";
        await connection.query(deleteEscalaSql, [variableId]);

        // Eliminar la variable de la tabla Variable
        const deleteVariableSql = "DELETE FROM Variable WHERE idVariable = ?";
        await connection.query(deleteVariableSql, [variableId]);

        // Confirmar la transacción
        await connection.commit();

        res.status(200).json({ message: "Variable eliminada con éxito" });
    } catch (error) {
        // Revertir la transacción en caso de error
        if (connection) {
            await connection.rollback();
        }

        console.error("Error al eliminar la variable:", error);
        res.status(500).send("Error interno del servidor");
    } 
});
// Ruta GET para obtener una variable por ID
router.get("/variables/:id", async (req, res) => {
    const variableId = req.params.id;
    const connection = await db.promise();

    try {
        // Consulta SQL para obtener una variable por ID con sus datos de la tabla Escala
        const selectVariableSql = `
        SELECT 
        V.idVariable, V.idBarco, V.nombre AS nombreVariable, V.unidadMedida, V.fechaCreacion, V.graficoEstadistico,
        E.idEscala, E.nombre AS nombreEscala, E.rangoMin, E.rangoMax,
        B.nombre AS nombreBarco
        FROM Variable V
        LEFT JOIN Escala E ON V.idVariable = E.idVariable
        LEFT JOIN Barcos B ON V.idBarco = B.id
        WHERE V.idVariable = ?
        `;

        // Ejecuta la consulta
        const [variable] = await connection.query(selectVariableSql, [variableId]);

        // Verifica si se encontró una variable con el ID proporcionado
        if (variable.length === 0) {
            res.status(404).json({ message: "Variable no encontrada" });
        } else {
            // Envia la respuesta con los datos de la variable y su escala
            res.status(200).json(variable[0]);
        }
    } catch (error) {
        console.error("Error al obtener la variable por ID: " + error.message);
        res.status(500).send("Error interno del servidor");
    } 
});
// Ruta GET para obtener datos temporales filtrados por ID de variable
router.get('/variables/:id/datos_temporales', async (req, res) => {
  const variableId = req.params.id;

  try {
    // Consulta SQL para obtener datos temporales filtrados por ID de variable
    const selectDatosTemporalesSql = `
      SELECT id, id_barco, id_variable, id_escala, timestamp, valor
      FROM datos_temporales
      WHERE id_variable = ?
    `;

    // Ejecuta la consulta
    const [datosTemporales] = await db.promise().query(selectDatosTemporalesSql, [variableId]);

    // Envia la respuesta con los datos temporales
    res.status(200).json(datosTemporales);
  } catch (error) {
    console.error("Error al obtener datos temporales por ID de variable: " + error.message);
    res.status(500).send("Error interno del servidor");
  }
});



module.exports = {
    router
  };