document.addEventListener("DOMContentLoaded", () => {
    fetch('../../backend/get_posts.php')
        .then(res => {
            if (!res.ok) throw new Error("No se pudieron cargar los posts");
            return res.json();
        })
        .then(posts => renderPosts(posts))
        .catch(err => console.error(err));
});

function renderPosts(posts) {
    const container = document.getElementById("post-feed");
    container.innerHTML = "";

    posts.forEach(post => {
        const postEl = document.createElement("div");
        postEl.classList.add("post");

        postEl.innerHTML = `
            <div class="post-header">
                <img class="post-avatar" src="${post.avatar_url || '../Assets/Imagenes/M.jpg'}" alt="${post.username}">
                <div class="post-user-info">
                    <span class="post-username">${post.username}</span>
                    <span class="post-category">${post.category}</span>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                <div class="post-images">
                    ${post.images.map(img => `
                        <img src="${img.image_url}" alt="${img.caption || ''}" class="post-img">
                    `).join("")}
                </div>
            </div>
            <div class="post-footer">
                <span class="post-date">${new Date(post.created_at).toLocaleString()}</span>
            </div>
        `;

        container.appendChild(postEl);
    });
}
