// Espera a que el documento esté listo
$(document).ready(function () {
    // Configuración del dial gauge
    var knobOptions = {
        'min': 0,
        'max': 100,
        'readOnly': true,
        'width': 100,
        'height': 100,
        'fgColor': '#3498db', // Color del dial
        'inputColor': '#95a5a6', // Color del texto del dial
        'font': 'Lato, sans-serif', // Fuente del texto del dial
        'fontWeight': '300', // Grosor de la fuente del texto del dial
        'bgColor': '#ecf0f1' // Color de fondo del dial
    };

    // Crea el dial gauge y asigna las opciones
    $(".dial-gauge").knob(knobOptions);

    // Establece el valor inicial del dial gauge
    $(".dial-gauge").val(50).trigger('change');
});
