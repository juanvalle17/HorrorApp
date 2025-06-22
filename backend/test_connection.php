<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

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
    
    // Verificar si hay usuarios en la base de datos
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $userCount = $stmt->fetch()['total'];
    
    // Verificar si hay posts en la base de datos
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM posts");
    $postCount = $stmt->fetch()['total'];
    
    // Verificar si hay categorías en la base de datos
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM categories");
    $categoryCount = $stmt->fetch()['total'];
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Conexión exitosa a la base de datos',
        'data' => [
            'users' => $userCount,
            'posts' => $postCount,
            'categories' => $categoryCount
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de conexión',
        'details' => $e->getMessage()
    ]);
}
?> 