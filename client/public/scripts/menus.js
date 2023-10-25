// Obtenemos todos los elementos con la clase "menu-item"
const menuItems = document.querySelectorAll(".menu-item");
const mainContent = document.querySelector(".main-content"); // Elemento de contenido principal
const crearUsuarioForm = document.getElementById("crear-usuario-form");
const usuarioForm = document.getElementById("usuario-form");

// Asignamos un evento 'click' a cada elemento del menú
menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Obtenemos el texto del elemento del menú seleccionado
    const selectedMenuItem = item.textContent;

    // Cargamos el contenido correspondiente en el contenido principal según la selección
    if (selectedMenuItem.includes("Crear Usuario")) {
      // Mostrar el formulario para "Crear Usuario" y ocultar otros contenidos
      mainContent.innerHTML = ""; // Limpiamos el contenido principal
      mainContent.appendChild(crearUsuarioForm); // Agregamos el formulario
      crearUsuarioForm.style.display = "block"; // Mostramos el formulario
    } else if (selectedMenuItem.includes("Visualizar Usuarios")) {
      // Cargar el contenido para "Visualizar Usuarios"
      mostrarUsuarios();
    } else if (selectedMenuItem.includes("Crear Variable")) {
      // Cargar el contenido para "Crear Variable"
      mainContent.innerHTML = "<h3>Contenido de Crear Variable</h3>";
    } else if (selectedMenuItem.includes("Visualizar Variable")) {
      // Cargar el contenido para "Visualizar Variable"
      mainContent.innerHTML = "<h3>Contenido de Visualizar Variable</h3>";
    }
  });
});
function mostrarUsuarios() {
  // Realiza una solicitud fetch al servidor para obtener la lista de usuarios
  fetch("/api/users")
    .then((response) => response.json())
    .then((data) => {
      // Verifica si se obtuvieron datos de usuarios
      if (data && data.length > 0) {
        // Construye una tabla HTML con los datos de usuarios
        let tableHtml = "<h3>Lista de Usuarios</h3>";
        tableHtml += '<div class="user-table-content">'; // Contenedor scrollable
        tableHtml += '<table class="user-table">';

        // Encabezados de la tabla con la clase user-table-header
        tableHtml +=
          '<tr class="user-table-row user-table-header"><th>Username</th><th>Email</th><th>Rol de Usuario</th><th>Estado de la Cuenta</th><th>Acciones</th></tr>';

        data.forEach((user) => {
          // Filas de la tabla con la clase user-table-row
          tableHtml += `<tr class="user-table-row">
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.user_role}</td>
                        <td>${user.account_status}</td>
                        <td>
                            <button class="editar-button" data-id="${user.id}">Editar</button>
                            <button class="eliminar-button" data-id="${user.id}">Eliminar</button>
                        </td>
                    </tr>`;
        });

        tableHtml += "</table>";
        tableHtml += "</div>"; // Cierra el contenedor scrollable
        mainContent.innerHTML = tableHtml;

        // Agrega manejo de eventos para los botones "Editar" y "Eliminar"
        const editarButtons = document.querySelectorAll(".editar-button");
        const eliminarButtons = document.querySelectorAll(".eliminar-button");

        editarButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            const userId = e.currentTarget.getAttribute("data-id");
            abrirEditarModal(userId);
          });
        });

        eliminarButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            const userId = e.currentTarget.getAttribute("data-id");
            abrirEliminarModal(userId);
          });
        });
      } else {
        mainContent.innerHTML = "<h3>No hay usuarios para mostrar.</h3>";
      }
    })
    .catch((error) => {
      console.error("Error al obtener la lista de usuarios:", error);
      mainContent.innerHTML = "<h3>Error al cargar la lista de usuarios.</h3>";
    });
}

usuarioForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener los valores del formulario
  const username = usuarioForm.username.value;
  const password = usuarioForm.password.value;
  const email = usuarioForm.email.value;
  const userRole = usuarioForm.user_role.value;
  const accountStatus = usuarioForm.account_status.value;
  //Realizar validaciones
  if (username.trim() === "" || password.trim() === "" || email.trim() === "") {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }

  // Validación de formato de correo electrónico
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!email.match(emailPattern)) {
    alert("Por favor, ingrese un correo electrónico válido.");
    return;
  }

  // Validación de seguridad de la contraseña
  if (password.length < 8) {
    alert("La contraseña debe tener al menos 8 caracteres.");
    return;
  }

  // Al menos una letra mayúscula, una letra minúscula y un número
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  if (!password.match(passwordPattern)) {
    alert(
      "La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número."
    );
    return;
  }
  // Crear un objeto con los datos del formulario
  const formData = {
    username,
    password,
    email,
    user_role: userRole, // Asegúrate de que el nombre coincida con el campo en la base de datos
    account_status: accountStatus, // Asegúrate de que el nombre coincida con el campo en la base de datos
  };

  try {
    // Enviar los datos del formulario al servidor utilizando fetch
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      // Usuario creado con éxito, mostrar ventana emergente
      alert("Usuario creado con éxito");
      // Puedes agregar un redireccionamiento a otra página aquí si es necesario.
    } else {
      alert("Error al crear el usuario, ya existe el usuario");
    }
  } catch (error) {
    console.error("Error al enviar datos del formulario al servidor:", error);
  }
});
// Mostrar modal de edición al hacer clic en "Editar" y cargar los datos del usuario
function abrirEditarModal(userId) {
  const modal = document.getElementById("editarModal");
  const cerrarModal = document.getElementById("cerrarEditarModal");
  const guardarCambiosBtn = document.getElementById("guardarCambiosBtn");

  modal.style.display = "block";

  cerrarModal.onclick = function () {
    modal.style.display = "none";
  };

  // Obtener los datos del usuario seleccionado mediante Fetch
  fetch(`/api/users/${userId}`)
    .then((response) => response.json())
    .then((data) => {
      // Llena el formulario en el modal con los datos del usuario
      const usernameInput = document.getElementById("edit-username");
      const passwordInput = document.getElementById("edit-password");
      const emailInput = document.getElementById("edit-email");
      const userRoleSelect = document.getElementById("edit-user_role");
      const accountStatusSelect = document.getElementById(
        "edit-account_status"
      );

      usernameInput.value = data.username;
      passwordInput.value = data.password;
      emailInput.value = data.email;
      userRoleSelect.value = data.user_role;
      accountStatusSelect.value = data.account_status;
    });

  // Actualizar los datos del usuario al hacer clic en "Guardar" mediante Fetch
  guardarCambiosBtn.onclick = function () {
    const editedUserData = {
      username: document.getElementById("edit-username").value,
      password: document.getElementById("edit-password").value,
      email: document.getElementById("edit-email").value,
      user_role: document.getElementById("edit-user_role").value,
      account_status: document.getElementById("edit-account_status").value,
    };

    // Realizar una solicitud PUT para actualizar los datos del usuario
    fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedUserData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error al actualizar el usuario");
        }
      })
      .then((data) => {
        if (data.message === "Usuario editado con éxito") {
          alert("Usuario actualizado exitosamente");
          modal.style.display = "none"; // Cierra el modal
          // Puedes agregar más lógica de actualización en la interfaz de usuario si es necesario
        } else {
          alert("Error al actualizar el usuario");
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  };
}

// Mostrar modal de eliminación al hacer clic en "Eliminar"
function abrirEliminarModal(userId) {
  const modal = document.getElementById("eliminarModal");
  const cerrarModal = document.getElementById("cerrarEliminarModal");
  const confirmarEliminar = document.getElementById("confirmarEliminar");

  // Agrega lógica para confirmar la eliminación del usuario
  modal.style.display = "block";

  cerrarModal.onclick = function () {
    modal.style.display = "none";
  };

  confirmarEliminar.onclick = function () {
    // Realiza la acción de eliminación aquí
    eliminarUsuario(userId);
    modal.style.display = "none";
    mostrarUsuarios();
  };
}

function eliminarUsuario(userId) {
  // Realiza una solicitud DELETE para eliminar el usuario por su ID
  fetch(`/api/users/${userId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Usuario eliminado con éxito") {
        // Puedes agregar lógica adicional, como actualizar la interfaz de usuario
        alert("Usuario eliminado exitosamente");
      } else {
        alert("Error al eliminar el usuario");
      }
    })
    .catch((error) => {
      console.error("Error al eliminar el usuario: " + error);
      alert("Error al eliminar el usuario");
    });
}

// Llamar a estas funciones cuando se haga clic en los botones "Editar" y "Eliminar"
