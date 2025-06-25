<?php
header('Content-Type: application/json');
require 'conn.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

if ($post_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

try {
    // Contar likes
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM post_likes WHERE post_id = ?");
    $stmt->execute([$post_id]);
    $total = $stmt->fetchColumn();

    // Saber si el usuario ya dio like
    $liked = false;
    if ($user_id > 0) {
        $stmt = $conn->prepare("SELECT id FROM post_likes WHERE user_id = ? AND post_id = ?");
        $stmt->execute([$user_id, $post_id]);
        $liked = $stmt->fetch() ? true : false;
    }

    echo json_encode([
        'total_likes' => intval($total),
        'liked' => $liked
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>