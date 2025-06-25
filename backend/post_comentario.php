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

$user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
$post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
$content = isset($_POST['content']) ? trim($_POST['content']) : '';

if ($user_id <= 0 || $post_id <= 0 || empty($content)) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

try {
    $sql = "INSERT INTO comments (user_id, post_id, content, created_at) VALUES (:user_id, :post_id, :content, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':user_id' => $user_id,
        ':post_id' => $post_id,
        ':content' => $content
    ]);
    $comment_id = $conn->lastInsertId();

    // Obtener el comentario recién insertado con datos de usuario
    $sql = "SELECT c.id, c.content, c.created_at, u.username, u.avatar_url FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':id' => $comment_id]);
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(201);
    echo json_encode(['message' => 'Comentario guardado', 'comentario' => $comment]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos', 'details' => $e->getMessage()]);
} 