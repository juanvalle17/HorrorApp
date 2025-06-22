// Elementos del DOM
const loginContainer = document.getElementById('loginContainer');
const profileContainer = document.getElementById('profileContainer');
const welcomeContainer = document.getElementById('welcomeContainer');

const emailField = document.getElementById('emailField');
const submitBtn = document.getElementById('submitBtn');
const toggleLink = document.getElementById('toggleMode');
const formTitle = document.querySelector('#loginContainer h2');

const avatarInput = document.getElementById('avatarInput');
const uploadBtn = document.getElementById('uploadBtn');
const avatarPreview = document.getElementById('avatarPreview');
const avatarImg = document.getElementById('avatarImg');
const avatarPlaceholder = document.querySelector('.avatar-placeholder');

const descriptionTextarea = document.getElementById('description');
const charCount = document.getElementById('charCount');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const skipProfile = document.getElementById('skipProfile');

const finalAvatarImg = document.getElementById('finalAvatarImg');
const welcomeUsername = document.getElementById('welcomeUsername');
const welcomeDescription = document.getElementById('welcomeDescription');
const continueBtn = document.getElementById('continueBtn');

// Variables de estado
let isRegistering = false;
let currentUser = null;
let selectedAvatarFile = null;

// Toggle entre login y registro
toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isRegistering = !isRegistering;

  if (isRegistering) {
    emailField.classList.remove('hidden');
    submitBtn.textContent = 'Create Account';
    toggleLink.textContent = 'I have an account';
    formTitle.textContent = 'Create Account';
  } else {
    emailField.classList.add('hidden');
    submitBtn.textContent = 'Next';
    toggleLink.textContent = 'Join HorrorApp';
    formTitle.textContent = 'Log In';
  }
});

// Manejo del login/registro
submitBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const email = document.getElementById('email').value.trim();

  // Validación básica
  if (!username || !password) {
    alert('Por favor, completa todos los campos requeridos');
    return;
  }

  if (isRegistering && !email) {
    alert('Por favor, ingresa tu email');
    return;
  }

  if (isRegistering) {
    // Guardar datos temporalmente, el registro real será al guardar el perfil
    currentUser = {
      username: username,
      email: email,
      password: password, // importante para el registro final
      avatar: null,
      description: ''
    };
    showProfileSetup();
  } else {
    // LOGIN
    try {
      // Usamos el campo 'username' para el login (puede ser username o email)
      const loginIdentifier = document.getElementById('username').value.trim();
      if (!loginIdentifier || !password) {
        alert('Por favor, ingresa tu usuario/email y contraseña');
        return;
      }

      const url = `backend/get_login.php?email=${encodeURIComponent(loginIdentifier)}&password=${encodeURIComponent(password)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        currentUser = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          avatar: data.user.avatar_url,
          description: data.user.bio
        };
        // Guardar en localStorage para persistencia
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Para login exitoso, ir directamente a la aplicación principal
        alert(`¡Bienvenido ${currentUser.username}! Entrando a la página principal...`);
        window.location.href = 'Frontend/Pages/home.html';
        console.log('Login exitoso:', currentUser);
      } else {
        alert(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      alert('Error de conexión con el backend');
    }
  }
});

// Mostrar pantalla de configuración de perfil
function showProfileSetup() {
  loginContainer.classList.add('slide-out');
  
  setTimeout(() => {
    loginContainer.classList.add('hidden');
    profileContainer.classList.remove('hidden');
    profileContainer.classList.add('slide-in');
  }, 300);
}

// Manejo de subida de avatar
uploadBtn.addEventListener('click', () => {
  avatarInput.click();
});

avatarInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    selectedAvatarFile = file;
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarImg.src = e.target.result;
      avatarImg.classList.remove('hidden');
      avatarPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
});

// Contador de caracteres para la descripción
descriptionTextarea.addEventListener('input', (e) => {
  const length = e.target.value.length;
  charCount.textContent = length;
  
  if (length > 180) {
    charCount.style.color = '#ef4444';
  } else {
    charCount.style.color = '#9ca3af';
  }
});

// Guardar perfil
saveProfileBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const description = descriptionTextarea.value.trim();

  if (isRegistering) {
    // Registrar usuario con todos los datos
    if (selectedAvatarFile) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const avatarBase64 = ev.target.result;
        await enviarPerfilRegistro(description, avatarBase64);
      };
      reader.readAsDataURL(selectedAvatarFile);
    } else {
      enviarPerfilRegistro(description, null);
    }
  } else {
    // Solo login, no se envía nada extra
    currentUser.description = description;
    if (selectedAvatarFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        currentUser.avatar = e.target.result;
        showWelcomeScreen();
      };
      reader.readAsDataURL(selectedAvatarFile);
    } else {
      showWelcomeScreen();
    }
  }
});

// Función para registrar usuario con todos los datos
async function enviarPerfilRegistro(bio, avatar_url) {
  try {
    const res = await fetch('backend/post_users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser.username,
        email: currentUser.email,
        password: currentUser.password,
        bio: bio,
        avatar_url: avatar_url
      })
    });
    const data = await res.json();
    if (res.ok) {
      currentUser.description = data.bio;
      currentUser.avatar = data.avatar_url;
      showWelcomeScreen();
    } else {
      alert(data.error || 'Error al guardar el perfil');
    }
  } catch (err) {
    alert('Error de conexión con el backend');
  }
}

// Saltar configuración de perfil
skipProfile.addEventListener('click', (e) => {
  e.preventDefault();
  showWelcomeScreen();
});

// Mostrar pantalla de bienvenida
function showWelcomeScreen() {
  profileContainer.classList.add('slide-out');
  
  setTimeout(() => {
    profileContainer.classList.add('hidden');
    
    // Configurar datos de bienvenida
    welcomeUsername.textContent = currentUser.username;
    welcomeDescription.textContent = currentUser.description || 'Welcome to our community!';
    
    if (currentUser.avatar) {
      // El backend ahora SIEMPRE devuelve una URL completa (o base64 para usuarios antiguos)
      finalAvatarImg.src = currentUser.avatar;
    } else {
      // Opcional: mostrar un placeholder si no hay avatar
      finalAvatarImg.style.display = 'none'; // Oculta la imagen
      // O podrías tener un div con texto que se muestre en su lugar
      document.querySelector('.final-avatar-placeholder').style.display = 'block';
    }

    welcomeContainer.classList.remove('hidden');
    welcomeContainer.classList.add('slide-in');
  }, 300);
}

// Ir a la página principal
continueBtn.addEventListener('click', () => {
  // Guardar en localStorage para persistencia
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  alert(`¡Bienvenido ${currentUser.username}! Entrando a la página principal...`);
  window.location.href = 'Frontend/Pages/home.html';
});

// Canvas background (mantenido del código original)
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = '#0e001a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Prevenir el comportamiento por defecto del drag and drop en toda la página
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
