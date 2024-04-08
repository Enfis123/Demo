
var idBarcoSeleccionado;

document.addEventListener("DOMContentLoaded", function () {
    var barcoSelect = document.getElementById("barco-select");

    // Cargar opciones de barcos al cargar la página
    cargarOpcionesBarcos("#barco-select", function () {
        // Obtener el ID del primer barco seleccionado
        idBarcoSeleccionado = barcoSelect.value;
        // Cargar datos de la tabla al inicio
        construirTabla(idBarcoSeleccionado);
    });

    // Manejar eventos de cambio en el select de barcos
    barcoSelect.addEventListener("change", function () {
        // Obtener el ID del barco seleccionado
        idBarcoSeleccionado = barcoSelect.value;
        console.log('ID del barco al cambiar:', idBarcoSeleccionado);

        // Cargar datos de la tabla al cambiar el barco
        construirTabla(idBarcoSeleccionado);
    });
});

function cargarOpcionesBarcos(selector) {
    // Realizar una solicitud fetch para obtener opciones de barcos o variables
    fetch('/api/barcos')
        .then(response => response.json())
        .then(data => {
            // Actualizar las opciones del elemento select
            var select = document.querySelector(selector);
            select.innerHTML = ""; // Limpiar opciones existentes

            data.forEach(option => {
                var optionElement = document.createElement("option");
                optionElement.value = option.id;
                optionElement.textContent = option.nombre;
                select.appendChild(optionElement);
                
            });
        })
        .catch(error => console.error('Error:', error));
}



function construirTabla(idBarco) {
    // Realizar una solicitud fetch para obtener datos de la tabla utilizando la nueva ruta
    fetch(`/api/barcos/${idBarco}/todas-las-tablas`)
        .then(response => response.json())
        .then(data => {
            // Construir la tabla utilizando los datos recibidos
            var tabla = document.getElementById("tablaVariables");
            tabla.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

            // Agregar encabezados de la tabla
            var encabezados = "<thead><tr><th>Nombre de la Variable</th><th>Unidad de medida de la Variable</th><th>Dial Gauge</th><th>Alm_H</th><th>Alm_L</th><th>Detalle</th><th>Estadistica</th></tr></thead>";
            tabla.innerHTML += encabezados;

            // Agregar filas de la tabla
            var cuerpo = "<tbody>";
            data.forEach(item => {
                var luzRoja = item.valor > item.alm_h;
                var luzVerde = item.valor < item.alm_l;

                // Redondear el valor al número entero más cercano
                var valorRedondeado = Math.round(item.valor);

                cuerpo += `<tr>
                    <td>${item.nombre}</td>
                    <td>${item.unidadMedida}</td>
                    <td>
                        <div class="dial-gauge-container">
                            <input type="text" class="dial-gauge" value="${valorRedondeado}" readonly>
                        </div>
                    </td>
                    <td>
                        <div class="red-light ${luzRoja ? 'on' : 'off'}"></div>
                    </td>
                    <td>
                        <div class="green-light ${luzVerde ? 'on' : 'off'}"></div>
                    </td>
                    <td>
                        <button class="btn" onclick="desplegarDetalle('${valorRedondeado}','${item.nombre}','${item.unidadMedida}','${luzRoja}','${luzVerde}')">Ver detalle</button>
                    </td>
                    <td>
                        <button class="btn" onclick="irAEstadistica('${idBarco}','${item.idVariable}')">Ver Estadisticas</button>
                    </td>
                </tr>`;
            });
            cuerpo += "</tbody>";

            tabla.innerHTML += cuerpo;

            // Crear el dial gauge en el contenedor correspondiente
            setTimeout(function () {
                $(".dial-gauge").knob({
                    'min': 0,
                    'max': 100,
                    'readOnly': true,
                    'width': 100,
                    'height': 100,
                    'fgColor': '#3498db',
                    'inputColor': '#95a5a6',
                    'font': 'Lato, sans-serif',
                    'fontWeight': '300',
                    'bgColor': '#ecf0f1'
                });
            }, 0);
        })
        .catch(error => console.error('Error:', error));
}

function desplegarDetalle(valorRedondeado, nombreVariable, unidadMedida, luzRoja, luzVerde) {
    var modal = document.getElementById('modal');
    modal.style.display = 'block';
    var luzTexto = 'valor normal';
     // Convertir las cadenas a booleanos
     luzRoja = luzRoja === "true";
     luzVerde = luzVerde === "true";
 
     // Si luzRoja es true, verifica Luz Verde
     if (luzRoja) {
         luzTexto = 'valor por encima de lo permitido';
     }
     // Si luzVerde es true, verifica Luz Roja
     if (luzVerde) {
         luzTexto = 'valor por debajo de lo permitido';
     }
    // Puedes personalizar el contenido y los gráficos según tus datos
    var modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <span class="close" onclick="cerrarModal()">&times;</span>
        <h2 id="modalTitle">Detalles de ${nombreVariable}</h2>
        <p>Valor: ${valorRedondeado}</p>
        <p>Nombre de la Variable: ${nombreVariable}</p>
        <p>Unidad de Medida: ${unidadMedida}</p>
        <p>Alarma: ${luzTexto}</p>
        <canvas id="chartContainer" width="400" height="100"></canvas>
    `;

    // Obtener la referencia al elemento canvas
    var canvas = document.getElementById('chartContainer');

    // Configurar y mostrar un gráfico con Chart.js (aquí se usa un gráfico de barras como ejemplo)
    var ctx = canvas.getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [nombreVariable],
            datasets: [{
                label: 'Valor',
                data: [valorRedondeado],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function cerrarModal() {
    var modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Función para redirigir a la página de estadísticas
function irAEstadistica(idBarco, idVariable) {
    // Reemplaza 'estadisticas.html' con la URL de tu página de estadísticas
    window.location.href = '/estadisticas.html';
}