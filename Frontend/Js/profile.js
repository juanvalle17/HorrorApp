const reviews = Array.from({ length: 14 }, (_, i) => ({
      titulo: `Libro ${i + 1}`,
      autor: "Crítico Fantasma",
      img: "img1.jpg",
      tipo: "Libro",
      estrellas: (i % 5) + 1,
      texto: "Reseña interesante sobre un libro muy perturbador y oscuro...",
      hace: `${i + 1} horas atrás`,
      likes: Math.floor(Math.random() * 100),
      comentarios: Math.floor(Math.random() * 50),
      compartidos: Math.floor(Math.random() * 20)
    }));

    const comentarios = Array.from({ length: 12 }, (_, i) => ({
      autor: `Usuario${i + 1}`,
      texto: `Este es el comentario número ${i + 1}. Muy buen contenido.`
    }));

    const porPagina = 6;
    const porPaginaReviews = 4;

    function renderizarComentarios(pagina = 1) {
      const grid = document.getElementById("comentarios-grid");
      const paginador = document.getElementById("paginador");
      const inicio = (pagina - 1) * porPagina;""
      const items = comentarios.slice(inicio, inicio + porPagina);
      grid.innerHTML = items.map(c => `
        <div class="bg-gray-800 p-5 rounded-xl shadow-md transition duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:bg-gray-700">
          <div class="flex items-center mb-3">
            <div class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold mr-3">
              ${c.autor[0]}
            </div>
            <p class="font-semibold">${c.autor}</p>
          </div>
          <p class="text-gray-300 text-sm">${c.texto}</p>
        </div>`).join("");
      const total = Math.ceil(comentarios.length / porPagina);
      paginador.innerHTML = Array.from({ length: total }, (_, i) => `
        <button class="px-3 py-1 rounded font-medium transition transform hover:scale-105 hover:shadow-md ${pagina === i + 1 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}" onclick="renderizarComentarios(${i + 1})">${i + 1}</button>`).join("");
    }

    function agregarComentario() {
      const input = document.getElementById("nuevoComentario");
      const texto = input.value.trim();
      if (!texto) return;
      comentarios.unshift({ autor: "Tú", texto });
      input.value = "";
      renderizarComentarios(1);
    }

    function renderizarReviews(pagina = 1) {
      const grid = document.getElementById("galeria");
      const paginador = document.getElementById("paginador-reviews");
      const inicio = (pagina - 1) * porPaginaReviews;
      const items = reviews.slice(inicio, inicio + porPaginaReviews);
      grid.innerHTML = items.map(r => `
        <div class="bg-gray-800 p-5 rounded-xl shadow-md transition duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:bg-gray-700">
          <div class="flex items-center gap-4 mb-2">
            <img src="avatar.jpg" class="w-10 h-10 rounded-full object-cover" />
            <div>
              <p class="font-semibold">${r.autor}</p>
              <p class="text-gray-400 text-sm">${r.hace}</p>
            </div>
          </div>
          <hr class="border-gray-700 mb-4" />
          <div class="flex gap-4">
            <img src="${r.img}" class="w-32 h-44 object-cover rounded shadow" />
            <div class="flex-1">
              <h3 class="font-semibold text-lg">${r.titulo}</h3>
              <span class="inline-block bg-red-600 text-white text-xs px-2 py-0.5 rounded-full mt-1 mb-2">${r.tipo}</span>
              <p class="text-yellow-400">${"★".repeat(r.estrellas)} <span class="text-white text-sm">${r.estrellas}/5</span></p>
              <p class="text-gray-300 text-sm mt-2">${r.texto}</p>
            </div>
          </div>
          <hr class="border-gray-700 mt-4 mb-2" />
          <div class="flex justify-between text-gray-400 text-sm">
            <div class="flex items-center gap-2">💬 ${r.comentarios}</div>
            <div class="flex items-center gap-2">🔁 ${r.compartidos}</div>
            <div class="flex items-center gap-2">❤️ ${r.likes}</div>
          </div>
        </div>`).join("");
      const total = Math.ceil(reviews.length / porPaginaReviews);
      paginador.innerHTML = Array.from({ length: total }, (_, i) => `
        <button class="px-3 py-1 rounded font-medium transition transform hover:scale-105 hover:shadow-md ${pagina === i + 1 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}" onclick="renderizarReviews(${i + 1})">${i + 1}</button>`).join("");
    }

    renderizarReviews(1);
    renderizarComentarios(1);
  