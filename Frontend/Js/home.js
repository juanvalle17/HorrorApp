function initHome() {
    let currentPostElement = null;
    let files_to_upload = [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // console.log('👤 Usuario logueado:', currentUser);

    // --- Cargar posteos dinámicamente ---
    async function loadPosts() {
        console.log('🔍 Iniciando carga de posts...');
        console.log('👤 Usuario actual:', currentUser);
        
        if (!currentUser || !currentUser.id) {
            console.error('❌ No se encontró usuario para cargar los posts.');
            // Aquí podrías redirigir al login si no hay usuario
            // window.location.href = '/login.html';
            return;
        }

        // Primero probar la conexión
        try {
            console.log('🔧 Probando conexión al backend...');
            const testResponse = await fetch('../../backend/test_connection.php');
            const testData = await testResponse.json();
            console.log('🔧 Test de conexión:', testData);
        } catch (error) {
            console.error('❌ Error en test de conexión:', error);
        }

        // Probar carga de posts con captions
        try {
            console.log('🔧 Probando carga de posts con captions...');
            const postsTestResponse = await fetch('../../backend/test_posts.php');
            const postsTestData = await postsTestResponse.json();
            console.log('🔧 Test de posts con captions:', postsTestData);
        } catch (error) {
            console.error('❌ Error en test de posts:', error);
        }

        try {
            const url = `../../backend/get_posts.php`;
            console.log('🌐 Haciendo fetch a:', url);
            
            const response = await fetch(url);
            console.log('📡 Respuesta del servidor:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error('La respuesta de la red no fue exitosa.');
            }
            
            const posts = await response.json();
            console.log('📦 Posts recibidos:', posts);
            
            renderPosts(posts);
        } catch (error) {
            console.error('❌ Error al cargar los posts:', error);
            const feed = document.getElementById('post-feed');
            if(feed) feed.innerHTML = '<p class="text-center text-gray-500">No se pudieron cargar las publicaciones. Inténtalo de nuevo más tarde.</p>';
        }
    }

    // --- Helpers para construir rutas de imágenes ---
    const backendBaseUrl = '../../backend';

    function getAvatarUrl(user) {
        const username = (user && (user.username || user.autor || 'U')).toString();
        const avatar = user && (user.avatar_url || user.avatar);
        if (!avatar || avatar.endsWith('null')) {
            return '../Assets/Imagenes/M.jpg';
        }
        if (avatar.startsWith('http') || avatar.startsWith('data:image')) {
            return avatar;
        }
        const imagePath = avatar.startsWith('uploads/') ? avatar : `uploads/${avatar}`;
        return `${backendBaseUrl}/${imagePath}`;
    }

    function getPostImageSrc(imageUrl) {
        if (!imageUrl || imageUrl.endsWith('null')) {
            return ''; // Retorna vacío si no hay imagen
        }
        if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image')) {
            return imageUrl;
        }
        const imagePath = imageUrl.startsWith('uploads/') ? imageUrl : `uploads/${imageUrl}`;
        return `${backendBaseUrl}/${imagePath}`;
    }

    // --- Actualizar información del usuario en el sidebar ---
    function updateUserInfo() {
        if (!currentUser) return;

        // Actualizar imagen de perfil en el sidebar
        const userImage = document.querySelector('.h-user-image');
        if (userImage) {
            userImage.src = getAvatarUrl(currentUser);
        }

        // Actualizar nombre de usuario en el sidebar
        const userName = document.querySelector('.h-user-name');
        if (userName) {
            userName.textContent = currentUser.username || 'Usuario Anónimo';
        }

        // Actualizar username en el sidebar
        const userUsername = document.querySelector('.h-user-username');
        if (userUsername) {
            userUsername.textContent = `@${currentUser.username || 'usuario'}`;
        }

        // Actualizar imagen de perfil en el formulario de post
        const profilePostImage = document.querySelector('.profile-post');
        if (profilePostImage) {
            profilePostImage.src = getAvatarUrl(currentUser);
        }
    }

    function renderPosts(posts) {
        console.log('POSTS RECIBIDOS PARA RENDERIZAR:', posts);
        console.log('🎨 Renderizando posts:', posts);
        
        const feed = document.getElementById('post-feed');
        if (!feed) {
            console.error('❌ No se encontró el elemento post-feed');
            return;
        }

        if (posts.length === 0) {
            console.log('📭 No hay posts para mostrar');
            feed.innerHTML = '<p class="text-center text-gray-500">Parece que aún no hay publicaciones. ¡Crea la primera!</p>';
            return;
        }

        console.log('🔨 Generando HTML para', posts.length, 'posts');
        
        feed.innerHTML = posts.map((post, index) => {
            console.log(`📝 Post ${index + 1}:`, post);
            const avatarFinal = getAvatarUrl(post);
            const imagenFinal = getPostImageSrc(post.image_url);

            return `
                <social-post
                    postid="${post.id}"
                    username="${post.username}"
                    avatar="${avatarFinal}"
                    time="${new Date(post.created_at).toLocaleString()}"
                    title="${post.caption || 'Sin título'}"
                    image="${imagenFinal}"
                    category="${post.categoria}"
                    category-icon="icon-movie" 
                    content="${post.content}"
                    comments="${post.total_comentarios || 0}"
                    likes="${post.total_likes || 0}">
                </social-post>
            `;
        }).join('');
        
        // Actualizar likes reales y estado de like
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const postsElements = feed.querySelectorAll('social-post');
        postsElements.forEach(postEl => {
            const postId = postEl.getAttribute('postid');
            fetch(`../../backend/get_likes.php?post_id=${postId}&user_id=${currentUser ? currentUser.id : ''}`)
                .then(res => res.json())
                .then(data => {
                    postEl.setAttribute('likes', data.total_likes);
                    if (data.liked) {
                        postEl.shadowRoot.querySelector('.like-btn').classList.add('active', 'liked');
                    } else {
                        postEl.shadowRoot.querySelector('.like-btn').classList.remove('active', 'liked');
                    }
                });
            // Evento para like
            postEl.shadowRoot.querySelector('.like-btn').addEventListener('click', () => {
                fetch('../../backend/like_post.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `user_id=${currentUser.id}&post_id=${postId}`
                })
                .then(res => res.json())
                .then(data => {
                    postEl.setAttribute('likes', data.total_likes);
                    if (data.liked) {
                        postEl.shadowRoot.querySelector('.like-btn').classList.add('active', 'liked');
                    } else {
                        postEl.shadowRoot.querySelector('.like-btn').classList.remove('active', 'liked');
                    }
                });
            });
        });
        
        console.log('✅ Posts renderizados correctamente');
    }

    // Función para abrir el modal de comentarios
    window.openCommentModal = async function(button) {
        // Buscar el componente social-post más cercano
        const post = button.closest('social-post');
        currentPostElement = post;
        const modal = document.getElementById('commentModal');
        const originalPostContainer = document.getElementById('originalPost');
        const replyToUser = document.getElementById('replyToUser');
        const commentsList = document.getElementById('commentsList');

        // Crear una copia visual del post
        const postData = {
            username: post.getAttribute('username'),
            avatar: post.getAttribute('avatar'),
            time: post.getAttribute('time'),
            title: post.getAttribute('title'),
            image: post.getAttribute('image'),
            category: post.getAttribute('category'),
            content: post.getAttribute('content')
        };
        const tempPost = document.createElement('social-post');
        Object.entries(postData).forEach(([key, value]) => {
            if (value) tempPost.setAttribute(key, value);
        });
        originalPostContainer.innerHTML = '';
        originalPostContainer.appendChild(tempPost);
        setTimeout(() => {
            const modalPost = originalPostContainer.querySelector('social-post');
            if (modalPost && modalPost.shadowRoot) {
                const actions = modalPost.shadowRoot.querySelector('.post-actions');
                if (actions) actions.style.display = 'none';
            }
        }, 50);
        replyToUser.textContent = postData.username;
        document.getElementById('replyInput').value = '';
        updateCharCount();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            document.getElementById('replyInput').focus();
        }, 300);
        button.classList.add('pulse');
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 300);

        // --- Cargar comentarios del post ---
        if (commentsList) {
            commentsList.innerHTML = '<div style="text-align:center;color:#aaa;">Cargando comentarios...</div>';
            const postId = post.getAttribute('postid') || post.getAttribute('id');
            try {
                const res = await fetch(`../../backend/get_comentarios_post.php?post_id=${postId}`);
                const comentarios = await res.json();
                if (Array.isArray(comentarios) && comentarios.length > 0) {
                    commentsList.innerHTML = comentarios.map(c => `
                        <div style="display:flex;align-items:center;gap:0.7rem;margin-bottom:0.7rem;">
                            <img src="${getAvatarUrl(c)}" alt="avatar" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid #7c3aed;">
                            <span style="font-weight:500;">${c.username}</span>
                            <span style="color:#d1d5db;font-size:0.95em;">${c.content}</span>
                            <span style="color:#aaa;font-size:0.8em;margin-left:auto;">${new Date(c.created_at).toLocaleString()}</span>
                        </div>
                    `).join('');
                } else {
                    commentsList.innerHTML = '<div style="text-align:center;color:#aaa;">Aún no hay comentarios.</div>';
                }
            } catch (e) {
                commentsList.innerHTML = '<div style="text-align:center;color:#e74c3c;">Error al cargar comentarios.</div>';
            }
        }
    }

    // Función para cerrar el modal de comentarios
    window.closeCommentModal = function() {
        const modal = document.getElementById('commentModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentPostElement = null;
    }

    // Función para enviar la respuesta
    window.submitReply = async function() {
        const replyText = document.getElementById('replyInput').value.trim();
        if (replyText && currentPostElement) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const postId = currentPostElement.getAttribute('postid') || currentPostElement.getAttribute('data-postid');
            if (!currentUser || !postId) {
                alert('Debes iniciar sesión para comentar.');
                return;
            }
            try {
                const response = await fetch('../../backend/post_comentario.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `user_id=${currentUser.id}&post_id=${postId}&content=${encodeURIComponent(replyText)}`
                });
                const data = await response.json();
                if (response.ok) {
                    // Actualizar contador de comentarios
                    const commentButton = currentPostElement.querySelector('.comment-btn') || (currentPostElement.shadowRoot && currentPostElement.shadowRoot.querySelector('.comment-btn'));
                    const countSpan = commentButton ? commentButton.querySelector('.count') : null;
                    if (countSpan) {
                        let count = parseInt(countSpan.textContent);
                        countSpan.textContent = count + 1;
                    }
                    if (commentButton) commentButton.classList.add('active', 'commented');
                    alert('¡Comentario enviado exitosamente!');
                    closeCommentModal();
                } else {
                    alert(data.error || 'Error al enviar el comentario');
                }
            } catch (e) {
                alert('Error de conexión al enviar el comentario');
            }
        }
    }

    // Función para actualizar el contador de caracteres
    window.updateCharCount = function() {
        const input = document.getElementById('replyInput');
        const charCount = document.getElementById('charCount');
        const replyButton = document.getElementById('replyButton');
        const currentLength = input.value.length;
        
        charCount.textContent = `${currentLength}/280`;
        
        if (currentLength > 250) {
            charCount.classList.add('warning');
            charCount.classList.remove('error');
        } else if (currentLength >= 280) {
            charCount.classList.add('error');
            charCount.classList.remove('warning');
        } else {
            charCount.classList.remove('warning', 'error');
        }
        
        replyButton.disabled = currentLength === 0 || currentLength > 280;
    }

    // Función para manejar los likes
    window.toggleLike = function(button) {
        const countSpan = button.querySelector('.count');
        let count = parseInt(countSpan.textContent);
        
        button.classList.add('pulse');
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 300);
        
        if (button.classList.contains('active')) {
            button.classList.remove('active', 'liked');
            countSpan.textContent = count - 1;
        } else {
            button.classList.add('active', 'liked');
            countSpan.textContent = count + 1;
        }
    }

    // Función para manejar los reposts
    window.toggleRepost = function(button) {
        const countSpan = button.querySelector('.count');
        let count = parseInt(countSpan.textContent);
        
        button.classList.add('pulse');
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 300);
        
        if (button.classList.contains('active')) {
            button.classList.remove('active', 'reposted');
            countSpan.textContent = count - 1;
        } else {
            button.classList.add('active', 'reposted');
            countSpan.textContent = count + 1;
        }
    }

    // Event listeners
    const replyInput = document.getElementById('replyInput');
    if (replyInput) {
        replyInput.addEventListener('input', updateCharCount);
        replyInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                submitReply();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCommentModal();
        }
    });

    const commentModal = document.getElementById('commentModal');
    if (commentModal) {
        commentModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeCommentModal();
            }
        });
    }

    const posts = document.querySelectorAll('.post');
    posts.forEach((post, index) => {
        post.style.opacity = '0';
        post.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            post.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            post.style.opacity = '1';
            post.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // --- Lógica de previsualización de imágenes ---
    const image_input = document.getElementById('imagesPost');
    const preview_container = document.getElementById('image-preview-container');
    const imageUploadLabel = document.querySelector('.image-upload-label');

    if (image_input) {
        image_input.addEventListener('change', () => {
            if (imageUploadLabel) imageUploadLabel.classList.remove('has-error');
            files_to_upload = []; // Resetear array para nueva selección
            const files = image_input.files;
            for (let i = 0; i < files.length; i++) {
                files_to_upload.push(files[i]);
            }
            update_preview();
        });
    }

    function update_preview() {
        preview_container.innerHTML = '';
        for (let i = 0; i < files_to_upload.length; i++) {
            const file = files_to_upload[i];
            const reader = new FileReader();

            reader.addEventListener('load', () => {
                const preview_item = document.createElement('div');
                preview_item.classList.add('preview-item');

                const img = document.createElement('img');
                img.classList.add('preview-image');
                img.src = reader.result;

                const remove_btn = document.createElement('button');
                remove_btn.classList.add('remove-image-btn');
                remove_btn.innerHTML = '&times;';
                remove_btn.addEventListener('click', () => {
                    files_to_upload.splice(i, 1);
                    const dt = new DataTransfer();
                    files_to_upload.forEach(file => dt.items.add(file));
                    image_input.files = dt.files;
                    update_preview();
                });

                preview_item.appendChild(img);
                preview_item.appendChild(remove_btn);
                preview_container.appendChild(preview_item);
            });

            reader.readAsDataURL(file);
        }
    }

    const form = document.getElementById('formNewPost');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Leer el usuario desde localStorage JUSTO antes de publicar para asegurar que tenemos los datos
            const userFromStorage = JSON.parse(localStorage.getItem('currentUser'));

            if (!userFromStorage || !userFromStorage.id) {
                alert('Debes iniciar sesión para poder publicar.');
                return;
            }

            if (imageUploadLabel) imageUploadLabel.classList.remove('has-error');

            const content = document.getElementById('contentPost').value.trim();
            const category = document.getElementById('categoryPost').value;
            const title = document.getElementById('postTitle').value.trim();

            if (!title || !content || !category) {
                alert('El título, el contenido y la categoría son obligatorios.');
                return;
            }

            if (files_to_upload.length === 0) {
                if (imageUploadLabel) imageUploadLabel.classList.add('has-error');
                return;
            }

            const formData = new FormData();
            formData.append('user_id', userFromStorage.id); // Usar el ID del usuario del storage
            formData.append('title', title);
            formData.append('content', content);
            formData.append('category_id', category);

            for (let i = 0; i < files_to_upload.length; i++) {
                formData.append('images[]', files_to_upload[i]);
            }
            try {
                const response = await fetch('../../backend/post_post.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert('¡Post creado exitosamente!');
                    form.reset();
                    preview_container.innerHTML = '';
                    files_to_upload = [];
                    loadPosts(); // Recargar los posts
                } else {
                    alert(`Error: ${result.error}`);
                }
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                alert('Hubo un error de conexión al crear el post.');
            }
        });
    }

    // --- Lógica de contadores ---
    const titleInput = document.getElementById('postTitle');
    const contentInput = document.getElementById('contentPost');
    const titleCounter = document.getElementById('title-counter');
    const contentCounter = document.getElementById('content-counter');

    function updateCounter(input, counter, maxLength) {
        const currentLength = input.value.length;
        counter.textContent = `${currentLength}/${maxLength}`;

        const warningThreshold = maxLength * 0.9;

        counter.classList.remove('warning', 'error');

        if (currentLength > maxLength) {
            counter.classList.add('error');
        } else if (currentLength > warningThreshold) {
            counter.classList.add('warning');
        }
    }

    if (titleInput && titleCounter) {
        titleInput.addEventListener('input', () => updateCounter(titleInput, titleCounter, 100));
        updateCounter(titleInput, titleCounter, 100);
    }

    if (contentInput && contentCounter) {
        contentInput.addEventListener('input', () => updateCounter(contentInput, contentCounter, 280));
        updateCounter(contentInput, contentCounter, 280);
    }

    // --- Event listener para el botón de perfil ---
    const btnProfile = document.getElementById('btnProfile');
    if (btnProfile) {
        btnProfile.addEventListener('click', () => {
            // Limpiar cualquier perfil seleccionado
            localStorage.removeItem('profileViewId');
            localStorage.removeItem('profileViewUsername');
            // Efecto visual de clic
            btnProfile.style.transform = 'scale(0.95)';
            btnProfile.style.transition = 'transform 0.1s ease';
            // Restaurar después de 100ms y redirigir
            setTimeout(() => {
                btnProfile.style.transform = 'scale(1)';
                // Redirigir a la página de perfil
                window.location.href = 'profile.html';
            }, 100);
        });
    }

    // --- Función de logout mejorada ---
    function logout() {
        if (confirm('¿Seguro que quieres cerrar sesión?')) {
            UserManager.logout(); // Esto limpia el localStorage y redirige al login
        }
    }

    // --- Event listener para el botón de más opciones (logout) ---
    const btnMoreOptions = document.querySelector('.h-user-button-more');
    if (btnMoreOptions) {
        btnMoreOptions.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que se active el click del perfil
            // Eliminar cualquier dropdown anterior
            const oldDropdown = btnMoreOptions.querySelector('.dropdown-logout');
            if (oldDropdown) oldDropdown.remove();
            // Crear menú desplegable
            const dropdown = document.createElement('div');
            dropdown.className = 'dropdown-logout';
            dropdown.style.position = 'absolute';
            dropdown.style.top = 'calc(100% + 8px)';
            dropdown.style.right = '0';
            dropdown.style.background = '#181c23';
            dropdown.style.border = '1px solid #23263a';
            dropdown.style.borderRadius = '12px';
            dropdown.style.boxShadow = '0 4px 24px 0 rgba(30,30,60,0.18)';
            dropdown.style.minWidth = '150px';
            dropdown.style.padding = '0.5rem 0.5rem 0.5rem 0.5rem';
            dropdown.style.zIndex = '9999';
            dropdown.innerHTML = `
                <button id="logoutBtnSidebar" style="
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                    width: 100%;
                    background: none;
                    border: none;
                    color: #e57373;
                    font-size: 1rem;
                    font-weight: 500;
                    border-radius: 8px;
                    padding: 0.6rem 0.7rem;
                    cursor: pointer;
                    transition: background 0.18s, color 0.18s;
                "
                onmouseover="this.style.background='#23263a';this.style.color='#fff'"
                onmouseout="this.style.background='none';this.style.color='#e57373'"
                >
                    <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                    <span style="flex:1;text-align:left;">Cerrar sesión</span>
                </button>
            `;
            btnMoreOptions.style.position = 'relative';
            btnMoreOptions.appendChild(dropdown);
            // Cerrar dropdown al hacer clic fuera
            setTimeout(() => {
                document.addEventListener('click', function closeDropdown(e) {
                    if (!btnMoreOptions.contains(e.target)) {
                        dropdown.remove();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }, 0);
            // Event listener para logout
            const logoutBtn = dropdown.querySelector('#logoutBtnSidebar');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    dropdown.remove();
                    logout();
                });
            }
        });
    }

    // Hacer logout disponible globalmente
    window.logout = logout;

    // --- NUEVO: Cargar líderes de posts en usuarios destacados ---
    async function loadLeaders() {
        try {
            const response = await fetch('../../backend/get_lideres.php');
            const leaders = await response.json();
            const followContainer = document.querySelector('.container-follow');
            if (!followContainer) return;

            // Elimina líderes previos si existen
            const oldLeaders = followContainer.querySelector('.leaders-list');
            if (oldLeaders) oldLeaders.remove();

            // Crear contenedor de líderes
            const leadersDiv = document.createElement('div');
            leadersDiv.className = 'leaders-list';
            leadersDiv.style.marginTop = '1rem';
            leadersDiv.innerHTML = `
                ${leaders.map((u, i) => `
                    <div class="leader-item follow-item" style="display:flex;align-items:center;gap:0.7rem;margin-bottom:0.7rem;cursor:pointer;" data-userid="${u.id}" data-username="${u.username}">
                        <span style="font-size:1.2rem;font-weight:bold;width:1.5rem;display:inline-block;text-align:center;">${i+1}</span>
                        <img src="${getAvatarUrl(u)}" alt="avatar" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid #7c3aed;cursor:pointer;">
                        <span style="font-weight:500;cursor:pointer;">${u.username}</span>
                        <span style="color:#d1d5db;font-size:0.95em;margin-left:auto;">${u.total_posts} posts</span>
                    </div>
                `).join('')}
            `;
            followContainer.appendChild(leadersDiv);
            // Evento para redirigir al perfil seleccionado
            leadersDiv.querySelectorAll('.leader-item').forEach(item => {
                item.addEventListener('click', function() {
                    localStorage.setItem('profileViewId', this.dataset.userid);
                    localStorage.setItem('profileViewUsername', this.dataset.username);
                    window.location.href = 'profile.html';
                });
            });
        } catch (e) {
            // Si hay error, no muestra nada
            console.error('Error cargando líderes:', e);
        }
    }

    // --- Funcionalidad de Explorar Mejorada y Compacta con búsqueda en tiempo real ---
    const exploreBtn = document.getElementById('exploreBtn');
    const exploreSearchContainer = document.getElementById('explore-search-container');
    const exploreSearchInput = document.getElementById('explore-search-input');
    const exploreCategorySelect = document.getElementById('explore-category-select');
    const exploreSearchBtn = document.getElementById('explore-search-btn');
    let debounceTimeout = null;
    if (exploreBtn && exploreSearchContainer && exploreSearchInput && exploreCategorySelect && exploreSearchBtn) {
        function doSearch() {
            const query = exploreSearchInput.value.trim();
            const category = exploreCategorySelect.value;
            // Si la categoría es 'todas' y no hay query, mostrar todos los posts
            if ((query.length === 0) && (category === 'todas')) {
                loadPosts();
                return;
            }
            fetch(`../../backend/search_posts.php?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`)
                .then(res => res.json())
                .then(posts => {
                    if (posts.length === 0) {
                        document.getElementById('post-feed').innerHTML = '<p class="text-center text-gray-500">No se encontraron resultados para tu búsqueda.</p>';
                    } else {
                        renderPosts(posts);
                    }
                });
        }
        exploreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Posicionar el panel justo debajo del botón
            const rect = exploreBtn.getBoundingClientRect();
            exploreSearchContainer.style.left = rect.left + 'px';
            exploreSearchContainer.style.top = (rect.bottom + window.scrollY) + 'px';
            exploreSearchContainer.style.display = exploreSearchContainer.style.display === 'none' ? 'block' : 'none';
            if (exploreSearchContainer.style.display === 'block') {
                exploreSearchInput.focus();
            }
        });
        exploreSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                doSearch();
            }
        });
        exploreSearchBtn.addEventListener('click', doSearch);
        exploreCategorySelect.addEventListener('change', doSearch);
        // Búsqueda en tiempo real con debounce
        exploreSearchInput.addEventListener('input', function() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(doSearch, 300);
        });
        // Cerrar el panel al hacer clic fuera
        document.addEventListener('click', function closeExplorePanel(e) {
            if (exploreSearchContainer.style.display === 'block' && !exploreSearchContainer.contains(e.target) && e.target !== exploreBtn) {
                exploreSearchContainer.style.display = 'none';
            }
        });
    }

    // --- Tendencias: mostrar los 3 posts con más likes ---
    function renderTrendingPosts(posts) {
        const container = document.getElementById('trending-posts');
        if (!container) return;
        if (!posts || posts.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-sm">No hay tendencias aún.</p>';
            return;
        }
        container.innerHTML = posts.map(post => `
            <div class="trending-item flex items-center justify-between py-2 pd-4 border-b border-gray-700 last:border-b-0">
                <div>
                    <span class="trending-hashtag font-semibold">${post.caption ? '#' + post.caption.replace(/\s+/g, '') : '#' + post.content.slice(0, 12).replace(/\s+/g, '')}</span>
                    <span class="trending-count ml-2">${post.total_likes} likes</span>
                    <div class="trending-description flex items-center gap-1 mt-1">
                        <svg class="trending-description-icon w-4 h-4">
                            <use href="../Assets/Icons/sprite.svg#${getCategoryIcon(post.categoria)}"></use>
                        </svg>
                        <span class="trending-description-text text-xs">${post.categoria}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Helper para icono de categoría
    function getCategoryIcon(cat) {
        if (!cat) return 'icon-book-text';
        const c = cat.toLowerCase();
        if (c.includes('pel')) return 'icon-movie';
        if (c.includes('serie')) return 'icon-monitor-play';
        if (c.includes('libro')) return 'icon-book-text';
        return 'icon-book-text';
    }

    function loadTrendingPosts() {
        fetch('../../backend/get_trending_posts.php')
            .then(res => res.json())
            .then(posts => renderTrendingPosts(posts));
    }

    // --- Inicialización ---
    updateUserInfo();
    loadPosts();
    loadLeaders(); // <-- Llamar aquí para cargar los líderes al iniciar la home
    loadTrendingPosts(); // <-- Llamar aquí para cargar los posts de tendencia al iniciar la home

    // Al cargar currentUser desde localStorage, si solo existe avatar_url o avatar, sincronízalos
    if (currentUser) {
        if (currentUser.avatar_url && !currentUser.avatar) currentUser.avatar = currentUser.avatar_url;
        if (currentUser.avatar && !currentUser.avatar_url) currentUser.avatar_url = currentUser.avatar;
    }
}

// Llama a la función principal cuando el DOM esté listo.
document.addEventListener('DOMContentLoaded', initHome);

// --- Abrir modal de comentarios automáticamente si viene de perfil ---
document.addEventListener('DOMContentLoaded', () => {
    const postIdToOpen = localStorage.getItem('openCommentPostId');
    if (postIdToOpen) {
        // Esperar a que los posts estén renderizados
        setTimeout(() => {
            const postEl = document.querySelector(`social-post[postid='${postIdToOpen}']`);
            if (postEl) {
                openCommentModal(postEl);
            }
            localStorage.removeItem('openCommentPostId');
        }, 700); // Espera para asegurar que los posts ya están en el DOM
    }
});
