# HorrorApp

¡Bienvenido a HorrorApp! Esta es una red social para amantes del terror, donde puedes compartir y descubrir películas, series y libros del género, así como interactuar con otros usuarios.

## Requisitos
- PHP 7.4+ y servidor web (recomendado XAMPP o similar)
- MySQL
- Navegador web moderno

## Instalación y ejecución
1. Clona este repositorio en tu servidor local (ejemplo: `htdocs` de XAMPP).
2. Crea una base de datos llamada `horrorapp` e importa la estructura correspondiente (no incluida aquí).
3. Asegúrate de que la configuración de conexión en `backend/conn.php` sea correcta:
   ```php
   $conn = new PDO("mysql:host=localhost;dbname=horrorapp", "root", "");
   ```
4. Inicia Apache y MySQL desde XAMPP.
5. Abre `Frontend/Pages/welcome.html` o `Frontend/Pages/login.html` en tu navegador para comenzar.

## Estructura de carpetas
```
HorrorApp/
  backend/           # Lógica y API en PHP
    conn.php         # Conexión a la base de datos
    get_posts.php    # Obtener posts
    post_post.php    # Crear posts
    post_users.php   # Registro de usuarios
    get_login.php    # Login de usuarios
    get_lideres.php  # Usuarios con más posts
    ...
    uploads/         # Imágenes subidas (posts y avatares)
  Frontend/
    Pages/           # Páginas principales (home, login, profile, welcome)
    Js/              # Lógica de frontend (home.js, profile.js, scriptLogin.js, etc.)
    Styles/          # Estilos CSS organizados por páginas y componentes
    Assets/          # Imágenes y recursos gráficos
```

## Principales funcionalidades
- **Registro y login:**
  - Registro con usuario, email, contraseña, avatar y biografía.
  - Login con usuario o email y contraseña.
- **Página principal (home):**
  - Crear nuevos posts con imagen, título, contenido y categoría.
  - Ver publicaciones de toda la comunidad.
  - Dar y quitar like a publicaciones.
  - Ver tendencias y usuarios destacados (los que más posts han hecho).
- **Perfil de usuario:**
  - Ver tus publicaciones y comentarios.
  - Editar tu perfil (avatar, descripción).
- **Página de bienvenida:**
  - Presentación visual para nuevos usuarios.

## Endpoints principales (backend)
- `get_posts.php`: Devuelve los últimos posts con usuario, imagen, likes, etc.
- `post_post.php`: Permite crear un nuevo post (requiere usuario logueado).
- `post_users.php`: Registro de nuevos usuarios (con validación y subida de avatar).
- `get_login.php`: Login de usuario (por email o username).
- `get_lideres.php`: Devuelve los 3 usuarios con más posts.
- `get_likes.php` y `like_post.php`: Consultar y modificar likes de un post.
- `get_publicaciones_usuario.php`: Posts de un usuario específico.
- `get_comentarios_por_usuario.php`: Comentarios hechos por un usuario.

## Recursos gráficos
- Imágenes de ejemplo en `Frontend/Assets/Imagenes/` y `backend/uploads/`.
- Íconos SVG en `Frontend/Assets/Icons/sprite.svg`.

## Notas
- El proyecto está pensado para uso local y educativo.
- Puedes personalizar los estilos y la estructura según tus necesidades.
- Si tienes dudas, revisa los archivos JS y PHP para entender el flujo de datos.

---
¡Disfruta HorrorApp y comparte tu pasión por el terror! 👻 
