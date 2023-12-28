const chartContainer = document.getElementById('chart-container');
const dashboardContainer = document.getElementById('dashboard-container');
const dashboardArrow = document.getElementById('dashboard-arrow');

dashboardArrow.addEventListener('click', () => {
    const isOpen = dashboardContainer.style.width === '50%' || dashboardContainer.style.width === '50%';

    if (isOpen) {
        chartContainer.style.marginRight = '0';
        dashboardContainer.style.width = '0';
    } else {
        chartContainer.style.marginRight = '30px';  // Puedes ajustar el margen según tus necesidades
        dashboardContainer.style.width = '50%';
    }
});