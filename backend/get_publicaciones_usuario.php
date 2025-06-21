<?php
header('Content-Type: application/json');
require('conn.php'); // Reutilizar la conexión existente

// Validar que se recibió el parámetro user_id
if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro user_id']);
    exit;
}

$user_id = intval($_GET['user_id']);

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'El user_id no es válido.']);
    exit;
}

try {
    // Consulta mejorada para obtener los datos que el frontend espera
    $sql = "
        SELECT 
            p.id,
            p.content,
            pi.caption as title, -- Usar el caption de la imagen como título
            p.created_at,
            c.name AS category_name, -- Coincidir con lo que espera renderPosts
            u.username,
            u.avatar_url,
            (SELECT image_url FROM post_images WHERE post_id = p.id ORDER BY id ASC LIMIT 1) AS image_url, -- Obtener solo la primera imagen
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
            (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) AS reposts_count
        FROM posts p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN post_images pi ON pi.post_id = p.id AND pi.id = (SELECT MIN(id) FROM post_images WHERE post_id = p.id) -- Para obtener el caption correcto
        WHERE p.user_id = :user_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute([':user_id' => $user_id]);
    $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($publicaciones);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error en la base de datos',
        'details' => $e->getMessage()
    ]);
    exit;
}
