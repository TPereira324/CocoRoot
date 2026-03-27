<?php

namespace App\Dto;

readonly class SensorDto {
    /**
     * @param int|null $id
     * @param int $parcela_id
     * @param string $tipo_sensor
     * @param float $valor_atual
     * @param string $unidade_medida
     * @param string|null $ultima_leitura
     */
    public function __construct(
        public ?int $id,
        public int $parcela_id,
        public string $tipo_sensor,
        public float $valor_atual,
        public string $unidade_medida,
        public ?string $ultima_leitura
    ) {}

    public static function fromArray(array $dados): self {
        return new self(
            id: $dados['id'] ?? null,
            parcela_id: (int)($dados['parcela_id'] ?? 0),
            tipo_sensor: $dados['tipo_sensor'] ?? '',
            valor_atual: (float)($dados['valor_atual'] ?? 0.0),
            unidade_medida: $dados['unidade_medida'] ?? '',
            ultima_leitura: $dados['ultima_leitura'] ?? null
        );
    }
}
