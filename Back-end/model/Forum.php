<?php

namespace App\Model;

class Forum {
    public function __construct(
        public ?int $id = null,
        public int $usuario_id,
        public string $titulo,
        public string $conteudo,
        public string $categoria = 'geral',
        public ?string $data_criacao = null
    ) {}
}
