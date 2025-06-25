// Obtener el usuario actual desde localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Verificar si hay un usuario logueado
if (!currentUser || !currentUser.id) {
    console.error('❌ No hay usuario logueado. Redirigiendo al login...');
    window.location.href = '../../login.html';
}

const idUsuario = currentUser.id;

// Limpiar siempre el profileViewId al entrar al perfil
localStorage.removeItem('profileViewId');

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

// Mostrar botón de editar solo si es tu propio perfil
if (profileUserId === currentUser.id) {
  const editBtn = document.getElementById('editProfileBtn');
  if (editBtn) editBtn.style.display = 'block';
}

// Lógica de edición de perfil
const editBtn = document.getElementById('editProfileBtn');
const editFormContainer = document.getElementById('editProfileFormContainer');
if (editBtn && editFormContainer) {
  editBtn.addEventListener('click', () => {
    // Mostrar formulario
    editFormContainer.innerHTML = `
      <form id="profileEditForm" style="display:flex;flex-direction:column;gap:1rem;background:#23263a;padding:1.2rem 1rem;border-radius:12px;box-shadow:0 2px 12px #0003;">
        <label style="font-weight:500;color:#fff;">Nueva foto de perfil
          <input type="file" id="editAvatarInput" accept="image/*" style="display:block;margin-top:0.5rem;color:#fff;" />
        </label>
        <div id="editAvatarPreviewContainer" style="display:flex;align-items:center;gap:1rem;"></div>
        <label style="font-weight:500;color:#fff;">Biografía
          <textarea id="editBioInput" maxlength="200" style="width:100%;margin-top:0.5rem;padding:0.5rem;border-radius:8px;border:1px solid #444;background:#181c23;color:#fff;resize:none;min-height:60px;"></textarea>
        </label>
        <button type="submit" style="background:#7c3aed;color:white;border:none;border-radius:8px;padding:0.6rem 1.2rem;font-weight:500;cursor:pointer;">Guardar cambios</button>
        <button type="button" id="cancelEditProfile" style="background:#23263a;color:#aaa;border:none;border-radius:8px;padding:0.6rem 1.2rem;font-weight:500;cursor:pointer;">Cancelar</button>
      </form>
    `;
    editFormContainer.style.display = 'block';
    editBtn.style.display = 'none';

    // Prellenar bio actual
    fetch(`${backendBaseUrl}/get_profile.php?user_id=${currentUser.id}`)
      .then(res => res.json())
      .then(profileUser => {
        document.getElementById('editBioInput').value = profileUser.bio || '';
        // Previsualizar avatar actual
        const preview = document.getElementById('editAvatarPreviewContainer');
        preview.innerHTML = `<img src="${getAvatarSrc(profileUser.avatar_url, profileUser.username)}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #7c3aed;" />`;
      });

    // Previsualización de nueva imagen
    document.getElementById('editAvatarInput').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          document.getElementById('editAvatarPreviewContainer').innerHTML = `<img src="${ev.target.result}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #7c3aed;" />`;
        };
        reader.readAsDataURL(file);
      }
    });

    // Cancelar edición
    document.getElementById('cancelEditProfile').onclick = () => {
      editFormContainer.style.display = 'none';
      editBtn.style.display = 'block';
    };

    // Guardar cambios (ahora implementado)
    document.getElementById('profileEditForm').onsubmit = async (e) => {
      e.preventDefault();
      const bio = document.getElementById('editBioInput').value.trim();
      const avatarInput = document.getElementById('editAvatarInput');
      const formData = new FormData();
      formData.append('user_id', currentUser.id);
      formData.append('bio', bio);
      if (avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
      }
      try {
        const res = await fetch(`${backendBaseUrl}/update_profile.php`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          // Actualizar la vista y localStorage
          const userNameElement = document.querySelector('h1');
          if (userNameElement) userNameElement.textContent = currentUser.username || 'Usuario Anónimo';
          const userDescriptionElement = document.querySelector('p.text-base.text-gray-400');
          if (userDescriptionElement) userDescriptionElement.textContent = bio || 'Amante del terror y lo sobrenatural';
          const userAvatarElement = document.querySelector('img.w-24.h-24');
          if (userAvatarElement && data.avatar_url) userAvatarElement.src = getAvatarSrc(data.avatar_url, currentUser.username);
          // Actualizar localStorage
          let updatedUser = { ...currentUser, bio };
          if (data.avatar_url) {
            updatedUser.avatar_url = data.avatar_url;
            updatedUser.avatar = data.avatar_url;
          }
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          // Ocultar formulario y mostrar botón
          editFormContainer.style.display = 'none';
          editBtn.style.display = 'block';
          alert('¡Perfil actualizado correctamente!');
        } else {
          alert('Error al actualizar el perfil: ' + (data.error || 'Error desconocido.'));
        }
      } catch (err) {
        alert('Error de conexión al actualizar el perfil.');
      }
    };
  });
}
