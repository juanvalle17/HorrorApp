<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require 'conn.php';

try {
    $sql = "
        SELECT 
            p.id,
            p.content,
            p.created_at,
            u.username,
            u.avatar_url,
            pi.image_url,
            pi.caption,
            c.name AS categoria,
            (
                SELECT COUNT(*) FROM post_likes WHERE post_id = p.id
            ) AS total_likes
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN post_images pi ON p.id = pi.post_id
        LEFT JOIN categories c ON p.category_id = c.id
        GROUP BY p.id
        ORDER BY total_likes DESC, p.created_at DESC
        LIMIT 3;
    ";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($posts);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} 