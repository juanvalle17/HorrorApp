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
    
    // Verificar usuarios
    $stmt = $pdo->query("SELECT id, username, email FROM users LIMIT 5");
    $users = $stmt->fetchAll();
    
    // Verificar posts
    $stmt = $pdo->query("SELECT id, user_id, content, created_at FROM posts LIMIT 5");
    $posts = $stmt->fetchAll();
    
    // Verificar categorías
    $stmt = $pdo->query("SELECT id, name FROM categories");
    $categories = $stmt->fetchAll();
    
    // Verificar post_images
    $stmt = $pdo->query("SELECT id, post_id, image_url, caption FROM post_images LIMIT 5");
    $post_images = $stmt->fetchAll();
    
    echo json_encode([
        'status' => 'success',
        'data' => [
            'users' => $users,
            'posts' => $posts,
            'categories' => $categories,
            'post_images' => $post_images
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 