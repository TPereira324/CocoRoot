<?php

namespace App\Model;

class Sensor {
    /**
     * @param int|null $id
     * @param int $parcela_id
     * @param string $tipo_sensor (humidade, temperatura, fluxo_agua)
     * @param float $valor_atual
     * @param string $unidade_medida (%, °C, L/min)
     * @param string|null $ultima_leitura
     */
    public function __construct(
        public ?int $id = null,
        public int $parcela_id,
        public string $tipo_sensor,
        public float $valor_atual,
        public string $unidade_medida,
        public ?string $ultima_leitura = null
    ) {}
}
