// Obtener el usuario actual desde localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Verificar si hay un usuario logueado
if (!currentUser || !currentUser.id) {
    console.error('❌ No hay usuario logueado. Redirigiendo al login...');
    window.location.href = '../../login.html';
}

const idUsuario = currentUser.id;
const publicacionesURL = `http://localhost/Parcial%20Programacion/HorrorApp/backend/get_publicaciones_usuario.php?user_id=${idUsuario}`;
const comentariosURL = `http://localhost/Parcial%20Programacion/HorrorApp/backend/get_comentarios_por_usuario.php?user_id=${idUsuario}`;

const porPaginaReviews = 4;
const porPagina = 6;
let comentarios = [];

// Helper para obtener la URL correcta del avatar
function getAvatarSrc(avatarUrl, username = 'U') {
    if (!avatarUrl) {
        return `https://via.placeholder.com/40x40/4B5563/FFFFFF?text=${username.charAt(0).toUpperCase()}`;
    }
    if (avatarUrl.startsWith('data:image')) {
        return avatarUrl;
    }
    return `http://localhost/Parcial%20Programacion/HorrorApp/backend/${avatarUrl}`;
}

// 🔹 PUBLICACIONES (REVIEWS)
const grid = document.getElementById("galeria");
const paginadorReviews = document.getElementById("paginador-reviews");

// 🔧 Función de prueba para verificar datos
async function testDatabase() {
  try {
    console.log('🔧 Probando conexión a la base de datos...');
    const response = await fetch('http://localhost/Parcial%20Programacion/HorrorApp/backend/debug_data.php');
    const data = await response.json();
    console.log('🔧 Datos de la base de datos:', data);
  } catch (error) {
    console.error('❌ Error al probar la base de datos:', error);
  }
}

// Ejecutar prueba de base de datos
testDatabase();

// 🔧 Función para actualizar información del usuario en la página
function updateUserProfileInfo() {
    if (!currentUser) return;
    
    // Actualizar nombre del usuario en el header
    const userNameElement = document.querySelector('h1');
    if (userNameElement) {
        userNameElement.textContent = currentUser.username || 'Usuario Anónimo';
    }
    
    // Actualizar descripción del usuario
    const userDescriptionElement = document.querySelector('p.text-base.text-gray-400');
    if (userDescriptionElement) {
        userDescriptionElement.textContent = currentUser.description || 'Amante del terror y lo sobrenatural';
    }
    
    // Actualizar avatar del usuario
    const userAvatarElement = document.querySelector('img.w-24.h-24');
    if (userAvatarElement) {
        userAvatarElement.src = getAvatarSrc(currentUser.avatar, currentUser.username);
    }
    
    // Actualizar avatar en el formulario de comentarios
    const commentAvatarElement = document.querySelector('img.w-10.h-10');
    if (commentAvatarElement) {
        commentAvatarElement.src = getAvatarSrc(currentUser.avatar, currentUser.username);
    }
}

// Actualizar información del usuario al cargar la página
updateUserProfileInfo();

fetch(publicacionesURL)
  .then(res => res.json())
  .then(publicaciones => {
    console.log("✅ Publicaciones recibidas:", publicaciones);
    renderizarReviews(publicaciones, 1);
    paginadorReviews.innerHTML = generarPaginador(publicaciones.length, porPaginaReviews, renderizarReviews, publicaciones);
  })
  .catch(error => {
    console.error("❌ Error al cargar publicaciones:", error);
    grid.innerHTML = "<p class='text-red-500'>Error al cargar publicaciones.</p>";
  });

