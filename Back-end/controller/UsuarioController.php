<?php

namespace App\Controller;

use App\Service\UsuarioService;
use Exception;

class UsuarioController extends Controller {
    private UsuarioService $usuarioService;

    public function __construct() {
        $this->usuarioService = new UsuarioService();
    }

    public function registar(): void {
        try {
            $dados = $_POST;
            $usuarioDto = $this->usuarioService->registar(
                $dados['nome'] ?? '',
                $dados['email'] ?? '',
                $dados['senha'] ?? ''
            );

            $this->json([
                'status' => 'sucesso',
                'mensagem' => 'Conta criada com sucesso!',
                'dados' => $usuarioDto
            ], 201);
        } catch (Exception $e) {
            $this->erro($e->getMessage());
        }
    }

    public function login(): void {
        try {
            $dados = $_POST;
            $usuarioDto = $this->usuarioService->login(
                $dados['email'] ?? '',
                $dados['senha'] ?? ''
            );

            $this->json([
                'status' => 'sucesso',
                'mensagem' => 'Login realizado!',
                'dados' => $usuarioDto
            ]);
        } catch (Exception $e) {
            $this->erro($e->getMessage(), 401);
        }
    }

    public function perfil(int $id): void {
        try {
            $usuarioDto = $this->usuarioService->obterPerfil($id);
            $this->json([
                'status' => 'sucesso',
                'dados' => $usuarioDto
            ]);
        } catch (Exception $e) {
            $this->erro($e->getMessage(), 404);
        }
    }
}
