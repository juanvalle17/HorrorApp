<?php
header('Content-Type: application/json');

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
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

$user_id = intval($_GET['user_id']);

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'El user_id no es válido.']);
    exit;
}

// Consulta con JOIN para traer una sola imagen por publicación
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
        SELECT post_id, image_url, caption
        FROM post_images
        GROUP BY post_id
    ) pi ON pi.post_id = p.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id]);
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
