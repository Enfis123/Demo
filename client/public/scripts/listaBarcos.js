// Barco.html
document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const diales = {};
  const termometros = {};
  const barcoContainer = document.querySelector(".barco-list");
  const detalleContainer = document.querySelector(".detalle-container");
  // Obtener los campos de filtro del formulario
  const filterForm = document.getElementById("filter-form");
  const nombreFilter = document.getElementById("nombre-filter");
  const anioFilter = document.getElementById("anio-filter");
  const tipoMotorFilter = document.getElementById("tipo-motor-filter");
  const tipoControlFilter = document.getElementById("tipo-control-filter");
  function fetchAndDisplayBarcos() {
    // Realiza una solicitud a la API para obtener los datos de los barcos
    fetch("/api/barcos")
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter((barco) => {
          // Aplica los filtros según los valores ingresados en los campos
          const nombre = nombreFilter.value.trim().toLowerCase();
          const anio = anioFilter.value.trim();
          const tipoMotor = tipoMotorFilter.value.trim().toLowerCase();
          const tipoControl = tipoControlFilter.value.trim().toLowerCase();

          return (
            barco.nombre.toLowerCase().includes(nombre) &&
            barco.anio.toString().includes(anio) &&
            barco.tipo_motor.toLowerCase().includes(tipoMotor) &&
            barco.tipo_control.toLowerCase().includes(tipoControl)
          );
        });

        // Limpia el contenedor antes de agregar las tarjetas
        barcoContainer.innerHTML = "";
        filteredData.forEach((barco) => {
          // Crea una tarjeta (card) para cada barco
          const barcoCard = document.createElement("div");
          barcoCard.className = "barco-card";

          // Agrega la imagen del barco
          const imagen = document.createElement("img");
          imagen.src = barco.imagen;
          imagen.alt = barco.nombre;
          barcoCard.appendChild(imagen);

          // Agrega el nombre del barco
          const nombre = document.createElement("h3");
          nombre.textContent = barco.nombre;
          barcoCard.appendChild(nombre);

          // Agrega el año del barco
          const anio = document.createElement("p");
          anio.textContent = `Año: ${barco.anio}`;
          barcoCard.appendChild(anio);

          // Agrega el tipo de motor del barco
          const tipoMotor = document.createElement("p");
          tipoMotor.textContent = `Tipo de Motor: ${barco.tipo_motor}`;
          barcoCard.appendChild(tipoMotor);

          // Agrega el tipo de control del barco
          const tipoControl = document.createElement("p");
          tipoControl.textContent = `Tipo de Control: ${barco.tipo_control}`;
          barcoCard.appendChild(tipoControl);
          // Agrega el botón "Detalles"
          const detallesButton = document.createElement("button");
          detallesButton.textContent = "Detalles";

          detallesButton.className = "button-86"; // Agrega la clase
          detallesButton.addEventListener("click", () => {
            // Oculta el contenedor de la lista de barcos con una animación
            barcoContainer.style.animation = "fadeOut 0.5s forwards";
            fetchAndDisplayVariables(barco.id, barco.nombre);
            detalleContainer.style.animation = "fadeIn 0.5s forwards";
            detalleContainer.style.display = "block";
          });
          barcoCard.appendChild(detallesButton);
          // Agrega la tarjeta al contenedor
          barcoContainer.appendChild(barcoCard);
        });
      })
      .catch((error) => {
        console.error("Error al cargar los datos de los barcos:", error);
      });
  }
  function fetchAndDisplayVariables(barcoId, barcoNombre) {


    // Realiza la solicitud fetch para obtener todas las variables de un barco por su ID
    fetch(`/api/barcos/${barcoId}/variables`)
      .then((response) => response.json())
      .then((variables) => {
        const detallesContainer = document.querySelector(".detalle-container");
        const variablesGrid = document.createElement("div");
        variablesGrid.className = "grid-container";

        if (variables.length > 0) {
          variables.forEach((variable) => {
            const gridItem = document.createElement("div");
            const gridHeader = document.createElement("h2");
            const variableId = variable.idVariable;
            gridHeader.textContent = `${variable.nombre} - ${variable.unidadMedida}`;
            gridHeader.className = "grid-header";
            gridItem.className = "grid-item";
            gridItem.appendChild(gridHeader);


            // Crear el dial para la variable actual
            const dialContainer = document.createElement("div");
            dialContainer.className = "dial-container";
            const dial = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            dial.setAttribute("viewBox", "0 0 100 100");
            dial.className = "dial";
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", "50");
            circle.setAttribute("cy", "50");
            circle.setAttribute("r", "40");
            circle.setAttribute("fill", "#f0f0f0");
            circle.setAttribute("stroke", "#333");
            circle.setAttribute("stroke-width", "2");
            dial.appendChild(circle);

            const numItems = 10; // Número de elementos en el dial
            const rangoMinRedondeado = Math.round(variable.rangoMin);
            const rangoMaxRedondeado = Math.round(variable.rangoMax);

            // Calcula el paso entre cada elemento en el dial
            const paso = (rangoMaxRedondeado - rangoMinRedondeado) / Math.min(numItems, rangoMaxRedondeado - rangoMinRedondeado);

            for (let i = rangoMinRedondeado; i <= rangoMaxRedondeado; i += paso) {
              // Calcula la posición angular para el número
              const angle = ((i - rangoMinRedondeado) / (rangoMaxRedondeado - rangoMinRedondeado)) * 360 - 90;

              // Convierte el ángulo a radianes
              const radianes = (angle * Math.PI) / 180;

              // Calcula las coordenadas en el círculo
              const radio = 30; // Radio del círculo
              const x = 50 + radio * Math.cos(radianes);
              const y = 50 + radio * Math.sin(radianes);
              // Crea el elemento de texto y ajusta su posición
              const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
              text.setAttribute("x", x);
              text.setAttribute("y", y);
              text.setAttribute("text-anchor", "middle");
              text.setAttribute("dominant-baseline", "middle");
              text.setAttribute("font-size", "8px"); // Ajusta el tamaño de la fuente según tus preferencias
              text.textContent = i.toFixed(0); // Utiliza el valor redondeado como cadena

              // Añade el número al dial
              dial.appendChild(text);
            }

            const pointer = document.createElement("div");
            pointer.className = "pointer";
            const dataDisplay = document.createElement("div");
            dataDisplay.className = "data-display";
            dialContainer.appendChild(dial);
            dialContainer.appendChild(pointer);
            dialContainer.appendChild(dataDisplay);
            gridItem.appendChild(dialContainer);


            // Crear el contenedor principal del termómetro
            const termometroContainer = document.createElement("div");
            termometroContainer.className = "termometro-container";

            // Crear el termómetro (svg)
            const termometro = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            termometro.setAttribute("viewBox", "0 0 100 200"); // Ajusta el tamaño según tus necesidades
            termometro.className = "termometro";

            // Crear el cuerpo del termómetro (rectángulo principal)
            const rectangulo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rectangulo.setAttribute("x", "45");
            rectangulo.setAttribute("y", "10");
            rectangulo.setAttribute("width", "10");
            rectangulo.setAttribute("height", "180");
            rectangulo.setAttribute("fill", "#46BCB7");
            rectangulo.setAttribute("stroke", "#333");
            rectangulo.setAttribute("stroke-width", "2");
            termometro.appendChild(rectangulo);

            // Crear la parte superior del termómetro (triángulo)
            const triangulo = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            triangulo.setAttribute("points", "45,10 50,0 55,10");
            triangulo.setAttribute("fill", "#f0f0f0");
            triangulo.setAttribute("stroke", "#333");
            triangulo.setAttribute("stroke-width", "2");
            termometro.appendChild(triangulo);

            // Crear el indicador de temperatura (rectángulo móvil)
            const indicador = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            indicador.setAttribute("x", "45");
            indicador.setAttribute("y", "10");
            indicador.setAttribute("width", "10");
            indicador.setAttribute("height", "90"); // Ajusta la altura según tus necesidades
            indicador.setAttribute("fill", "#f0f0f0"); // Puedes ajustar el color según la temperatura
            termometro.appendChild(indicador);

            // Número de elementos en el termómetro
            const numItemsTermometro = 10;

            // Rango mínimo y máximo del termómetro
            const rangoMinTermometro = Math.round(variable.rangoMin);
            const rangoMaxTermometro = Math.round(variable.rangoMax);

            // Calcula el paso entre cada elemento en el termómetro
            // Calcula el paso entre cada elemento en el termómetro
            const pasoTermometro = (rangoMaxTermometro - rangoMinTermometro) / numItemsTermometro;

            // Verifica que el pasoTermometro no sea cero para evitar un bucle infinito
            if (pasoTermometro !== 0) {
              for (let i = rangoMinTermometro; i <= rangoMaxTermometro + pasoTermometro / 2; i += pasoTermometro) {
                // Calcula la posición vertical para el número
                const posY = 190 - ((i - rangoMinTermometro) / (rangoMaxTermometro - rangoMinTermometro)) * 180;

                // Crea el elemento de texto y ajusta su posición
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", "70"); // Ajusta la posición horizontal según tus necesidades
                text.setAttribute("y", posY);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("font-size", "8px"); // Ajusta el tamaño de la fuente según tus preferencias
                const roundedValue = typeof i === 'number' ? i.toFixed(0) : i;

                text.textContent = roundedValue; // Utiliza el valor redondeado como cadena

                // Añade el número al termómetro
                termometro.appendChild(text);
              }
            }

              termometroContainer.appendChild(termometro);
              gridItem.appendChild(termometroContainer);

              // Crear el botón
              const botonIrOtraPagina = document.createElement("button");
              botonIrOtraPagina.className = "button-86"; // Agrega la clase
              botonIrOtraPagina.textContent = "Ir Estadisticas";

              // Supongamos que tienes la temperatura actual almacenada en una variable llamada temperaturaActual
              //T

              // Agregar un evento de clic al botón
              botonIrOtraPagina.addEventListener("click", function () {
                irAOtraPagina(variableId);
              });

              // Añadir el botón al contenedor o al elemento que prefieras
              gridItem.appendChild(botonIrOtraPagina);
              socket.emit('subscribeToDatosTemporales', variableId);

              // Agregar el gridItem al contenedor principal
              variablesGrid.appendChild(gridItem);

              // Guardar el dial en un objeto para su posterior actualización
              diales[variableId] = { dial, pointer, dataDisplay, rangoMinRedondeado, rangoMaxRedondeado };
              termometros[variableId] = { termometro, indicador,rangoMinRedondeado,rangoMaxRedondeado };


            });

          socket.on('nuevoRegistro', (nuevoRegistro) => {
            try {
              const variableId = nuevoRegistro.id_variable;
              if (diales[variableId]) {
                const nuevoValorNumerico = parseInt(nuevoRegistro.valor);

                const valorNormalizado = Math.min(Math.max(nuevoValorNumerico, diales[variableId].rangoMinRedondeado), diales[variableId].rangoMaxRedondeado);

                // Calcular el ángulo correspondiente al nuevo valor en el rango de la variable
                const angulo = ((valorNormalizado - diales[variableId].rangoMinRedondeado) / (diales[variableId].rangoMaxRedondeado - diales[variableId].rangoMinRedondeado)) * 360;

                // Actualizar la posición del dial
                diales[variableId].pointer.style.transform = `translate(-50%, -100%) rotate(${angulo}deg)`;
                diales[variableId].dataDisplay.textContent = valorNormalizado;

                console.log(`Dial actualizado con éxito para la variable ${variableId}. Nuevo valor: ${valorNormalizado}`);
              }
              // Actualizar el termómetro
              if (termometros[variableId]) {
                const nuevoValorNumerico = parseInt(nuevoRegistro.valor);

                // Ajustar el nuevo valor numérico al rango del termómetro (por ejemplo, de 0 a 100)
                const valorNormalizado = Math.min(Math.max(nuevoValorNumerico, termometros[variableId].rangoMinRedondeado), termometros[variableId].rangoMaxRedondeado);

                // Calcular la altura correspondiente al nuevo valor en el rango del termómetro (por ejemplo, de 0 a 180 unidades)
                const altura = 180 - (valorNormalizado / 100) * 180; // Restar la altura al valor máximo

                // Actualizar la posición del indicador del termómetro
                termometros[variableId].indicador.setAttribute("height", altura);

                // Actualizar el texto de visualización de la temperatura

                console.log(`Termómetro actualizado con éxito para la variable ${variableId}. Nuevo valor: ${valorNormalizado}`);
              }
            } catch (error) {
              console.error('Error en el manejo de nuevoRegistro:', error);
            }
          });

        } else {
          const gridItem = document.createElement("div");
          gridItem.className = "grid-item";

          // Si no hay variables, mostrar un botón para crear variable
          const createVariableButton = document.createElement("button");
          createVariableButton.className = "button-86"
          createVariableButton.textContent = "Crear Variable";
          createVariableButton.addEventListener("click", () => {
            // Redirige a otra página para crear una nueva variable
            window.location.href = "/control.html"; // Reemplaza con la ruta correcta
          });
          gridItem.appendChild(createVariableButton);
          variablesGrid.appendChild(gridItem);

        }

        // Limpia el contenedor antes de agregar las variables
        detallesContainer.innerHTML = "";
        const volverButton = document.createElement("button");
        volverButton.id = "volver-button";
        volverButton.textContent = "Volver";
        volverButton.addEventListener("click", () => {
          // Oculta el contenedor de detalles con una animación
          detallesContainer.style.animation = "fadeOut 0.5s forwards";
          detallesContainer.style.display = "none";

          // Muestra el contenedor de la lista de barcos con una animación
          barcoContainer.style.animation = "fadeIn 0.5s forwards";
        });
        // Agrega el botón "Volver" al contenedor de detalles
        detallesContainer.appendChild(volverButton);
        // Crea el título del barco
        const tituloBarco = document.createElement("h2");
        tituloBarco.textContent = `Detalles de ${barcoNombre}`;
        detallesContainer.appendChild(tituloBarco);

        // Agrega el contenedor de variables al contenedor de detalles
        detallesContainer.appendChild(variablesGrid);

        // Muestra el contenedor de detalles con una animación
        detallesContainer.style.animation = "fadeIn 0.5s forwards";
        detallesContainer.style.display = "block";
        // Manejar el evento de nuevo registro recibido a través de Socket.IO
        // ...


      })
      .catch((error) => {
        console.error('Error al realizar la solicitud fetch:', error);
      });
  }
  // Supongamos que tienes la siguiente función para cambiar a otra página
  function irAOtraPagina(parametro) {
    // Puedes utilizar window.location.href para cambiar a otra página
    // y pasar el parámetro como parte de la URL, por ejemplo.
    window.location.href = `/estadisticas.html?idVariable=${parametro}`;
  }

  // Agrega un evento de envío al formulario para realizar el filtrado
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    detalleContainer.style.animation = "fadeOut 0.5s forwards";
    detalleContainer.style.display = "none";
    barcoContainer.style.animation = "fadeIn 0.5s forwards";
    fetchAndDisplayBarcos();
  });
  // Llama a la función inicialmente para cargar todos los barcos
  fetchAndDisplayBarcos();
});
