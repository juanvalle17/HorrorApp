// async function cargarTemplate() {
//     const response = await fetch('/Frontend/src/templates/post-template.html');
//     const html = await response.text();
//     const tempContainer = document.createElement('div');
//     tempContainer.innerHTML = html;

//     const template = tempContainer.querySelector('template');
//     document.body.appendChild(template);
// }

// function crearPost({ user, handle, time, content, avatar, comments, repost, likes }) {
//     const template = document.getElementById("post-template");
//     const clone = template.content.cloneNode(true);

//     // Usar querySelector en lugar de getElementById para el clon
//     clone.querySelector("[data-avatar]").src = avatar || '/Frontend/src/assets/imagenes/M.jpg';
//     clone.querySelector("[data-avatar]").alt = user || 'Anónimo';
//     clone.querySelector("[data-username]").textContent = user || 'Anónimo';
//     clone.querySelector("[data-handle-time]").textContent = `${handle || '@anon'} · ${time || 'ahora'}`;
//     clone.querySelector("[data-content]").innerHTML = content || '';
//     clone.querySelector("[data-comments]").textContent = comments || '0';
//     clone.querySelector("[data-repost]").textContent = repost || '0';
//     clone.querySelector("[data-likes]").textContent = likes || '0';

//     return clone;
// }

// document.addEventListener('DOMContentLoaded', async () => {
//     await cargarTemplate();

//     const container = document.getElementById("postsContainer");

//     const post = crearPost({
//         user: 'Lectora Macabra',
//         handle: '@macabre_reader',
//         time: '6h',
//         avatar: '/Frontend/src/assets/imagenes/LectoraMacabra.jpg',
//         content: `Terminé de leer <strong>'Pet Sematary'</strong>. <span class='text-red-400'>#StephenKing</span>`,
//         comments: '8',
//         repost: '3',
//         likes: '19'
//     });

//     container.appendChild(post);
// });