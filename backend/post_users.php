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
$avatar_data = isset($data['avatar_url']) ? $data['avatar_url'] : null;
$avatar_url_to_db = null;

if ($avatar_data) {
    // Es una data URL, ej: data:image/jpeg;base64,/9j/4AAQSk...
    // 1. Separar el tipo de la data
    if (preg_match('/^data:image\/(\w+);base64,/', $avatar_data, $type)) {
        // $type[1] tendrá la extensión (jpeg, png, etc.)
        $image_data = substr($avatar_data, strpos($avatar_data, ',') + 1);
        $image_data = base64_decode($image_data);
        
        if ($image_data === false) {
            http_response_code(400);
            echo json_encode(['error' => 'La imagen en base64 es inválida.']);
            exit;
        }

        // 2. Generar nombre de archivo único
        $extension = strtolower($type[1]);
        $filename = 'avatar_' . uniqid() . '.' . $extension;
        $upload_path = 'uploads/' . $filename;

        // 3. Guardar el archivo
        if (file_put_contents($upload_path, $image_data)) {
            $avatar_url_to_db = $upload_path;
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo guardar la imagen de perfil.']);
            exit;
        }
    }
}

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
        ':avatar_url'     => $avatar_url_to_db
    ]);

    // Construir URL completa para la respuesta
    $final_avatar_response_url = $avatar_url_to_db;
    if ($avatar_url_to_db && !preg_match('/^data:image/', $avatar_url_to_db)) {
        // Asumiendo que SCRIPT_NAME es /HorrorApp/backend/post_users.php
        // dirname($_SERVER['SCRIPT_NAME']) es /HorrorApp/backend
        // dirname(dirname(...)) es /HorrorApp
        $base_url = "http://" . $_SERVER['HTTP_HOST'] . dirname(dirname($_SERVER['SCRIPT_NAME']));
        $final_avatar_response_url = $base_url . "/backend/" . $avatar_url_to_db;
    }

    // 6) Respuesta exitosa
    http_response_code(201);
    echo json_encode([
        'message'    => 'Usuario creado exitosamente',
        'user_id'    => $conn->lastInsertId(),
        'username'   => $data['username'],
        'email'      => $data['email'],
        'bio'        => $bio,
        'avatar_url' => $final_avatar_response_url
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
