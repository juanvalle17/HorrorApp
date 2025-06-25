<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require('conn.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// user_id ahora vendrá del cliente
$user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;

// Validar campos obligatorios
$content = isset($_POST['content']) ? trim($_POST['content']) : '';
$category_id = isset($_POST['category_id']) ? intval($_POST['category_id']) : 0;
$title = isset($_POST['title']) ? trim($_POST['title']) : '';

if (empty($content) || empty($title) || !$category_id || !$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'El título, el contenido, la categoría y el ID de usuario son obligatorios.']);
    exit;
}

if (empty($_FILES['images']) || $_FILES['images']['error'][0] === UPLOAD_ERR_NO_FILE) {
    http_response_code(400);
    echo json_encode(['error' => 'Es obligatorio subir al menos una imagen.']);
    exit;
}

try {
    // 1. Insertar el post
    $sql = "INSERT INTO posts (user_id, category_id, content) VALUES (:user_id, :category_id, :content)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':user_id' => $user_id,
        ':category_id' => $category_id,
        ':content' => $content
    ]);
    $post_id = $conn->lastInsertId();

    // 2. Procesar imágenes (ahora siempre existen)
    $image_urls = [];
    $upload_dir = __DIR__ . '/uploads/';
    foreach ($_FILES['images']['name'] as $idx => $name) {
        if ($_FILES['images']['error'][$idx] === UPLOAD_ERR_OK) {
            $tmp_name = $_FILES['images']['tmp_name'][$idx];
            $ext = pathinfo($name, PATHINFO_EXTENSION);
            $safe_name = uniqid('img_', true) . '.' . $ext;
            $dest_path = $upload_dir . $safe_name;
            if (move_uploaded_file($tmp_name, $dest_path)) {
                $url = 'uploads/' . $safe_name;
                $image_urls[] = $url;
                
                $current_caption = ($idx === 0) ? $title : null;

                $sql_img = "INSERT INTO post_images (post_id, image_url, caption) VALUES (:post_id, :image_url, :caption)";
                $stmt_img = $conn->prepare($sql_img);
                $stmt_img->execute([
                    ':post_id' => $post_id,
                    ':image_url' => $url,
                    ':caption' => $current_caption
                ]);
            }
        }
    }

    http_response_code(201);
    echo json_encode([
        'message' => 'Post creado exitosamente',
        'post_id' => $post_id,
        'image_urls' => $image_urls
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error en la base de datos',
        'details' => $e->getMessage()
    ]);
}
