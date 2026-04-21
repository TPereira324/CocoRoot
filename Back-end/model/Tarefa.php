<?php

namespace App\Model;

class Tarefa {
    public function __construct(
        public ?int $id = null,
        public int $usuario_id,
        public ?int $parcela_id = null,
        public string $titulo,
        public string $descricao,
        public string $data_limite,
        public bool $concluida = false,
        public string $prioridade = 'media'
    ) {}
}
