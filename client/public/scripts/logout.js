// Función para enviar una solicitud de logout al servidor
function logout() {
  // Realizar una solicitud fetch al servidor para eliminar la cookie
  fetch('/api/logout', {
    method: 'POST',
    credentials: 'same-origin', // Incluye las cookies en la solicitud
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Redirige al usuario a la página de inicio después del logout exitoso
      window.location.href = "/";
    } else {
      console.error("Error al cerrar sesión:", data.message);
    }
  })
  .catch(error => console.error("Error al realizar la solicitud de logout:", error));
}

// Escucha el clic en el enlace "Cerrar Sesión"
document.getElementById("logout").addEventListener("click", function (event) {
  event.preventDefault(); // Evita que el enlace siga el enlace predeterminado
  logout(); // Llama a la función de logout
});
