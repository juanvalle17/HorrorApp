class SocialPost extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return [
            'username', 'avatar', 'time', 'title', 'image',
            'category', 'category-icon', 'content', 'comments', 'reposts', 'likes'
        ];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render();
            this.setupEventListeners();
        }
    }

    render() {
        const username = this.getAttribute('username') || 'Usuario';
        const avatar = this.getAttribute('avatar') || '';
        const time = this.getAttribute('time') || 'ahora';
        const title = this.getAttribute('title') || 'Título';
        const image = this.getAttribute('image') || '';
        const category = this.getAttribute('category') || 'General';
        const categoryIcon = this.getAttribute('category-icon') || 'icon-book-text'; // icono por defecto
        const content = this.getAttribute('content') || '';
        const comments = this.getAttribute('comments') || '0';
        const likes = this.getAttribute('likes') || '0';
        const postId = this.getAttribute('postid') || this.getAttribute('id') || '';
        // Estado de like por usuario y post
        let liked = false;
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && postId) {
                const likeKey = `like_${currentUser.id}_${postId}`;
                liked = localStorage.getItem(likeKey) === 'true';
            }
        } catch {}

        this.shadowRoot.innerHTML = `
                    <style>
                        :host {
                            display: block;
                        }
                        
                        :root {
                            --color-primary: #2c3e50;
                            --color-secondary: #1f2937;
                            --color-accent: #e74c3c;
                            --color-text: #ecf0f1;
                            --color-text-muted: #95a5a6;
                        }

                        .post {
                            background-color: #1f2937;
                            padding: 20px;
                            border-radius: 10px;
                            margin-bottom: 20px;
                            color: #ecf0f1;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        }

                        .user-info {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            margin-bottom: 15px;
                            padding-bottom: 10px;
                            border-bottom: 1px solid #2c3e50;
                        }

                        .user-avatar {
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            background-color: #e74c3c;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            object-fit: cover;
                        }

                        .user-details {
                            flex: 1;
                        }

                        .username {
                            font-weight: bold;
                            margin: 0;
                        }

                        .post-time {
                            color: #95a5a6;
                            font-size: 0.8em;
                            margin: 0;
                        }

                        .post-header {
                            display: flex;
                            align-items: flex-start;
                            gap: 15px;
                            margin-bottom: 15px;
                        }

                        .post-image {
                            width: 80px;
                            height: 120px;
                            border-radius: 8px;
                            object-fit: cover;
                            flex-shrink: 0;
                            border: 2px solid #2c3e50;
                        }

                        .post-info {
                            flex: 1;
                        }

                        .post-title {
                            font-size: 1.2em;
                            font-weight: bold;
                            margin: 0 0 8px 0;
                        }

                        .post-category {
                            background-color: #e74c3c;
                            color: white;
                            padding: 4px 8px;
                            border-radius: 12px;
                            font-size: 0.6em;
                            display: inline-flex;
                            align-items: center;
                            gap: 4px;
                            margin-bottom: 8px;
                        }

                        .post-category-icon {
                            width: 10px;
                            height: 10px;
                        }

                        .post-content {
                            margin: 15px 0;
                            line-height: 1.6;
                        }

                        .post-actions {
                            display: flex;
                            gap: 2rem;
                            align-items: center;
                            padding-top: 15px;
                            border-top: 1px solid #2c3e50;
                        }

                        .action-button {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            background: none;
                            border: none;
                            color: #95a5a6;
                            cursor: pointer;
                            padding: 8px 12px;
                            border-radius: 6px;
                            transition: all 0.2s ease;
                            font-size: 0.9em;
                        }

                        .action-button:hover {
                            background-color: #2c3e50;
                            color: #ecf0f1;
                        }

                        .action-button.active.liked {
                            color: #e74c3c;
                        }

                        .action-button.active.reposted {
                            color: #27ae60;
                        }

                        .action-button.active.commented {
                            color: #3498db;
                            background-color: rgba(52, 152, 219, 0.1);
                        }

                        .action-icon {
                            width: 20px;
                            height: 20px;
                            fill: currentColor;
                        }

                        .count {
                            font-weight: 500;
                        }

                        .pulse {
                            animation: pulse 0.3s ease-in-out;
                        }

                        @keyframes pulse {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                            100% { transform: scale(1); }
                        }
                    </style>

                    <div class="post">
                        <div class="user-info">
                            <img class="user-avatar" src="${avatar}" alt="${username}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="user-avatar" style="display: none;">${username.charAt(0).toUpperCase()}</div>
                            <div class="user-details">
                                <p class="username">${username}</p>
                                <p class="post-time">${time}</p>
                            </div>
                        </div>

                        <div class="post-header">
                            <img class="post-image" src="${image}" alt="Post image" onerror="this.style.display='none';">
                            <div class="post-info">
                                <h3 class="post-title">${title}</h3>
                                <span class="post-category">
                                    <svg class="post-category-icon">
                                        <use href="../Assets/Icons/sprite.svg#${categoryIcon}"></use>
                                    </svg>
                                    ${category}
                                </span>
                            </div>
                        </div>

                        <div class="post-content">
                            <p>${content}</p>
                        </div>

                        <div class="post-actions">
                            <button class="action-button like-btn${liked ? ' active liked' : ''}" data-action="like">
                                <svg class="action-icon">
                                    <use href="../Assets/Icons/sprite.svg#icon-heart"></use>
                                </svg>
                                <span class="count">${likes}</span>
                            </button>
                            <button class="action-button comment-btn" data-action="comment">
                                <svg class="action-icon">
                                    <use href="../Assets/Icons/sprite.svg#icon-message"></use>
                                </svg>
                                <span class="count">${comments}</span>
                            </button>
                        </div>
                    </div>
                `;
    }

    setupEventListeners() {
        const likeBtn = this.shadowRoot.querySelector('.like-btn');
        const countSpan = likeBtn.querySelector('.count');
        const postId = this.getAttribute('postid') || this.getAttribute('id') || '';
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                if (!currentUser || !postId) return;
                fetch('../../backend/like_post.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `user_id=${currentUser.id}&post_id=${postId}`
                })
                .then(res => res.json())
                .then(data => {
                    const safeLikes = Math.max(0, data.total_likes);
                    countSpan.textContent = safeLikes;
                    if (data.liked) {
                        likeBtn.classList.add('active', 'liked');
                    } else {
                        likeBtn.classList.remove('active', 'liked');
                    }
                });
            });
        }
        const commentBtn = this.shadowRoot.querySelector('.comment-btn');
        if (commentBtn) {
            commentBtn.addEventListener('click', () => {
                openCommentModal(this);
            });
        }
    }
}

