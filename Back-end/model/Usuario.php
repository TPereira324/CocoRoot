<?php

namespace App\Model;

class Usuario {
    public function __construct(
        public ?int $id = null,
        public string $nome,
        public string $email,
        public ?string $senha = null,
        public ?string $foto_perfil = null,
        public string $nivel_experiencia = 'iniciante',
        public ?string $data_registo = null
    ) {}
}
