const loginContainer = document.querySelector('.login-container');

document.body.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    // Define los colores de inicio y fin para el degradado
    const color1 = [26, 26, 26]; // Color inicial (gris oscuro)
    const color2 = [51, 51, 51]; // Color final (gris claro)

    // Calcula el color interpolado entre color1 y color2
    const red = Math.round(color1[0] + x * (color2[0] - color1[0]));
    const green = Math.round(color1[1] + y * (color2[1] - color1[1]));
    const blue = Math.round(color1[2] + x * (color2[2] - color1[2]));

    // Establece el color de fondo en el contenedor de inicio de sesión
    loginContainer.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
});

