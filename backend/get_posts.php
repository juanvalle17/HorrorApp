<?php
header('Content-Type: application/json');

$mysqli = new mysqli("localhost", "root", "", "horrorapp");
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión"]);
    exit;
}

$query = "
SELECT 
    posts.id, posts.content, posts.created_at,
    users.username, users.avatar_url,
    categories.name AS category
FROM posts
JOIN users ON posts.user_id = users.id
JOIN categories ON posts.category_id = categories.id
ORDER BY posts.created_at DESC
";

$result = $mysqli->query($query);

$posts = [];
while ($post = $result->fetch_assoc()) {
    // Traer imágenes
    $post_id = $post['id'];
    $img_query = $mysqli->query("SELECT image_url, caption FROM post_images WHERE post_id = $post_id");
    $post['images'] = $img_query->fetch_all(MYSQLI_ASSOC);
    $posts[] = $post;
}

echo json_encode($posts);