function renderizarReviews(data, pagina = 1) {
  const inicio = (pagina - 1) * porPaginaReviews;
  const items = data.slice(inicio, inicio + porPaginaReviews);

  grid.innerHTML = items.map(r => `
    <div class="bg-gray-800 p-5 rounded-xl shadow-md hover:scale-105 transition-transform">
      <div class="flex items-center gap-4 mb-2">
        <img src="${getAvatarSrc(r.avatar_url, r.username)}"
          class="w-10 h-10 rounded-full object-cover" />
        <div>
          <p class="font-semibold">${r.username}</p>
          <p class="text-gray-400 text-sm">${tiempoTranscurrido(r.created_at)}</p>
        </div>
      </div>
      <hr class="border-gray-700 mb-4" />
      <div class="flex gap-4">
        <img src="${r.image_url 
          ? `http://localhost/Parcial%20Programacion/HorrorApp/backend/${r.image_url}` 
          : 'https://via.placeholder.com/120x160/000000/FFFFFF?text=Sin+Imagen'}"
          class="w-32 h-44 object-cover rounded shadow" />
        <div class="flex-1">
          <h3 class="font-semibold text-lg">${r.caption || 'Sin título'}</h3>
          <span class="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full mt-1 mb-2">${formatearCategoria(r.categoria)}</span>
          <p class="text-gray-300 text-sm mt-2">${r.content}</p>
        </div>
      </div>
      <hr class="border-gray-700 mt-4 mb-2" />
      <div class="flex justify-between text-gray-400 text-sm">
        <div class="flex items-center gap-2">💬 ${r.total_comentarios}</div>
        <div class="flex items-center gap-2">🔁 ${Math.floor(Math.random() * 20)}</div>
        <div class="flex items-center gap-2">❤️ ${Math.floor(Math.random() * 100)}</div>
      </div>
    </div>
  `).join("");
}

// 🔹 COMENTARIOS
const gridComentarios = document.getElementById("comentarios-grid");
const paginadorComentarios = document.getElementById("paginador");

fetch(comentariosURL)
  .then(res => res.json())
  .then(data => {
    comentarios = data;
    renderizarComentarios(1);
  })
  .catch(error => {
    console.error("❌ Error al cargar comentarios:", error);
    gridComentarios.innerHTML = "<p class='text-red-500'>Error al cargar comentarios.</p>";
  });

function renderizarComentarios(pagina = 1) {
  const inicio = (pagina - 1) * porPagina;
  const items = comentarios.slice(inicio, inicio + porPagina);

  gridComentarios.innerHTML = items.map(c => `
    <div class="bg-gray-800 p-5 rounded-xl shadow-md hover:scale-105 transition-transform">
      <div class="flex items-center mb-3">
        <div class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold mr-3">
          ${c.autor[0]}
        </div>
        <p class="font-semibold">${c.autor}</p>
      </div>
      <p class="text-gray-300 text-sm">${c.texto}</p>
    </div>
  `).join("");

  const total = Math.ceil(comentarios.length / porPagina);
  paginadorComentarios.innerHTML = Array.from({ length: total }, (_, i) => `
    <button class="px-3 py-1 rounded ${pagina === i + 1 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}"
      onclick="renderizarComentarios(${i + 1})">${i + 1}</button>
  `).join("");
}

function agregarComentario() {
  const input = document.getElementById("nuevoComentario");
  const texto = input.value.trim();
  if (!texto) return;
  comentarios.unshift({ autor: "Tú", texto });
  input.value = "";
  renderizarComentarios(1);
}

// 🧩 UTILIDADES
function generarPaginador(totalItems, porPagina, render, datos) {
  const total = Math.ceil(totalItems / porPagina);
  return Array.from({ length: total }, (_, i) => `
    <button class="px-3 py-1 rounded ${i === 0 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}"
      onclick="render(${JSON.stringify(datos)}, ${i + 1})">${i + 1}</button>
  `).join("");
}

function tiempoTranscurrido(fecha) {
  const creado = new Date(fecha);
  const ahora = new Date();
  const diffHoras = Math.floor((ahora - creado) / (1000 * 60 * 60));
  return `hace ${diffHoras > 0 ? diffHoras : 1} hora${diffHoras !== 1 ? 's' : ''}`;
}

function formatearCategoria(c) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}
