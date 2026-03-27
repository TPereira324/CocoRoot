<?php

namespace App\Service;

use App\Dto\SensorDto;
use App\Model\Sensor;
use App\Repository\SensorRepository;
use Exception;

class SensorService {
    private SensorRepository $sensorRepository;

    public function __construct() {
        $this->sensorRepository = new SensorRepository();
    }

    /**
     * Regista uma nova leitura do sensor e verifica se deve gerar alertas
     */
    public function registarLeitura(SensorDto $sensorDto): SensorDto {
        $sensor = $this->sensorRepository->buscarPorId($sensorDto->id);
        
        if (!$sensor) {
            // Se for um novo sensor, criamos o registo
            $sensor = new Sensor(
                parcela_id: $sensorDto->parcela_id,
                tipo_sensor: $sensorDto->tipo_sensor,
                valor_atual: $sensorDto->valor_atual,
                unidade_medida: $sensorDto->unidade_medida
            );
        } else {
            // Atualizar leitura atual
            $sensor->valor_atual = $sensorDto->valor_atual;
        }

        if (!$this->sensorRepository->salvar($sensor)) {
            throw new Exception("Erro ao processar dados do sensor.");
        }

        // Lógica de Alerta: Se a humidade estiver abaixo de 30%, poderia disparar uma notificação
        if ($sensor->tipo_sensor === 'humidade' && $sensor->valor_atual < 30) {
            // TODO: Integrar com NotificationService
            // "Alerta: Humidade crítica na parcela #{$sensor->parcela_id}!"
        }

        return SensorDto::fromArray([
            'id' => $sensor->id,
            'parcela_id' => $sensor->parcela_id,
            'tipo_sensor' => $sensor->tipo_sensor,
            'valor_atual' => $sensor->valor_atual,
            'unidade_medida' => $sensor->unidade_medida,
            'ultima_leitura' => $sensor->ultima_leitura
        ]);
    }

    /**
     * Obtém os sensores de uma parcela específica
     */
    public function obterSensoresDaParcela(int $parcela_id): array {
        $sensores = $this->sensorRepository->listarPorParcela($parcela_id);
        
        return array_map(fn($s) => SensorDto::fromArray([
            'id' => $s->id,
            'parcela_id' => $s->parcela_id,
            'tipo_sensor' => $s->tipo_sensor,
            'valor_atual' => $s->valor_atual,
            'unidade_medida' => $s->unidade_medida,
            'ultima_leitura' => $s->ultima_leitura
        ]), $sensores);
    }
}
