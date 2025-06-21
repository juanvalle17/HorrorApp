const idUsuario = 1;
const publicacionesURL = `http://localhost/Parcial%20Programacion/HorrorApp/backend/get_publicaciones_usuario.php?id_usuario=${idUsuario}`;
const comentariosURL = `http://localhost/Parcial%20Programacion/HorrorApp/backend/get_comentarios_por_usuario.php?id_usuario=${idUsuario}`;

const porPaginaReviews = 4;
const porPagina = 6;
let comentarios = [];

// 🔹 PUBLICACIONES (REVIEWS)
const grid = document.getElementById("galeria");
const paginadorReviews = document.getElementById("paginador-reviews");

fetch(publicacionesURL)
  .then(res => res.json())
  .then(publicaciones => {
    renderizarReviews(publicaciones, 1);
    paginadorReviews.innerHTML = generarPaginador(publicaciones.length, porPaginaReviews, renderizarReviews, publicaciones);
  })
  .catch(error => {
    console.error("Error al cargar publicaciones:", error);
    grid.innerHTML = "<p class='text-red-500'>Error al cargar publicaciones.</p>";
  });

function renderizarReviews(data, pagina = 1) {
  const inicio = (pagina - 1) * porPaginaReviews;
  const items = data.slice(inicio, inicio + porPaginaReviews);

  grid.innerHTML = items.map(r => `
    <div class="bg-gray-800 p-5 rounded-xl shadow-md hover:scale-105">
      <div class="flex items-center gap-4 mb-2">
        <img src="../../${r.avatar_url ?? 'uploads/default-avatar.png'}" class="w-10 h-10 rounded-full object-cover" />
        <div>
          <p class="font-semibold">${r.username}</p>
          <p class="text-gray-400 text-sm">${tiempoTranscurrido(r.created_at)}</p>
        </div>
      </div>
      <hr class="border-gray-700 mb-4" />
      <div class="flex gap-4">
        <img src="../../${r.image_url ?? 'uploads/placeholder.jpg'}" class="w-32 h-44 object-cover rounded shadow" />
        <div class="flex-1">
          <h3 class="font-semibold text-lg">${r.titulo ?? 'Sin título'}</h3>
          <span class="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full mt-1 mb-2">${formatearCategoria(r.categoria)}</span>
          <p class="text-yellow-400">${"★".repeat(r.estrellas ?? 5)} <span class="text-white text-sm">${r.estrellas ?? 5}/5</span></p>
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
    console.error("Error al cargar comentarios:", error);
    gridComentarios.innerHTML = "<p class='text-red-500'>Error al cargar comentarios.</p>";
  });

function renderizarComentarios(pagina = 1) {
  const inicio = (pagina - 1) * porPagina;
  const items = comentarios.slice(inicio, inicio + porPagina);

  gridComentarios.innerHTML = items.map(c => `
    <div class="bg-gray-800 p-5 rounded-xl shadow-md hover:scale-105">
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
