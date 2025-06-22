<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require ('conn.php');

// 1) Sólo aceptamos GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// 2) Obtener parámetros de la URL
$login_identifier = $_GET['email'] ?? ''; // Puede ser email o username
$password = $_GET['password'] ?? '';

// 3) Validar campos
if (empty($login_identifier) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan campos requeridos']);
    exit;
}

// El campo de email debe ser un email válido solo si contiene '@'
if (strpos($login_identifier, '@') !== false && !filter_var($login_identifier, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Formato de email inválido']);
    exit;
}

try {
    // 4) Buscar usuario por email o username
    $sql = "SELECT id, username, email, password_hash, bio, avatar_url FROM users WHERE email = :login OR username = :login";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':login' => $login_identifier]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 5) Verificar si el usuario existe y la contraseña es correcta
    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit;
    }

    // Preparar la URL del avatar
    $avatar_final_url = $user['avatar_url'];
    if ($avatar_final_url && !preg_match('/^data:image/', $avatar_final_url)) {
        $base_url = "http://" . $_SERVER['HTTP_HOST'] . dirname(dirname($_SERVER['SCRIPT_NAME']));
        $avatar_final_url = $base_url . "/backend/" . $avatar_final_url;
    }

    // 6) Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'message' => 'Inicio de sesión exitoso',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'bio' => $user['bio'],
            'avatar_url' => $avatar_final_url
        ]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error en la base de datos',
        'details' => $e->getMessage()
    ]);
} 