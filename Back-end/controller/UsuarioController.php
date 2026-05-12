<?php

namespace App\Controller;

use App\Service\UsuarioService;
use Exception;

class UsuarioController extends Controller
{
    private UsuarioService $usuarioService;

    public function __construct()
    {
        $this->usuarioService = new UsuarioService();
    }

    public function registar(): void
    {
        try {
            $dados = $this->input();
            $user = $this->usuarioService->registar(
                $dados['fullname'] ?? $dados['nome'] ?? '',
                $dados['email'] ?? '',
                $dados['password'] ?? $dados['senha'] ?? '',
                $dados['farm_name'] ?? ''
            );

            $this->json([
                'success' => true,
                'message' => 'Conta criada com sucesso!',
                'user' => $user,
            ], 201);
        } catch (Exception $e) {
            $status = str_contains($e->getMessage(), 'já está registado') ? 409 : 400;
            $this->erro($e->getMessage(), $status);
        }
    }

    public function login(): void
    {
        try {
            $dados = $this->input();
            $user = $this->usuarioService->login(
                $dados['email'] ?? '',
                $dados['password'] ?? $dados['senha'] ?? ''
            );

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_nome'] = $user['nome'];
            $_SESSION['user_email'] = $user['email'];

            $this->json([
                'success' => true,
                'user' => $user,
            ]);
        } catch (Exception $e) {
            $status = str_contains($e->getMessage(), 'não encontrado') ? 404 : 401;
            $this->erro($e->getMessage(), $status);
        }
    }

    public function perfil(int $id): void
    {
        try {
            $this->success($this->usuarioService->obterPerfil($id));
        } catch (Exception $e) {
            $this->erro($e->getMessage(), 404);
        }
    }

    public function atualizar(int $id): void
    {
        try {
            $dados = $this->input();
            $user = $this->usuarioService->atualizar($id, $dados);
            $this->success($user, 'Perfil atualizado com sucesso.');
        } catch (Exception $e) {
            $this->erro($e->getMessage());
        }
    }

    public function alterarPassword(int $id): void
    {
        try {
            $dados = $this->input();
            $this->usuarioService->alterarPassword(
                $id,
                $dados['password_atual'] ?? '',
                $dados['password_nova'] ?? ''
            );
            $this->success(null, 'Password alterada com sucesso.');
        } catch (Exception $e) {
            $this->erro($e->getMessage());
        }
    }

    public function uploadFoto(int $id): void
    {
        try {
            if (!isset($_FILES['foto'])) {
                throw new Exception('Nenhum arquivo foi enviado.');
            }
            if ($_FILES['foto']['error'] === UPLOAD_ERR_INI_SIZE) {
                throw new Exception('A imagem excede o tamanho máximo permitido pelo servidor.');
            }
            if ($_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('Erro no upload. Código do servidor: ' . $_FILES['foto']['error']);
            }

            $uploadService = new \App\Service\FileUploadService();
            $fotoCaminho = $uploadService->uploadUserAvatar($id, $_FILES['foto']);

            $this->success(['foto' => $fotoCaminho], 'Foto de perfil atualizada com sucesso.');
        } catch (Exception $e) {
            $this->erro($e->getMessage(), 400);
        }
    }
}
