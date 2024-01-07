const chartContainer = document.getElementById('chart-container');
const chartWrapper = document.getElementById('chart-wrapper');
const dashboardContainer = document.getElementById('dashboard-container');
const dashboardArrow = document.getElementById('dashboard-arrow');

dashboardArrow.addEventListener('click', () => {
    const isOpen = dashboardContainer.style.width === '50%';

    if (isOpen) {
        dashboardContainer.style.width = '0';
        chartWrapper.style.width = '100%';
        // Se añade este evento para redimensionar el gráfico cuando cambie el tamaño de la ventana
        window.dispatchEvent(new Event('resize'));
    } else {
        chartContainer.style.marginRight = '30px'; // Puedes ajustar el margen según tus necesidades
        chartWrapper.style.width = 'calc(100% - 30px)'; // Ajusta el ancho del gráfico considerando el margen

        dashboardContainer.style.width = '50%';
        window.dispatchEvent(new Event('resize'));

    }


});
