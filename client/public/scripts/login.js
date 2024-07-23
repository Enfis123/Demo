document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.login-form');
  const verificationForm = document.querySelector('.verification-form');
  const qrContainer = document.querySelector('.qr-container');
  const qrCodeImage = document.querySelector('#qr-code');
  const verificationCodeInput = document.querySelector('#verification-code');
  const usernameInput = document.querySelector('#username');
  const passwordInput = document.querySelector('#password');

  loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = usernameInput.value;
      const password = passwordInput.value;

      if (!username || !password) {
          alert('Por favor, ingresa ambos campos: nombre de usuario y contraseña.');
          return;
      }

      try {
          const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRF-Token': getCookie('XSRF-TOKEN')
              },
              body: JSON.stringify({ username, password })
          });

          const data = await response.json();

          if (data.success) {
              if (data.qrCodeUrl) {
                  // Muestra el código QR
                  loginForm.classList.add('hidden');
                  qrContainer.classList.remove('hidden');
                  qrCodeImage.src = data.qrCodeUrl;
                  // Escuchar evento para cambiar al formulario de verificación
                  qrCodeImage.addEventListener('load', () => {
                    setTimeout(() => {
                        qrContainer.classList.add('hidden');
                        verificationForm.classList.remove('hidden');
                    }, 20000); // Espera 5 segundos para que el usuario escanee el QR
                });
              } else {
                  // Muestra el formulario de verificación
                  qrContainer.classList.add('hidden');
                  verificationForm.classList.remove('hidden');
                  verificationForm.addEventListener('submit', async (e) => {
                      e.preventDefault();

                      const verificationCode = verificationCodeInput.value;

                      try {
                          const verifyResponse = await fetch('/api/verify', {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json',
                                  'X-CSRF-Token': getCookie('XSRF-TOKEN')
                              },
                              body: JSON.stringify({ username, code: verificationCode })
                          });

                          const verifyData = await verifyResponse.json();

                          if (verifyData.success) {
                               // Redirige al usuario a la página correspondiente según su rol
                                  switch (verifyData.role) {
                                    case 'admin':
                                        window.location.href = '/datos.html';
                                        break;
                                    case 'user':
                                        window.location.href = '/index.html';
                                        break;
                                    // Añadir más casos según los roles disponibles
                                    default:
                                      alert("Usuario Desconocido");
                                        break;
                                }
                          } else {
                              alert(verifyData.message);
                          }
                      } catch (error) {
                          console.error('Error al verificar el código:', error);
                      }
                  });
              }
          } else {
              alert(data.message);
          }
      } catch (error) {
          console.error('Error al iniciar sesión:', error);
      }
  });

  function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
  }
});
