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

    function getAvatarSrc(avatarUrl) {
        if (!avatarUrl || avatarUrl.endsWith('null')) {
            return '../Assets/Imagenes/M.jpg'; 
        }
        if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:image')) {
            return avatarUrl;
        }
        const imagePath = avatarUrl.startsWith('uploads/') ? avatarUrl : `uploads/${avatarUrl}`;
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
            userImage.src = getAvatarSrc(currentUser.avatar);
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
            profilePostImage.src = getAvatarSrc(currentUser.avatar);
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
            const avatarFinal = getAvatarSrc(post.avatar_url);
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
    window.openCommentModal = function(button) {
        const post = button.closest('.post');
        currentPostElement = post;
        const modal = document.getElementById('commentModal');
        const originalPostContainer = document.getElementById('originalPost');
        const replyToUser = document.getElementById('replyToUser');
        
        const postClone = post.cloneNode(true);
        
        const actions = postClone.querySelector('.post-actions');
        if (actions) {
            actions.remove();
        }
        
        originalPostContainer.innerHTML = '';
        originalPostContainer.appendChild(postClone);
        
        const username = post.querySelector('.username').textContent;
        replyToUser.textContent = username;
        
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
    }

    // Función para cerrar el modal de comentarios
    window.closeCommentModal = function() {
        const modal = document.getElementById('commentModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentPostElement = null;
    }

    // Función para enviar la respuesta
    window.submitReply = function() {
        const replyText = document.getElementById('replyInput').value.trim();
        
        if (replyText && currentPostElement) {
            const commentButton = currentPostElement.querySelector('.comment-btn');
            const countSpan = commentButton.querySelector('.count');
            let count = parseInt(countSpan.textContent);
            countSpan.textContent = count + 1;
            
            commentButton.classList.add('active', 'commented');
            
            alert('¡Respuesta enviada exitosamente!');
            
            closeCommentModal();
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

    // --- Función de logout ---
    function logout() {
        // Limpiar localStorage
        localStorage.removeItem('currentUser');
        
        // Redirigir al login
        window.location.href = '../../login.html';
    }

    // --- Event listener para el botón de más opciones (logout) ---
    const btnMoreOptions = document.querySelector('.h-user-button-more');
    if (btnMoreOptions) {
        btnMoreOptions.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que se active el click del perfil
            
            // Crear menú desplegable
            const dropdown = document.createElement('div');
            dropdown.className = 'absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50';
            dropdown.innerHTML = `
                <div class="py-2">
                    <button class="w-full px-4 py-2 text-left text-white hover:bg-gray-700 text-sm" onclick="logout()">
                        Cerrar sesión
                    </button>
                </div>
            `;
            
            // Posicionar el dropdown
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
        });
    }

    // Hacer logout disponible globalmente
    window.logout = logout;

    // --- Inicialización ---
    updateUserInfo();
    loadPosts();
}

// Llama a la función principal cuando el DOM esté listo.
document.addEventListener('DOMContentLoaded', initHome);
