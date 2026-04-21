<?php

namespace App\Dto;

readonly class UsuarioDto {
    public function __construct(
        public ?int $id,
        public string $nome,
        public string $email,
        public ?string $foto_perfil,
        public string $nivel_experiencia,
        public ?string $data_registo
    ) {}

    public static function fromArray(array $dados): self {
        return new self(
            id: $dados['id'] ?? null,
            nome: $dados['nome'] ?? '',
            email: $dados['email'] ?? '',
            foto_perfil: $dados['foto_perfil'] ?? null,
            nivel_experiencia: $dados['nivel_experiencia'] ?? 'iniciante',
            data_registo: $dados['data_registo'] ?? null
        );
    }
}
