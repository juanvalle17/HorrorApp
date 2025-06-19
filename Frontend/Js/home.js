let currentPostElement = null;

        // Función para abrir el modal de comentarios
        function openCommentModal(button) {
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

        // Función para manejar los likes
        function toggleLike(button) {
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
        function toggleRepost(button) {
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
        document.addEventListener('DOMContentLoaded', () => {
            // Contador de caracteres en tiempo real
            const replyInput = document.getElementById('replyInput');
            replyInput.addEventListener('input', updateCharCount);
            
            // Cerrar modal con Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeCommentModal();
                }
            });
            
            // Cerrar modal al hacer clic fuera
            document.getElementById('commentModal').addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    closeCommentModal();
                }
            });
            
            // Enviar respuesta con Ctrl+Enter
            replyInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    submitReply();
                }
            });

            // Animación inicial de los posts
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
        });