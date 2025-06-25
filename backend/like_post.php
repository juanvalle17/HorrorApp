<?php
header('Content-Type: application/json');
require 'conn.php';


$user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
$post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;

if ($user_id <= 0 || $post_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos', 'debug' => $_POST]);
    exit;
}

try {
    // Verificar si ya existe el like
    $stmt = $conn->prepare("SELECT id FROM post_likes WHERE user_id = ? AND post_id = ?");
    $stmt->execute([$user_id, $post_id]);
    $like = $stmt->fetch();

    if ($like) {
        // Si existe, quitar el like
        $stmt = $conn->prepare("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?");
        $stmt->execute([$user_id, $post_id]);
        $liked = false;
    } else {
        // Si no existe, agregar el like
        $stmt = $conn->prepare("INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)");
        $stmt->execute([$user_id, $post_id]);
        $liked = true;
    }

    // Contar likes actuales
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM post_likes WHERE post_id = ?");
    $stmt->execute([$post_id]);
    $total = $stmt->fetchColumn();

    echo json_encode([
        'success' => true,
        'liked' => $liked,
        'total_likes' => intval($total)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'debug' => $_POST]);
}
?>