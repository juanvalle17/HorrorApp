<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 

require 'conn.php'; 

try {
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("SET NAMES 'utf8mb4'");

    $query = "
        SELECT 
            p.id,
            p.content,
            p.created_at,
            u.username,
            u.avatar_url,
            pi.image_url,
            pi.caption,
            c.name AS categoria
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN post_images pi ON p.id = pi.post_id
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 50;
    ";

    $stmt = $conn->query($query);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($posts);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la consulta: ' . $e->getMessage()]);
} finally {

    $conn = null;
}
