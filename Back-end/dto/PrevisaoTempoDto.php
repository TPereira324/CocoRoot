<?php

namespace App\Dto;

readonly class PrevisaoTempoDto {
    public function __construct(
        public string $cidade,
        public float $temperatura,
        public int $humidade,
        public string $descricao,
        public float $sensacao_termica,
        public float $temp_min,
        public float $temp_max,
        public string $icon
    ) {}

    public static function fromApiResponse(array $dados): self {
        return new self(
            cidade: $dados['name'] ?? 'Desconhecida',
            temperatura: (float)($dados['main']['temp'] ?? 0),
            humidade: (int)($dados['main']['humidity'] ?? 0),
            descricao: $dados['weather'][0]['description'] ?? 'Sem descrição',
            sensacao_termica: (float)($dados['main']['feels_like'] ?? 0),
            temp_min: (float)($dados['main']['temp_min'] ?? 0),
            temp_max: (float)($dados['main']['temp_max'] ?? 0),
            icon: $dados['weather'][0]['icon'] ?? '01d'
        );
    }
}
