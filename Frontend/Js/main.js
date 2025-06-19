document.addEventListener("DOMContentLoaded", function () {
    const profileBtn = document.getElementById("btnProfile");
    const mainContent = document.getElementById("contenido");

    profileBtn.addEventListener("click", function () {
        fetch("/Frontend/Pages/profile.html")
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudo cargar el perfil.");
                }
                return response.text();
            })
            .then(html => {
                mainContent.innerHTML = html;
            })
            .catch(error => {
                mainContent.innerHTML = `<p>Error al cargar el perfil: ${error.message}</p>`;
            });
    });
});
