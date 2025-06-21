<?php
header('Content-Type: application/json');

$host = 'localhost';
$db = 'horrorapp';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

if (!isset($_GET['id_usuario'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro id_usuario']);
    exit;
}

$idUsuario = intval($_GET['id_usuario']);

// Consulta que une solo la primera imagen por publicación
$sql = "
    SELECT 
        p.id,
        p.content,
        p.created_at,
        p.updated_at,
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
    LEFT JOIN (
        SELECT p1.*
        FROM post_images p1
        INNER JOIN (
            SELECT post_id, MIN(id) AS min_id
            FROM post_images
            GROUP BY post_id
        ) p2 ON p1.id = p2.min_id
    ) pi ON pi.post_id = p.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
";

$stmt = $pdo->prepare($sql);
$stmt->execute([$idUsuario]);
$publicaciones = $stmt->fetchAll();



echo json_encode($publicaciones);
