function initHome() {
    let currentPostElement = null;
    let files_to_upload = [];

    // Función para abrir el modal de comentarios
    window.openCommentModal = function(button) {
        const post = button.closest('.post');
        currentPostElement = post;
        const modal = document.getElementById('commentModal');
        const originalPostContainer = document.getElementById('originalPost');
        const replyToUser = document.getElementById('replyToUser');
        
        // Clonar el post original
        const postClone = post.cloneNode(true);
        
        // Remover las acciones del post clonado
        const actions = postClone.querySelector('.post-actions');
        if (actions) {
            actions.remove();
        }
        
        // Limpiar el contenedor y agregar el post clonado
        originalPostContainer.innerHTML = '';
        originalPostContainer.appendChild(postClone);
        
        // Establecer el usuario al que se responde
        const username = post.querySelector('.username').textContent;
        replyToUser.textContent = username;
        
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
            // Incrementar el contador de comentarios
            const commentButton = currentPostElement.querySelector('.comment-btn');
            const countSpan = commentButton.querySelector('.count');
            let count = parseInt(countSpan.textContent);
            countSpan.textContent = count + 1;
            
            // Marcar el botón como comentado
            commentButton.classList.add('active', 'commented');
            
            // Simular envío exitoso
            alert('¡Respuesta enviada exitosamente!');
            
            // Cerrar el modal
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
                    // Actualizar el input de archivos para que refleje la eliminación
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
                const data = await response.json();
                if (response.ok) {
                    alert('¡Post publicado!');
                    form.reset();
                    files_to_upload = [];
                    update_preview();
                } else {
                    alert(data.error || 'Error al publicar el post');
                }
            } catch (err) {
                alert('Error de red o servidor');
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
        updateCounter(titleInput, titleCounter, 100); // Llamada inicial
    }

    if (contentInput && contentCounter) {
        contentInput.addEventListener('input', () => updateCounter(contentInput, contentCounter, 280));
        updateCounter(contentInput, contentCounter, 280); // Llamada inicial
    }
}