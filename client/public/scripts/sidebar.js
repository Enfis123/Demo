// Obtenemos todos los elementos con la clase "menu-title"
const menuTitles = document.querySelectorAll('.menu-title');

// Asignamos un evento 'click' a cada título de menú
menuTitles.forEach(title => {
    title.addEventListener('click', () => {
        // Obtenemos el elemento de menú correspondiente
        const menu = title.parentElement;
        // Obtenemos la lista de elementos de menú asociada
        const menuContent = menu.querySelector('.menu-content');
        
        // Alternamos la clase 'active' en la lista de elementos de menú
        menuContent.classList.toggle('active');
    });
});

