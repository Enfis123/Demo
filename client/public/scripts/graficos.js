document.addEventListener("DOMContentLoaded", () => {
    const chart1 = new Chart(document.getElementById("chart1").getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Data 1", "Data 2", "Data 3", "Data 4", "Data 5"],
        datasets: [
          {
            label: "Chart 1",
            data: [0, 0, 0, 0, 0], // Datos iniciales, todos en cero
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  
    const chart2 = new Chart(document.getElementById("chart2").getContext("2d"), {
      type: "line",
      data: {
        labels: ["Time 1", "Time 2", "Time 3", "Time 4", "Time 5"],
        datasets: [
          {
            label: "Chart 2",
            data: [0, 0, 0, 0, 0], // Datos iniciales, todos en cero
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
    });
  
    const chart3 = new Chart(document.getElementById("chart3").getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Data A", "Data B", "Data C"],
        datasets: [
          {
            label: "Chart 3",
            data: [0, 0, 0], // Datos iniciales, todos en cero
            backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 99, 132, 0.2)", "rgba(255, 205, 86, 0.2)"],
            borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)", "rgba(255, 205, 86, 1)"],
            borderWidth: 1,
          },
        ],
      },
    });
  
    // Función para actualizar los datos de los gráficos con valores aleatorios
    function updateCharts() {
      // Generar datos aleatorios
      const randomData1 = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
      const randomData2 = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
      const randomData3 = Array.from({ length: 3 }, () => Math.floor(Math.random() * 100));
  
      chart1.data.datasets[0].data = randomData1;
      chart1.update();
      chart2.data.datasets[0].data = randomData2;
      chart2.update();
      chart3.data.datasets[0].data = randomData3;
      chart3.update();
    }
  
    // Llama a la función para actualizar los gráficos cada segundo
    setInterval(updateCharts, 1000);
  });
  