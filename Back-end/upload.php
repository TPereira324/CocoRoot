<?php
session_start();

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: *');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

spl_autoload_register(static function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/' . str_replace('\\', '/', $relative) . '.php';
    if (file_exists($path)) {
        require_once $path;
    }
});

$jsonResponse = static function (array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit();
};

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    $jsonResponse(['success' => false, 'message' => 'Método inválido.'], 405);
}

$path = trim((string)($_GET['route'] ?? ($_SERVER['PATH_INFO'] ?? '')), '/');
$segments = array_values(array_filter(explode('/', $path), static fn($segment) => $segment !== ''));

if (empty($segments) || $segments[0] !== 'usuarios') {
    $jsonResponse(['success' => false, 'message' => 'Endpoint não encontrado.'], 404);
}

$action = $segments[1] ?? '';
$id = isset($segments[2]) ? (int)$segments[2] : null;

if ($action === 'upload-foto' && $id > 0) {
    try {
        if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Nenhum arquivo foi enviado.');
        }

        $uploadService = new \App\Service\FileUploadService();
        $fotoCaminho = $uploadService->uploadUserAvatar($id, $_FILES['foto']);

        $jsonResponse([
            'success' => true,
            'message' => 'Foto de perfil atualizada com sucesso.',
            'data' => ['foto' => $fotoCaminho]
        ], 200);
    } catch (Exception $e) {
        $jsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
    }
} else {
    $jsonResponse(['success' => false, 'message' => 'Endpoint não encontrado.'], 404);
}
