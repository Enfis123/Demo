// Obtenemos todos los elementos con la clase "menu-item"
const menuItems = document.querySelectorAll(".menu-item");
const mainContent = document.querySelector(".main-content"); // Elemento de contenido principal
const crearBarcoForm = document.getElementById("crear-barco-form");
const crearUsuarioForm = document.getElementById("crear-usuario-form");
const usuarioForm = document.getElementById("usuario-form");
const barcoForm = document.getElementById("barco-form");
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
    } else if (selectedMenuItem.includes("Crear Barco")) {
      mainContent.innerHTML = ""; // Limpiamos el contenido principal
      mainContent.appendChild(crearBarcoForm); // Agregamos el formulario
      crearBarcoForm.style.display = "block";
      previewImage();

    } else if (selectedMenuItem.includes("Visualizar Barcos")) {

      mostrarBarcos();
    } else if (selectedMenuItem.includes("Crear Variable")) {
      // Cargar el contenido para "Crear Variable"
      mainContent.innerHTML = "<h3>Contenido de Crear Variable</h3>";
    } else if (selectedMenuItem.includes("Visualizar Variable")) {
      // Cargar el contenido para "Visualizar Variable"
      mainContent.innerHTML = "<h3>Contenido de Visualizar Variable</h3>";
    }
  });
});
// Agregar un evento submit al formulario de creación
barcoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener los valores del formulario
  const nombre = barcoForm.nombre.value;
  const anio = barcoForm.anio.value;
  const tipoMotor = barcoForm.tipo_motor.value;
  const horasTrabajoMotor = barcoForm.horas_trabajo_motor.value;
  const tipoControl = barcoForm.tipo_control.value;
  const imagen = barcoForm.imagen.files[0]; // Obtener el archivo de imagen

  // Realizar validaciones (puedes agregar más validaciones según tus requisitos)
  if (nombre.trim() === "" || anio.trim() === "" || tipoMotor.trim() === "" || tipoControl.trim() === "") {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }

  // Subir la imagen al servidor antes de enviar el formulario
  const imagenURL = await subirImagenAlServidor(imagen);

  // Crear un objeto FormData solo con datos (sin imagen)
  const formData ={
    nombre,
    anio,
    tipo_motor: tipoMotor,
    horas_trabajo_motor: horasTrabajoMotor,
    tipo_control:tipoControl,
    imagen: imagenURL
  }
  console.log(formData);
  console.log(formData instanceof FormData);

  try {
    // Enviar los datos del formulario al servidor utilizando fetch
    const response = await fetch("/api/barcos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData), // Convertir el objeto a JSON antes de enviarlo
    });

    if (response.ok) {
      // Barco creado con éxito, mostrar mensaje o redirigir si es necesario
      alert("Barco creado con éxito");
      // Puedes agregar un redireccionamiento a otra página aquí si es necesario.
    } else {
      alert("Error al crear el barco");
    }
  } catch (error) {
    console.error("Error al enviar datos del formulario al servidor:", error);
  }
});
// Función para subir la imagen al servidor y obtener la URL
async function subirImagenAlServidor(imagen) {
  const formData = new FormData();
  formData.append("imagen", imagen);

  try {
    const response = await fetch("/api/subir-imagen", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return data.url; // Suponiendo que el servidor devuelve la URL de la imagen
    } else {
      throw new Error("Error al subir la imagen al servidor");
    }
  } catch (error) {
    console.error("Error al subir la imagen al servidor:", error);
    throw error;
  }
}
function previewImage() {
  var input = document.getElementById('imagen');
  var preview = document.getElementById('imagen-preview-img');

  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
    };

    reader.readAsDataURL(input.files[0]);
  }

  // Oculta la imagen por defecto
  var defaultImage = document.getElementById('imagen-preview-default');
  if (defaultImage) {
    defaultImage.style.display = 'none';
  }
}

