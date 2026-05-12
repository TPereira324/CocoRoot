<?php

namespace App\Service;

use Exception;

class FileUploadService {
    private string $uploadDir = __DIR__ . '/../uploads';
    private array $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    private int $maxFileSize = 5 * 1024 * 1024; // 5MB

    public function __construct() {
        if (!is_dir($this->uploadDir)) {
            @mkdir($this->uploadDir, 0755, true);
        }
    }

    public function uploadUserAvatar(int $userId, array $file): string {
        if (!isset($file['tmp_name'], $file['error'], $file['size'])) {
            throw new Exception('Arquivo inválido.');
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Erro ao carregar o arquivo.');
        }

        if ($file['size'] > $this->maxFileSize) {
            throw new Exception('Arquivo muito grande (máximo 5MB).');
        }

        $mimeType = function_exists('mime_content_type') ? @mime_content_type($file['tmp_name']) : $file['type'];
        if (!in_array($mimeType, $this->allowedMimes, true)) {
            throw new Exception('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.');
        }

        $userDir = $this->uploadDir . '/user_' . $userId;
        if (!is_dir($userDir)) {
            @mkdir($userDir, 0755, true);
        }

        // Delete old avatar if exists
        $oldFiles = glob($userDir . '/avatar.*');
        if (is_array($oldFiles)) {
            foreach ($oldFiles as $oldFile) {
                @unlink($oldFile);
            }
        }

        // Get extension from mime type
        $ext = match($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            default => 'jpg'
        };

        $filename = 'avatar.' . $ext;
        $filepath = $userDir . '/' . $filename;
        $relativePath = 'uploads/user_' . $userId . '/' . $filename;

        if (!@move_uploaded_file($file['tmp_name'], $filepath)) {
            throw new Exception('Falha ao salvar a foto.');
        }

        @chmod($filepath, 0644);
        return $relativePath;
    }
}