// Registrar el componente
customElements.define('social-post', SocialPost);

// Variables globales para el modal
let currentPostElement = null;

// Función para abrir el modal de comentarios
function openCommentModal(button) {
    const post = button.closest('social-post');
    currentPostElement = post;
    const modal = document.getElementById('commentModal');
    const originalPostContainer = document.getElementById('originalPost');
    const replyToUser = document.getElementById('replyToUser');

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

    // Crear elemento temporal para mostrar en el modal
    const tempPost = document.createElement('social-post');
    Object.entries(postData).forEach(([key, value]) => {
        if (value) tempPost.setAttribute(key, value);
    });

    // Limpiar el contenedor y agregar el post clonado
    originalPostContainer.innerHTML = '';
    originalPostContainer.appendChild(tempPost);

    // Remover acciones del post en el modal después de que se renderice
    setTimeout(() => {
        const modalPost = originalPostContainer.querySelector('social-post');
        if (modalPost && modalPost.shadowRoot) {
            const actions = modalPost.shadowRoot.querySelector('.post-actions');
            if (actions) actions.style.display = 'none';
        }
    }, 50);

    // Establecer el usuario al que se responde
    replyToUser.textContent = postData.username;

    // Limpiar el textarea
    document.getElementById('replyInput').value = '';
    updateCharCount();

    // Mostrar el modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Enfocar el textarea
    setTimeout(() => {
        document.getElementById('replyInput').focus();
    }, 300);

    // Marcar el botón como activo temporalmente
    button.classList.add('pulse');
    setTimeout(() => {
        button.classList.remove('pulse');
    }, 300);
}

// Función para cerrar el modal de comentarios
function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentPostElement = null;
}

// Función para enviar la respuesta
function submitReply() {
    const replyText = document.getElementById('replyInput').value.trim();

    if (replyText && currentPostElement) {
        // Incrementar el contador de comentarios
        const currentComments = parseInt(currentPostElement.getAttribute('comments'));
        currentPostElement.setAttribute('comments', (currentComments + 1).toString());

        // Marcar el botón como comentado
        setTimeout(() => {
            const commentButton = currentPostElement.shadowRoot.querySelector('.comment-btn');
            if (commentButton) {
                commentButton.classList.add('active', 'commented');
            }
        }, 50);

        // Simular envío exitoso
        alert('¡Respuesta enviada exitosamente!');

        // Cerrar el modal
        closeCommentModal();
    }
}

// Función para actualizar el contador de caracteres
function updateCharCount() {
    const input = document.getElementById('replyInput');
    const charCount = document.getElementById('charCount');
    const replyButton = document.getElementById('replyButton');
    const currentLength = input.value.length;

    charCount.textContent = `${currentLength}/280`;

    // Cambiar color según la cantidad de caracteres
    if (currentLength > 250) {
        charCount.classList.add('warning');
        charCount.classList.remove('error');
    } else if (currentLength >= 280) {
        charCount.classList.add('error');
        charCount.classList.remove('warning');
    } else {
        charCount.classList.remove('warning', 'error');
    }

    // Habilitar/deshabilitar botón
    replyButton.disabled = currentLength === 0 || currentLength > 280;
}

// Event listener para escuchar eventos del componente
document.addEventListener('post-action', (e) => {
    console.log(`Acción: ${e.detail.action}, Nuevo count: ${e.detail.count}`);
});

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', () => {
    // Contador de caracteres en tiempo real
    const replyInput = document.getElementById('replyInput');
    if (replyInput) {
        replyInput.addEventListener('input', updateCharCount);
    }

    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCommentModal();
        }
    });

    // Cerrar modal al hacer clic fuera
    const commentModal = document.getElementById('commentModal');
    if (commentModal) {
        commentModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeCommentModal();
            }
        });
    }

    // Enviar respuesta con Ctrl+Enter
    if (replyInput) {
        replyInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                submitReply();
            }
        });
    }

    // Animación inicial de los posts
    const posts = document.querySelectorAll('social-post');
    posts.forEach((post, index) => {
        post.style.opacity = '0';
        post.style.transform = 'translateY(20px)';

        setTimeout(() => {
            post.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            post.style.opacity = '1';
            post.style.transform = 'translateY(0)';
        }, index * 200);
    });
});
