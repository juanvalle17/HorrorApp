<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$db = 'horrorapp';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Consulta de prueba para ver posts con captions
    $sql = "
        SELECT 
            p.id,
            p.content,
            p.created_at,
            c.name AS categoria,
            u.username,
            u.avatar_url,
            pi.image_url,
            pi.caption,
            (
                SELECT COUNT(*) 
                FROM comments 
                WHERE post_id = p.id
            ) AS total_comentarios
        FROM posts p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN post_images pi ON pi.post_id = p.id
        ORDER BY p.created_at DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Posts de prueba cargados correctamente',
        'data' => $posts
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 