document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.getElementById("contenido");
    const homeTemplate = document.getElementById("home-template").content;

    // Función para cargar contenido del template home
    function loadHome() {
        mainContent.innerHTML = ""; // Limpiar contenido actual
        mainContent.appendChild(homeTemplate.cloneNode(true));
        attachHomeEvents();
    }

    // Función para cargar cualquier página externa y añadir botón volver
    function loadPage(url) {
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("No se pudo cargar la página.");
                return res.text();
            })
            .then(html => {
                mainContent.innerHTML = html;
                setupBackButton();
            })
            .catch(err => {
                mainContent.innerHTML = `<p>Error: ${err.message}</p>`;
            });
    }

    // Configurar el botón "volver" para regresar al home
    function setupBackButton() {
        const backButton = mainContent.querySelector(".back-button");
        if (backButton) {
            backButton.addEventListener("click", () => {
                loadHome();
            });
        }
    }

    // Ejemplo: Si en tu contenido home tienes un botón para abrir perfil
    function attachHomeEvents() {
        const profileBtn = document.getElementById("btnProfile");
        if (profileBtn) {
            profileBtn.addEventListener("click", () => {
                loadPage("/Frontend/Pages/profile.html");
            });
        }
        // Aquí podés agregar más eventos para otros botones si querés
    }

    // Cargar el home al inicio
    loadHome();
});
