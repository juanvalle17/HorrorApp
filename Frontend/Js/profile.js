// Obtener el usuario actual desde localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Verificar si hay un usuario logueado
if (!currentUser || !currentUser.id) {
    console.error('❌ No hay usuario logueado. Redirigiendo al login...');
    window.location.href = '../../login.html';
}

const idUsuario = currentUser.id;

// Determinar a quién mostrar: usuario logueado o usuario seleccionado
let profileUserId = localStorage.getItem('profileViewId') || (currentUser && currentUser.id);
profileUserId = parseInt(profileUserId, 10);

const backendBaseUrl = '../../backend';
const publicacionesURL = `${backendBaseUrl}/get_publicaciones_usuario.php?user_id=${profileUserId}`;
const comentariosURL = `${backendBaseUrl}/get_comentarios_por_usuario.php?user_id=${profileUserId}`;

const porPaginaReviews = 4;
const porPagina = 6;
let comentarios = [];

// Helper para obtener la URL correcta del avatar
function getAvatarSrc(avatarUrl, username = 'U') {
    if (!avatarUrl) {
        return `https://via.placeholder.com/40x40/4B5563/FFFFFF?text=${username.charAt(0).toUpperCase()}`;
    }
    // Si es una URL completa (http/https) o un data-uri, la devuelve directamente.
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:image')) {
        return avatarUrl;
    }
    // Si no, construye la ruta relativa.
    const imagePath = avatarUrl.startsWith('uploads/') ? avatarUrl : `uploads/${avatarUrl}`;
    return `${backendBaseUrl}/${imagePath}`;
}

// Helper para obtener la URL correcta de la imagen del post
function getPostImageSrc(imageUrl) {
    if (!imageUrl) {
        return 'https://via.placeholder.com/120x160/000000/FFFFFF?text=Sin+Imagen';
    }
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image')) {
        return imageUrl;
    }
    // Asegurarse de que el path a 'uploads' no se duplique
    const imagePath = imageUrl.startsWith('uploads/') ? imageUrl : `uploads/${imageUrl}`;
    return `${backendBaseUrl}/${imagePath}`;
}

// 🔹 PUBLICACIONES (REVIEWS)
const grid = document.getElementById("galeria");
const paginadorReviews = document.getElementById("paginador-reviews");

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

// Cargar datos del usuario a mostrar
fetch(`${backendBaseUrl}/get_profile.php?user_id=${profileUserId}`)
  .then(res => res.json())
  .then(profileUser => {
    // Actualizar nombre, bio y avatar
    const userNameElement = document.querySelector('h1');
    if (userNameElement) userNameElement.textContent = profileUser.username || 'Usuario Anónimo';
    const userDescriptionElement = document.querySelector('p.text-base.text-gray-400');
    if (userDescriptionElement) userDescriptionElement.textContent = profileUser.bio || 'Amante del terror y lo sobrenatural';
    const userAvatarElement = document.querySelector('img.w-24.h-24');
    if (userAvatarElement) userAvatarElement.src = getAvatarSrc(profileUser.avatar_url, profileUser.username);
    const commentAvatarElement = document.querySelector('img.w-10.h-10');
    if (commentAvatarElement) commentAvatarElement.src = getAvatarSrc(profileUser.avatar_url, profileUser.username);
  });

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

  grid.innerHTML = items.map(r => {
    const postImage = getPostImageSrc(r.image_url);
    const imageElement = postImage
      ? `<img src="${postImage}"
             class="w-32 h-44 object-cover rounded shadow" 
             alt="${r.caption || 'Post image'}"
             onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'w-32 h-44 rounded shadow bg-gray-700 flex items-center justify-center text-gray-500 text-sm text-center\\'>Imagen no encontrada</div>';"/>`
      : `<div class="w-32 h-44 rounded shadow bg-gray-700 flex items-center justify-center text-gray-500 text-sm text-center">Sin Imagen</div>`;

    return `
    <div class="bg-gray-800 p-5 rounded-xl shadow-md hover:scale-105 transition-transform" data-postid="${r.id}">
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
        ${imageElement}
        <div class="flex-1">
          <h3 class="font-semibold text-lg">${r.caption || 'Sin título'}</h3>
          <span class="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full mt-1 mb-2">${formatearCategoria(r.categoria)}</span>
          <p class="text-gray-300 text-sm mt-2">${r.content}</p>
        </div>
      </div>
      <hr class="border-gray-700 mt-4 mb-2" />
      <div class="flex items-center gap-8 text-gray-400 text-sm">
          <button class="flex items-center gap-2 hover:text-red-500 transition-colors duration-200 like-btn">
              <svg class="w-5 h-5">
                  <use href="../Assets/Icons/sprite.svg#icon-heart"></use>
              </svg>
              <span class="font-semibold like-count">${r.total_likes || 0}</span>
          </button>
          <button class="flex items-center gap-2 hover:text-white transition-colors duration-200 comment-btn">
              <svg class="w-5 h-5">
                  <use href="../Assets/Icons/sprite.svg#icon-message"></use>
              </svg>
              <span class="font-semibold">${r.total_comentarios}</span>
          </button>
      </div>
    </div>
  `}).join("");

  // Actualizar likes reales y estado de like
  const postDivs = grid.querySelectorAll('[data-postid]');
  postDivs.forEach(postDiv => {
    const postId = postDiv.getAttribute('data-postid');
    const likeBtn = postDiv.querySelector('.like-btn');
    const likeCount = postDiv.querySelector('.like-count');
    fetch(`../../backend/get_likes.php?post_id=${postId}&user_id=${currentUser ? currentUser.id : ''}`)
      .then(res => res.json())
      .then(data => {
        likeCount.textContent = data.total_likes;
        if (data.liked) {
          likeBtn.classList.add('text-red-500');
        } else {
          likeBtn.classList.remove('text-red-500');
        }
      });
    likeBtn.addEventListener('click', () => {
      fetch('../../backend/like_post.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `user_id=${currentUser.id}&post_id=${postId}`
      })
      .then(res => res.json())
      .then(data => {
        likeCount.textContent = data.total_likes;
        if (data.liked) {
          likeBtn.classList.add('text-red-500');
        } else {
          likeBtn.classList.remove('text-red-500');
        }
      });
    });
  });
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
        <img src="../../backend/${c.avatar_url ?? 'uploads/default-avatar.png'}" class="w-10 h-10 rounded-full object-cover mr-3" />
        <p class="font-semibold">${c.autor || currentUser.username}</p>
        <span class="ml-4 text-xs text-gray-400">${c.created_at ? tiempoTranscurrido(c.created_at) : ''}</span>
      </div>
      <p class="text-gray-300 text-sm mb-2">${c.texto || c.content}</p>
      ${c.post_id && c.post_title ? `<span class=\"text-violet-400 text-xs\">Comentó en el post: <b>${c.post_title}</b></span>` : ''}
    </div>
  `).join("");

  // Enganchar evento para abrir el modal al volver a home
  setTimeout(() => {
    const links = document.querySelectorAll('.ver-post-link');
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        // Guardar en localStorage el id del post a abrir
        localStorage.setItem('openCommentPostId', this.dataset.postid);
        window.location.href = this.getAttribute('href');
      });
    });
  }, 0);

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
