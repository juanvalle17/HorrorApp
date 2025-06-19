<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require ('conn.php');

// 2) Sólo aceptamos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// 3) Leer y decodificar JSON
$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido']);
    exit;
}

// 4) Validar campos
if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan campos requeridos']);
    exit;
}
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Formato de email inválido']);
    exit;
}
if (strlen($data['username']) < 3 || strlen($data['username']) > 30) {
    http_response_code(400);
    echo json_encode(['error' => 'El username debe tener entre 3 y 30 caracteres']);
    exit;
}
if (strlen($data['email']) > 100) {
    http_response_code(400);
    echo json_encode(['error' => 'El email no puede exceder los 100 caracteres']);
    exit;
}
if (strlen($data['password']) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'La contraseña debe tener al menos 6 caracteres']);
    exit;
}

// 4.1) Leer bio y avatar_url si existen
$bio = isset($data['bio']) ? $data['bio'] : null;
$avatar_url = isset($data['avatar_url']) ? $data['avatar_url'] : null;

try {
    // 5) Preparar e insertar con PDO
    $sql = "
      INSERT INTO users (username, email, password_hash, bio, avatar_url)
      VALUES (:username, :email, :password_hash, :bio, :avatar_url)
    ";
    $stmt = $conn->prepare($sql);

    $stmt->execute([
        ':username'       => $data['username'],
        ':email'          => $data['email'],
        ':password_hash'  => password_hash($data['password'], PASSWORD_DEFAULT),
        ':bio'            => $bio,
        ':avatar_url'     => $avatar_url
    ]);

    // 6) Respuesta exitosa
    http_response_code(201);
    echo json_encode([
        'message'    => 'Usuario creado exitosamente',
        'user_id'    => $conn->lastInsertId(),
        'username'   => $data['username'],
        'email'      => $data['email'],
        'bio'        => $bio,
        'avatar_url' => $avatar_url
    ]);

} catch (\PDOException $e) {
    // 7) Manejo de duplicados
    if ($e->getCode() === '23000') {  // constraint violation
        http_response_code(409);
        echo json_encode(['error' => 'El username o email ya existe']);
    } else {
        http_response_code(500);
        echo json_encode([
            'error'   => 'Error en la base de datos',
            'details' => $e->getMessage()
        ]);
    }
}
