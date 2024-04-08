const express = require("express");
const router = express.Router();
const { db, obtenerNuevosRegistros } = require('./db');

// Función para verificar la existencia de un usuario por nombre de usuario
router.post("/variables", async (req, res) => {
    const { nombreVariable, unidadMedida, graficoEstadistico, idBarco, rangoMin, rangoMax } = req.body;

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

        // Insert the new scale with provided values
        await connection.query(insertEscalaSql, [
            graficoEstadistico,
            unidadMedida,
            rangoMin,
            rangoMax,
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
        V.idVariable, V.idBarco, V.nombre AS nombreVariable, V.unidadMedida, V.fechaCreacion, V.graficoEstadistico, V.alm_l,V.alm_h,
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
router.put("/variables/:id", async (req, res) => {
    const { nombreVariable, unidadMedida, graficoEstadistico, idBarco, rangoMax, rangoMin } = req.body;
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

        // Actualizar la escala en la base de datos
        const updateEscalaSql =
            "UPDATE Escala SET nombre = ?, unidadMedida = ?, rangoMax = ?, rangoMin = ? WHERE idVariable = ?";

        await connection.query(updateEscalaSql, [
            graficoEstadistico,
            unidadMedida,
            rangoMax,
            rangoMin,
            variableId,
        ]);

        res.status(200).json({ message: "Variable y escala actualizadas con éxito" });
    } catch (error) {
        console.error("Error al actualizar la variable y escala:", error);
        res.status(500).send("Error interno del servidor");
    }
});

router.delete("/variables/:id", async (req, res) => {
    const variableId = req.params.id;

    const connection = await db.promise();

    try {
        // Comenzar una transacción
        await connection.beginTransaction();

        // Obtener la información de la variable antes de eliminarla
        const variableInfoSql = "SELECT * FROM Variable WHERE idVariable = ?";
        const [variableInfoRows] = await connection.query(variableInfoSql, [variableId]);

        if (variableInfoRows.length === 0) {
            // Si no se encuentra la variable, maneja el error
            throw new Error("Variable no encontrada");
        }

        // Eliminar la escala asociada a la variable
        const deleteEscalaSql = "DELETE FROM Escala WHERE idVariable = ?";
        await connection.query(deleteEscalaSql, [variableId]);

        // Eliminar datos fijos asociados a la variable
        const deleteDatosFijosSql = "DELETE FROM datos_fijos WHERE id_variable = ?";
        await connection.query(deleteDatosFijosSql, [variableId]);

        // Eliminar datos temporales asociados a la variable
        const deleteDatosTemporalesSql = "DELETE FROM datos_temporales WHERE id_variable = ?";
        await connection.query(deleteDatosTemporalesSql, [variableId]);

        // Eliminar la variable de la tabla Variable
        const deleteVariableSql = "DELETE FROM Variable WHERE idVariable = ?";
        await connection.query(deleteVariableSql, [variableId]);

        // Confirmar la transacción
        await connection.commit();

        res.status(200).json({ message: "Variable y datos asociados eliminados con éxito" });
    } catch (error) {
        // Revertir la transacción en caso de error
        if (connection) {
            await connection.rollback();
        }

        console.error("Error al eliminar la variable:", error);
        res.status(500).json({ error: "Error interno del servidor", message: error.message });
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

router.get('/variables/:id/datos_fijos', async (req, res) => {
    const variableId = req.params.id;
    const { fechaInicio, fechaFin } = req.query;

    try {
        const selectDatosFijosSql = `
        SELECT df.id, df.id_barco, df.id_variable, df.id_escala, df.timestamp, df.valor,
            b.nombre AS nombre_barco,
            b.anio AS anio_barco,
            b.tipo_motor AS tipo_motor_barco,
            b.horas_trabajo_motor AS horas_trabajo_motor_barco,
            b.tipo_control AS tipo_control_barco,
            b.imagen AS imagen_barco,
            v.nombre AS nombre_variable,
            v.unidadMedida AS unidad_medida_variable,
            v.fechaCreacion AS fecha_creacion_variable,
            v.graficoEstadistico AS grafico_estadistico_variable,
            e.nombre AS nombre_escala,
            e.unidadMedida AS unidad_medida_escala,
            e.rangoMin AS rango_min_escala,
            e.rangoMax AS rango_max_escala
        FROM datos_fijos df
        JOIN barcos b ON df.id_barco = b.id
        JOIN Variable v ON df.id_variable = v.idVariable
        JOIN Escala e ON df.id_escala = e.idEscala
        WHERE df.id_variable = ? AND df.timestamp BETWEEN ? AND ?
    `;

        console.log("Consulta SQL:", selectDatosFijosSql);
        console.log("Valores:", [variableId, fechaInicio, fechaFin]);

        // Ejecuta la consulta
        const [datosFijos] = await db.promise().query(selectDatosFijosSql, [variableId, fechaInicio, fechaFin]);

        console.log("Datos obtenidos:", datosFijos);

        // Envia la respuesta con los datos fijos
        res.status(200).json(datosFijos);
    } catch (error) {
        console.error("Error al obtener datos fijos por ID de variable y rango de fecha y hora: " + error.message);
        res.status(500).send("Error interno del servidor");
    }
});


module.exports = {
    router
};