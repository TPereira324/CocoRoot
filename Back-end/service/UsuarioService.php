<?php

namespace App\Service;

use App\Repository\UsuarioRepository;
use Exception;

class UsuarioService {
    private UsuarioRepository $usuarioRepository;

    public function __construct() {
        $this->usuarioRepository = new UsuarioRepository();
    }

    public function registar(string $nome, string $email, string $senha, string $nomeFazenda = ''): array {
        if ($this->usuarioRepository->buscarPorEmail($email)) {
            throw new Exception("Este email já está registado.");
        }

        if (trim($nome) === '' || trim($email) === '' || trim($senha) === '') {
            throw new Exception("Preenche todos os campos obrigatórios.");
        }

        return $this->usuarioRepository->criar(
            trim($nome),
            trim($email),
            password_hash($senha, PASSWORD_DEFAULT),
            trim($nomeFazenda)
        );
    }

    public function login(string $email, string $senha): array {
        $usuario = $this->usuarioRepository->buscarPorEmail(trim($email), true);

        if (!$usuario || !password_verify($senha, (string)($usuario['senha'] ?? ''))) {
            if (!$usuario) {
                throw new Exception("Utilizador não encontrado.");
            }
            throw new Exception("Palavra-passe incorreta.");
        }

        unset($usuario['senha']);
        return $usuario;
    }

    public function pesquisar(string $termo): array {
        return $this->usuarioRepository->pesquisarPorTermo($termo);
    }

    public function obterPerfil(int $id): array {
        $usuario = $this->usuarioRepository->buscarPorId($id);

        if (!$usuario) {
            throw new Exception("Utilizador não encontrado.");
        }

        return $usuario;
    }

    public function atualizar(int $id, array $dados): array {
        $nome = trim($dados['nome'] ?? $dados['ut_nome'] ?? '');
        $email = trim($dados['email'] ?? $dados['ut_email'] ?? '');

        if ($nome === '') throw new Exception('O nome é obrigatório.');
        if ($email === '') throw new Exception('O email é obrigatório.');

        $existing = $this->usuarioRepository->buscarPorEmail($email);
        if ($existing && (int)$existing['id'] !== $id) {
            throw new Exception('Este email já está em uso por outra conta.');
        }

        return $this->usuarioRepository->atualizar($id, $nome, $email);
    }

    public function alterarPassword(int $id, string $senhaAtual, string $senhaNova): void {
        if ($senhaNova === '') throw new Exception('A nova password é obrigatória.');
        if (strlen($senhaNova) < 6) throw new Exception('A nova password deve ter pelo menos 6 caracteres.');

        $usuario = $this->usuarioRepository->buscarPorIdComSenha($id);
        if (!$usuario) throw new Exception('Utilizador não encontrado.');

        if (!password_verify($senhaAtual, (string)($usuario['senha'] ?? ''))) {
            throw new Exception('A password atual está incorreta.');
        }

        $this->usuarioRepository->atualizarSenha($id, password_hash($senhaNova, PASSWORD_DEFAULT));
    }
}
