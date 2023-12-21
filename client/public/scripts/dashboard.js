const chartContainer = document.getElementById('chart-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  const dashboardArrow = document.getElementById('dashboard-arrow');

  dashboardArrow.addEventListener('click', () => {
      const isOpen = dashboardContainer.style.width === '250px' || dashboardContainer.style.width === '250';

      if (isOpen) {
          chartContainer.style.marginRight = '0';
          dashboardContainer.style.width = '0';
      } else {
          chartContainer.style.marginRight = '30px';
          dashboardContainer.style.width = '250px';
      }
  });