<?php

namespace App\Model;

class Parcela {
    public function __construct(
        public ?int $id = null,
        public int $usuario_id,
        public string $nome,
        public string $tipo_cultura,
        public float $area_m2,
        public string $data_plantio,
        public string $status = 'ativo'
    ) {}
}
