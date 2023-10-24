// Obtenemos todos los elementos con la clase "menu-item"
const menuItems = document.querySelectorAll('.menu-item');
const mainContent = document.querySelector('.main-content'); // Elemento de contenido principal

// Asignamos un evento 'click' a cada elemento del menú
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        // Obtenemos el texto del elemento del menú seleccionado
        const selectedMenuItem = item.textContent;

        // Cargamos el contenido correspondiente en el contenido principal según la selección
        if (selectedMenuItem.includes("Crear Usuario")) {
            // Cargar el contenido para "Crear Usuario"
            mainContent.innerHTML = '<h3>Contenido de Crear Usuario</h3>';
        } else if (selectedMenuItem.includes("Visualizar Usuarios")) {
            // Cargar el contenido para "Visualizar Usuarios"
            mainContent.innerHTML = '<h3>Contenido de Visualizar Usuarios</h3>';
        } else if (selectedMenuItem.includes("Crear Variable")) {
            // Cargar el contenido para "Crear Variable"
            mainContent.innerHTML = '<h3>Contenido de Crear Variable</h3>';
        } else if (selectedMenuItem.includes("Visualizar Variable")) {
            // Cargar el contenido para "Visualizar Variable"
            mainContent.innerHTML = '<h3>Contenido de Visualizar Variable</h3>';
        }
    });
});
