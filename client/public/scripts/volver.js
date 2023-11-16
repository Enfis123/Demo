document.addEventListener("DOMContentLoaded", () => {
    const barcoContainer = document.querySelector(".barco-list");
    const detalleContainer = document.querySelector(".detalle-container");
  
    // Agrega un oyente de eventos al botón de Volver
    const volverButton = document.getElementById("volver-button");
    volverButton.addEventListener("click", () => {
      // Oculta el contenedor de detalles con una animación
      detalleContainer.style.animation = "fadeOut 0.5s forwards";
  
      // Muestra el contenedor de la lista de barcos con una animación
      barcoContainer.style.animation = "fadeIn 0.5s forwards";
    });
  });
  