<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require 'conn.php';

$query = isset($_GET['query']) ? trim($_GET['query']) : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
if ($query === '' && $category === '') {
    echo json_encode([]);
    exit;
}

try {
    $where = [];
    $params = [];
    if ($query !== '') {
        // Búsqueda por varias palabras (todas deben estar presentes)
        $words = preg_split('/\s+/', $query);
        foreach ($words as $i => $word) {
            $where[] = "(
                LOWER(p.content) LIKE :q$i OR
                LOWER(u.username) LIKE :q$i OR
                LOWER(pi.caption) LIKE :q$i
            )";
            $params[":q$i"] = '%' . strtolower($word) . '%';
        }
    }
    if ($category !== '' && strtolower($category) !== 'todas') {
        $where[] = 'c.name = :cat';
        $params[':cat'] = $category;
    }
    $whereSql = count($where) ? ('WHERE ' . implode(' AND ', $where)) : '';
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
            ) AS total_likes,
            (
                SELECT COUNT(*) FROM comments WHERE post_id = p.id
            ) AS total_comentarios
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN post_images pi ON p.id = pi.post_id
        LEFT JOIN categories c ON p.category_id = c.id
        $whereSql
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 50;
    ";
    $stmt = $conn->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($posts);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} 