function mostrarBarcos() {
  // Realiza una solicitud fetch al servidor para obtener la lista de barcos
  fetch("/api/barcos")
    .then((response) => response.json())
    .then((data) => {
      // Verifica si se obtuvieron datos de barcos
      if (data && data.length > 0) {
        // Construye una tabla HTML con los datos de barcos
        let tableHtml = "<h3>Lista de Barcos</h3>";
        tableHtml += '<div class="barco-table-content">'; // Contenedor scrollable
        tableHtml += '<table class="barco-table">';

        // Encabezados de la tabla con la clase barco-table-header
        tableHtml +=
          '<tr class="barco-table-row barco-table-header"><th>Nombre</th><th>Año</th><th>Tipo de Motor</th><th>Horas de Trabajo del Motor</th><th>Tipo de Control</th><th>Imagen</th><th>Acciones</th></tr>';

        data.forEach((barco) => {
          // Filas de la tabla con la clase barco-table-row
          tableHtml += `<tr class="barco-table-row">
                        <td>${barco.nombre}</td>
                        <td>${barco.anio}</td>
                        <td>${barco.tipo_motor}</td>
                        <td>${barco.horas_trabajo_motor}</td>
                        <td>${barco.tipo_control}</td>
                        <td><img src="${barco.imagen}" alt="Imagen del Barco"></td>
                        <td>
                            <button class="editar-barco-button" data-id="${barco.id}">Editar</button>
                            <button class="eliminar-barco-button" data-id="${barco.id}">Eliminar</button>
                        </td>
                    </tr>`;
        });

        tableHtml += "</table>";
        tableHtml += "</div>"; // Cierra el contenedor scrollable
        mainContent.innerHTML = tableHtml;

        // Agrega manejo de eventos para los botones "Editar" y "Eliminar"
        const editarButtons = document.querySelectorAll(".editar-barco-button");
        const eliminarButtons = document.querySelectorAll(".eliminar-barco-button");

        editarButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            const barcoId = e.currentTarget.getAttribute("data-id");
            abrirEditarModalBarco(barcoId);
          });
        });

        eliminarButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            const barcoId = e.currentTarget.getAttribute("data-id");
            abrirEliminarModalBarco(barcoId);
          });
        });

      } else {
        mainContent.innerHTML = "<h3>No hay barcos para mostrar.</h3>";
      }
    })
    .catch((error) => {
      console.error("Error al obtener la lista de barcos:", error);
      mainContent.innerHTML = "<h3>Error al cargar la lista de barcos.</h3>";
    });
}

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
// Mostrar modal de edición al hacer clic en "Editar" y cargar los datos del barco
function abrirEditarModalBarco(barcoId) {
  const modal = document.getElementById("editarBarcoModal");
  const cerrarModal = document.getElementById("cerrarEditarBarcoModal");
  const guardarCambiosBtn = document.getElementById("guardarCambiosBarcoBtn");

  modal.style.display = "block";

  cerrarModal.onclick = function () {
    modal.style.display = "none";
  };

  // Obtener los datos del barco seleccionado mediante Fetch  
  fetch(`/api/barcos/${barcoId}`)
    .then((response) => response.json())
    .then((data) => {
      // Llena el formulario en el modal con los datos del barco
      const nombreInput = document.getElementById("edit-nombre");
      const anioInput = document.getElementById("edit-anio");
      const tipoMotorInput = document.getElementById("edit-tipo_motor");
      const horasTrabajoMotorInput = document.getElementById("edit-horas_trabajo_motor");
      const tipoControlInput = document.getElementById("edit-tipo_control");
      const imagenPreview = document.getElementById("imagen-preview-img");

      nombreInput.value = data.nombre;
      anioInput.value = data.anio;
      tipoMotorInput.value = data.tipo_motor;
      horasTrabajoMotorInput.value = data.horas_trabajo_motor;
      tipoControlInput.value = data.tipo_control;
      imagenPreview.src = data.imagen;
    });

  // Actualizar los datos del barco al hacer clic en "Guardar" mediante Fetch
  guardarCambiosBtn.onclick = function () {
    const editedBarcoData = {
      nombre: document.getElementById("edit-nombre").value,
      anio: document.getElementById("edit-anio").value,
      tipo_motor: document.getElementById("edit-tipo_motor").value,
      horas_trabajo_motor: document.getElementById("edit-horas_trabajo_motor").value,
      tipo_control: document.getElementById("edit-tipo_control").value,
      imagen: document.getElementById("imagen-preview-img").src,
    };

    // Realizar una solicitud PUT para actualizar los datos del barco
    fetch(`/api/barcos/${barcoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedBarcoData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error al actualizar el barco");
        }
      })
      .then((data) => {
        if (data.message === "Barco editado con éxito") {
          alert("Barco actualizado exitosamente");
          modal.style.display = "none"; // Cierra el modal
          // Puedes agregar más lógica de actualización en la interfaz de usuario si es necesario
        } else {
          alert("Error al actualizar el barco");
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  };
}

// Mostrar modal de eliminación al hacer clic en "Eliminar"
function abrirEliminarModalBarco(barcoId) {
  const modal = document.getElementById("eliminarBarcoModal");
  const cerrarModal = document.getElementById("cerrarEliminarBarcoModal");
  const confirmarEliminar = document.getElementById("confirmarEliminarBarco");

  // Agrega lógica para confirmar la eliminación del barco
  modal.style.display = "block";

  cerrarModal.onclick = function () {
    modal.style.display = "none";
  };

  confirmarEliminar.onclick = function () {
    // Realiza la acción de eliminación aquí
    eliminarBarco(barcoId);
    modal.style.display = "none";
  };
}
function eliminarBarco(barcoId) {
  // Realiza una solicitud DELETE para eliminar el barco por su ID
  fetch(`/api/barcos/${barcoId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error al eliminar el barco");
      }
    })
    .then((data) => {
      if (data.message === "Barco eliminado correctamente") {
        // Puedes agregar lógica adicional, como actualizar la interfaz de usuario
        alert("Barco eliminado exitosamente");
        mostrarBarcos(); // Actualiza la lista de barcos después de eliminar uno
      } else {
        alert("Error al eliminar el barco: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error al eliminar el barco:", error);
      alert("Error al eliminar el barco");
    });
}
