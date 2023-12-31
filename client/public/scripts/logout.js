// Función para eliminar la cookie de usuario
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

// Escucha el clic en el enlace "Cerrar Sesión"
document.getElementById("logout").addEventListener("click", function (event) {
  event.preventDefault(); // Evita que el enlace siga el enlace predeterminado

  deleteCookie("username");

  // Redirige al usuario a la página de inicio
  window.location.href = "/";
});
