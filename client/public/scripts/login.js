document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
  
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const username = document.querySelector('#username').value;
      const password = document.querySelector('#password').value;
  
      // Realiza una solicitud POST a la API de inicio de sesión
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.status === 200) {
        // Autenticación exitosa, redirige al usuario a otra página (por ejemplo, "dashboard.html")
        window.location.href = '/datos.html';
      } else if (response.status === 403){
        alert('No tienes permisos de administrador');

      }else{
        // Muestra un mensaje de error en caso de credenciales incorrectas
        alert('Credenciales incorrectas. Inténtalo de nuevo.');
      }
    });
  });
  