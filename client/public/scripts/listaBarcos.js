// Barco.html
document.addEventListener("DOMContentLoaded", () => {
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

            // Muestra el contenedor de detalles con una animación
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
  // Agrega un evento de envío al formulario para realizar el filtrado
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    barcoContainer.style.animation = "fadeIn 0.5s forwards";
    detalleContainer.style.animation = "fadeOut 0.5s forwards";
    detalleContainer.style.display = "none";
    fetchAndDisplayBarcos();
  });
  // Llama a la función inicialmente para cargar todos los barcos
  fetchAndDisplayBarcos();
});
