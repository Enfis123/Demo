document.addEventListener('DOMContentLoaded', function () {
    var variableSelect = document.getElementById('variable-select');
    var chartContainer = document.getElementById('chart-container');
    var myChart;

    // Fetch para obtener variables disponibles
    fetch('/api/variables')
        .then(response => response.json())
        .then(variables => {
            // Llenar el select con opciones de variables
            variables.forEach(variable => {
                var option = document.createElement('option');
                option.value = variable.idVariable;
                option.text = variable.nombreVariable;
                variableSelect.appendChild(option);
            });

            // Crear la instancia inicial de Chart al cargar la página
            createInitialChart(variables[0].idVariable);
        })
        .catch(error => console.error('Error al obtener variables:', error));

    // Función para crear la instancia inicial de Chart
    function createInitialChart(initialVariableId) {
        fetch('/api/variables/' + initialVariableId)
            .then(response => response.json())
            .then(initialVariableDetails => {
                // Crear el gráfico inicial
                createChart(initialVariableDetails);
            })
            .catch(error => console.error('Error al obtener detalles de la variable:', error));
    }

 // Función para crear la instancia de Chart
 function createChart(variableDetails) {
  var data = {
      labels: ['Label 1', 'Label 2', 'Label 3'],
      datasets: [{
          label: variableDetails.nombreVariable,
          data: [10, 20, 30],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
      }]
  };

  var options = {
      scales: {
          y: {
              beginAtZero: true
          }
      }
  };

  // Crear el gráfico al cargar la página
  var ctx = document.getElementById('chart').getContext('2d');
  myChart = new Chart(ctx, {
      type: variableDetails.graficoEstadistico,
      data: data,
      options: options
  });
}

// Evento change para actualizar la gráfica al seleccionar una variable
variableSelect.addEventListener('change', function () {
  var variableSeleccionada = variableSelect.value;

  // Hacer un fetch para obtener los detalles de la variable seleccionada
  fetch('/api/variables/' + variableSeleccionada)
      .then(response => response.json())
      .then(variableDetails => {
          // Actualizar el contenido de la gráfica según los detalles de la variable
          updateChart(variableDetails);
      })
      .catch(error => console.error('Error al obtener detalles de la variable:', error));
});

// Función para actualizar el contenido de la gráfica
function updateChart(variableDetails) {
  var newData = {
      labels: ['Nuevo Label 1', 'Nuevo Label 2', 'Nuevo Label 3'],
      datasets: [{
          label: variableDetails.nombreVariable,
          data: [40, 50, 60],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
      }]
  };

  // Actualiza los datos y opciones de la gráfica
  myChart.data = newData;
  myChart.config.type = variableDetails.graficoEstadistico;

  // Actualiza el gráfico
  myChart.update();
}
});
