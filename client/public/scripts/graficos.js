
document.addEventListener('DOMContentLoaded', function () {
    var variableSelect = document.getElementById('variable-select');
    const socket = io();
    var charts = {}; // Objeto para almacenar instancias de gráficos
    var currentVariable = null; // Variable to keep track of the currently selected variable

    // Obtén el parámetro idVariable de la URL
    var urlParams = new URLSearchParams(window.location.search);
    var idVariableFromURL = urlParams.get('idVariable');
    // Obtiene una referencia al botón de volver
    const volverBtn = document.getElementById('volverBarcosBtn');

    // Agrega un evento de clic al botón de volver
    volverBtn.addEventListener('click', function () {
        // Redirige a la página deseada, puedes cambiar 'otra-pagina.html' por la URL de la página a la que quieres volver
        window.location.href = '/barco.html';
    });

    // Escoge la variable en el select según el parámetro de la URL
    if (idVariableFromURL) {
        variableSelect.value = idVariableFromURL;
    }
    fetch('/api/variables')
        .then(response => response.json())
        .then(variables => {
            variables.forEach(variable => {
                var option = document.createElement('option');
                option.value = variable.idVariable;
                option.text = variable.nombreVariable;
                variableSelect.appendChild(option);
            });
            // Establece la variable actual a partir del parámetro de la URL
            currentVariable = idVariableFromURL || variables[0].idVariable;
            variableSelect.value = currentVariable;
            createInitialChart(currentVariable);
            socket.on('nuevoRegistro', (nuevoRegistro) => {
                try {
                    updateChartWithData(nuevoRegistro, currentVariable);
                } catch (error) {
                    console.error('Error en el manejo de nuevoRegistro:', error);
                }
            });
        })
        .catch(error => console.error('Error al obtener variables:', error));

    // Asigna el evento click al botón y llama directamente a buscarDatos
    document.getElementById('buscar-datos-btn').addEventListener('click', function () {
        // Obtener fechas de inicio y fin
        var startDate = document.getElementById('start-date').value;
        var endDate = document.getElementById('end-date').value;
        // Validar las entradas
        if (!startDate || !endDate) {
            alert('Por favor, selecciona fechas de inicio y fin.');
            return;
        }

        // Convertir las fechas a objetos Date para comparación
        var startDateObj = new Date(startDate);
        var endDateObj = new Date(endDate);

        // Validar que la fecha de inicio no sea mayor que la fecha final
        if (startDateObj > endDateObj) {
            alert('La fecha de inicio no puede ser mayor que la fecha final.');
            return;
        }

        // Realizar solicitud fetch a la API para obtener datos según el rango de fechas
        fetch('/api/variables/' + currentVariable + '/datos_fijos?fechaInicio=' + startDate + '&fechaFin=' + endDate)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud: ' + response.statusText);
                }
                return response.json();
            })
            .then(datosFijos => {

                // Crear datos para el gráfico estático
                var data = {
                    labels: datosFijos.map(registro => registro.timestamp),
                    datasets: [{
                        label: 'Datos de la variable: ' + datosFijos[0].nombre_variable + ' Desde: ' + startDate + ' Hasta: ' + endDate,
                        data: datosFijos.map(registro => registro.valor),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false,
                    }]
                };

                var options = {
                    scales: {
                        x: {

                            title: {
                                display: true,
                                text: 'Tiempo' // Título para el eje x
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Medida:(' + datosFijos[0].unidad_medida_variable + ')' // Título para el eje y
                            }
                        }
                    },
                    plugins: {
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'xy',
                            },
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true,
                                },
                                mode: 'xy',
                            }
                        }
                    }
                };
                // Crear contenedor para el gráfico
                var chartContainer = document.getElementById('static-chart-container');
                chartContainer.innerHTML = '<canvas id="static-chart"></canvas>';
                var ctx = document.getElementById('static-chart').getContext('2d');
                // Agregar clase de animación para hacer visible el contenedor de forma animada
                chartContainer.classList.add('fade-in');
                chartContainer.style.display = 'block'
                // Crear gráfico estático
                var myChart = new Chart(ctx, {
                    type: 'line',
                    data: data,
                    options: options
                });
            })
            .catch(error => {
                console.error('Error al obtener datos:', error);
                alert('Hubo un error al obtener los datos. Por favor, inténtalo de nuevo.');
            });
        ;
    });

    // Asegúrate de incluir la biblioteca xlsx en tu proyecto

    document.getElementById('guardar-datos-excel-btn').addEventListener('click', async function () {
        // Obtener fechas de inicio y fin
        var startDate = document.getElementById('start-date').value;
        var endDate = document.getElementById('end-date').value;

        // Validar las entradas
        if (!startDate || !endDate) {
            alert('Por favor, selecciona fechas de inicio y fin.');
            return;
        }

        // Convertir las fechas a objetos Date para comparación
        var startDateObj = new Date(startDate);
        var endDateObj = new Date(endDate);

        // Validar que la fecha de inicio no sea mayor que la fecha final
        if (startDateObj > endDateObj) {
            alert('La fecha de inicio no puede ser mayor que la fecha final.');
            return;
        }

        try {
            // Realizar solicitud fetch a la API para obtener datos según el rango de fechas
            const response = await fetch('/api/variables/' + currentVariable + '/datos_fijos?fechaInicio=' + startDate + '&fechaFin=' + endDate);

            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }

            // Obtener datos en formato JSON
            const datosFijos = await response.json();

            // Convertir datos a formato CSV
            const csvContent = "ID,Barco,Variable,Escala,Timestamp,Valor\n" +
                datosFijos.map(row =>
                    `${row.id},${row.nombre_barco},${row.nombre_variable},${row.nombre_escala},${row.timestamp},${row.valor}`
                ).join("\n");

            // Crear un Blob con el contenido CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            // Crear un enlace de descarga
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", 'Consulta_'+startDateObj+'.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert('Tu navegador no es compatible con esta funcionalidad. Por favor, intenta con otro navegador.');
            }

        } catch (error) {
            console.error('Error al obtener datos:', error);
            alert('Hubo un error al obtener los datos. Por favor, inténtalo de nuevo.');
        }
    });

    function createInitialChart(initialVariableId) {
        fetch('/api/variables/' + initialVariableId)
            .then(response => response.json())
            .then(initialVariableDetails => {
                createChart(initialVariableDetails);
            })
            .catch(error => console.error('Error al obtener detalles de la variable:', error));
    }

    function createChart(variableDetails) {
        var data = {
            datasets: [{
                label: variableDetails.nombreVariable,
                data: [],
                backgroundColor: getBackgroundColor(variableDetails.graficoEstadistico),
                borderColor: getBorderColor(variableDetails.graficoEstadistico),
                borderWidth: 1,
                fill: variableDetails.graficoEstadistico === 'line',
            }]
        };

        var options = {
            scales: {
                x: {

                    title: {
                        display: true,
                        text: 'Tiempo' // Título para el eje x
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Medida:(' + variableDetails.unidadMedida + ')' // Título para el eje y
                    }
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true,
                        },
                        mode: 'xy',
                    }
                }
            }
        };

        // Create a unique ID for the chart container
        var chartContainerId = 'chart-' + variableDetails.idVariable;
        var chartWrapper = document.getElementById('chart-wrapper');
        var chartCanvas = document.createElement('canvas');
        chartCanvas.id = chartContainerId;
        chartWrapper.innerHTML = ''; // Clear previous chart canvases
        chartWrapper.appendChild(chartCanvas);

        var ctx = chartCanvas.getContext('2d');

        if (!ctx) {
            console.error('Canvas context not available for ID:', chartContainerId);
            return;
        }

        // Create a new chart instance
        charts[variableDetails.idVariable] = new Chart(ctx, {
            type: variableDetails.graficoEstadistico,
            data: data,
            options: options
        });

        // Add sliders for zoom control
        addZoomSliders(variableDetails.idVariable);
        socket.emit('subscribeToDatosTemporales', variableDetails.idVariable);

    }

    function addZoomSliders(selectedVariableId) {
        // Agrega sliders para controlar el zoom
        var xSlider = document.getElementById('x-zoom-slider');
        var ySlider = document.getElementById('y-zoom-slider');

        xSlider.addEventListener('input', function () {
            charts[selectedVariableId].options.scales.x.min = parseInt(xSlider.value.split(',')[0]);
            charts[selectedVariableId].options.scales.x.max = parseInt(xSlider.value.split(',')[1]);
            charts[selectedVariableId].update();
        });

        ySlider.addEventListener('input', function () {
            charts[selectedVariableId].options.scales.y.min = parseInt(ySlider.value.split(',')[0]);
            charts[selectedVariableId].options.scales.y.max = parseInt(ySlider.value.split(',')[1]);
            charts[selectedVariableId].update();
        });
    }


    function updateChartWithData(nuevoRegistro, selectedVariableId) {
        var maxDataPoints = 20; // Establecer el número máximo de puntos de datos a mostrar

        var oldData = charts[selectedVariableId].data.datasets[0].data;
        var oldLabels = charts[selectedVariableId].data.labels;

        var newData = [...oldData, parseInt(nuevoRegistro.valor)];
        var newTimestamp = nuevoRegistro.timestamp;

        var formattedTimestamp = moment(newTimestamp).format('DD/MM/YYYY HH:mm:ss');

        // Limitar la cantidad de datos y etiquetas mostradas
        charts[selectedVariableId].data.datasets[0].data = newData.slice(-maxDataPoints);
        charts[selectedVariableId].data.labels = [...oldLabels.slice(-maxDataPoints), formattedTimestamp];
        charts[selectedVariableId].update();

        // Aquí puedes utilizar el id de la variable seleccionada según tus necesidades
        // Mostrar ID, valor y timestamp en el párrafo HTML
        var paragraph = document.getElementById('database-value');
        paragraph.innerHTML = `ID: ${selectedVariableId}<br>Valor: ${nuevoRegistro.valor}<br>Hora y Fecha: ${formattedTimestamp}`;

    }

    variableSelect.addEventListener('change', function () {
        var newVariable = variableSelect.value;
        console.log('variable antigua:', currentVariable)
        if (currentVariable !== null) {
            // Unsubscribe from the previous variable
            socket.emit('unsubscribeFromDatosTemporales', currentVariable);
        }

        // Subscribe to the new variable
        socket.emit('subscribeToDatosTemporales', newVariable);

        // Update the chart based on the new variable
        fetch('/api/variables/' + newVariable)
            .then(response => response.json())
            .then(variableDetails => {
                if (!charts[variableDetails.idVariable]) {
                    createChart(variableDetails);
                } else {
                    updateChart(variableDetails);
                }
            })
            .catch(error => console.error('Error al obtener detalles de la variable:', error));

        // Update the current variable
        currentVariable = newVariable;
        console.log('variable nueva:', currentVariable)

    });

    function updateChart(variableDetails) {
        var selectedVariableId = variableDetails.idVariable;

        // Update the existing chart with the new variable data
        charts[selectedVariableId].destroy(); // Destroy the existing chart
        createChart(variableDetails); // Create a new chart with the updated variable details
    }
    function getBackgroundColor(type) {
        switch (type) {
            case 'bar':
                return 'rgba(75, 192, 192, 0.2)';
            case 'line':
                return 'rgba(255, 99, 132, 0.2)';
            case 'radar':
                return 'rgba(255, 206, 86, 0.2)';
            case 'polarArea':
                return 'rgba(153, 102, 255, 0.2)';
            case 'doughnut':
                return 'rgba(255, 159, 64, 0.2)';
            case 'pie':
                return 'rgba(54, 162, 235, 0.2)';
            default:
                return 'rgba(75, 192, 192, 0.2)';
        }
    }

    function getBorderColor(type) {
        switch (type) {
            case 'bar':
                return 'rgba(75, 192, 192, 1)';
            case 'line':
                return 'rgba(255, 99, 132, 1)';
            case 'radar':
                return 'rgba(255, 206, 86, 1)';
            case 'polarArea':
                return 'rgba(153, 102, 255, 1)';
            case 'doughnut':
                return 'rgba(255, 159, 64, 1)';
            case 'pie':
                return 'rgba(54, 162, 235, 1)';
            default:
                return 'rgba(75, 192, 192, 1)';
        }
    }
});
