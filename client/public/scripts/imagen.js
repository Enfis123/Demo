document.addEventListener('DOMContentLoaded', function() {
    cargarImagenPortada();
});
function subirImagenAlServidor(input) {
    var archivo = input.files[0];

    if (archivo) {
        // Validación del tipo de archivo
        var validExtensions = ['image/jpeg', 'image/png'];
        if (!validExtensions.includes(archivo.type)) {
            alert('Solo se permiten archivos JPEG o PNG');
            return;
        }

        // Validación del tamaño del archivo (por ejemplo, máximo 2 MB)
        var maxSize = 2 * 1024 * 1024;
        if (archivo.size > maxSize) {
            alert('El tamaño máximo permitido es de 2 MB');
            return;
        }

        var formData = new FormData();
        formData.append('portada', archivo);

        fetch('/api/subir-imagen-portada', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            // Aquí puedes manejar la respuesta del servidor si es necesario
            console.log('Respuesta del servidor:', data);
            // Luego de subir la imagen, puedes cargarla usando la nueva ruta GET
            cargarImagenPortada();
        })
        .catch(error => {
            console.error('Error al subir la imagen:', error);
        });
    } else {
        alert('Por favor, seleccione una imagen para subir.');
    }
}

function cargarImagenPortada() {
    fetch('/api/obtener-imagen-portada')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al obtener la imagen de portada: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.url) {
                // Si hay una URL de imagen, la asignamos a la vista previa
                document.getElementById('imagen-preview').src = data.url;
                document.getElementById('imagen-preview').style.display = 'block';
                document.getElementById('label-text').style.display = 'none';
                document.getElementById('imagen-container').style.border = 'none';
            } else {
                console.log('No se encontró ninguna imagen de portada.');
            }
        })
        .catch(error => {
            console.error(error);
        });
}
