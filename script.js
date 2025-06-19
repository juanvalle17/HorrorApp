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
submitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const email = document.getElementById('email').value.trim();

  // Validación básica
  if (!username || !password) {
    alert('Please fill in all required fields');
    return;
  }

  if (isRegistering && !email) {
    alert('Please enter your email');
    return;
  }

  // Simular autenticación exitosa
  currentUser = {
    username: username,
    email: email || `${username}@example.com`,
    avatar: null,
    description: ''
  };

  // Transición a la pantalla de perfil
  showProfileSetup();
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
  
  // Actualizar datos del usuario
  currentUser.description = description;
  if (selectedAvatarFile) {
    // En una aplicación real, aquí subirías la imagen a un servidor
    const reader = new FileReader();
    reader.onload = (e) => {
      currentUser.avatar = e.target.result;
      showWelcomeScreen();
    };
    reader.readAsDataURL(selectedAvatarFile);
  } else {
    showWelcomeScreen();
  }
});

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
      finalAvatarImg.src = currentUser.avatar;
    } else {
      // Usar avatar por defecto
      finalAvatarImg.src = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM2YjcyODAiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz4=';
    }
    
    welcomeContainer.classList.remove('hidden');
    welcomeContainer.classList.add('slide-in');
  }, 300);
}

// Continuar a la aplicación
continueBtn.addEventListener('click', () => {
  // Aquí redirigirías a la aplicación principal
  alert(`Welcome ${currentUser.username}! Redirecting to the main app...`);
  
  // Ejemplo: window.location.href = '/dashboard';
  console.log('User profile:', currentUser);
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