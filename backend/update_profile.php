<?php
require_once 'conn.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
$bio = isset($_POST['bio']) ? trim($_POST['bio']) : '';

if ($user_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'ID de usuario inválido']);
    exit;
}

// Procesar imagen si se envía
$avatar_url = null;
if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
    $filename = 'avatar_' . uniqid() . '.' . $ext;
    $dest = __DIR__ . '/uploads/' . $filename;
    if (move_uploaded_file($_FILES['avatar']['tmp_name'], $dest)) {
        $avatar_url = $filename;
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al subir la imagen']);
        exit;
    }
}

// Actualizar datos en la base de datos
try {
    $sql = 'UPDATE users SET bio = :bio' . ($avatar_url ? ', avatar_url = :avatar_url' : '') . ' WHERE id = :id';
    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':bio', $bio);
    if ($avatar_url) $stmt->bindValue(':avatar_url', $avatar_url);
    $stmt->bindValue(':id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    echo json_encode(['success' => true, 'avatar_url' => $avatar_url]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} 