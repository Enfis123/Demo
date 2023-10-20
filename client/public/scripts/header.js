  document.addEventListener("DOMContentLoaded", function () {
    const userName = document.getElementById("user-name");

    // Obtener el nombre de usuario de la cookie
    const username = getCookie("username");
    if (username) {
      userName.textContent = username;
    }
  });

  // Función para obtener el valor de una cookie por su nombre
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
