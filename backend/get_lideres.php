<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'conn.php';

try {
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("SET NAMES 'utf8mb4'");

    $query = "
        SELECT u.id, u.username, u.avatar_url, COUNT(p.id) as total_posts
        FROM users u
        JOIN posts p ON u.id = p.user_id
        GROUP BY u.id, u.username, u.avatar_url
        ORDER BY total_posts DESC
        LIMIT 3
    ";

    $stmt = $conn->query($query);
    $leaders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($leaders);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la consulta: ' . $e->getMessage()]);
} finally {
    $conn = null;
} 