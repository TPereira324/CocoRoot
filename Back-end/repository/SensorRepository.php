<?php

namespace App\Repository;

use App\Config\Conexao;
use App\Model\Sensor;
use PDO;

class SensorRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Conexao::getConexao();
    }

    public function buscarPorId(int $id): ?Sensor {
        $stmt = $this->db->prepare("SELECT * FROM sensores WHERE id = ?");
        $stmt->execute([$id]);
        $dados = $stmt->fetch();

        if (!$dados) return null;

        return new Sensor(
            id: (int)$dados['id'],
            parcela_id: (int)$dados['parcela_id'],
            tipo_sensor: $dados['tipo_sensor'],
            valor_atual: (float)$dados['valor_atual'],
            unidade_medida: $dados['unidade_medida'],
            ultima_leitura: $dados['ultima_leitura']
        );
    }

    public function listarPorParcela(int $parcela_id): array {
        $stmt = $this->db->prepare("SELECT * FROM sensores WHERE parcela_id = ?");
        $stmt->execute([$parcela_id]);
        $resultados = $stmt->fetchAll();

        $sensores = [];
        foreach ($resultados as $dados) {
            $sensores[] = new Sensor(
                id: (int)$dados['id'],
                parcela_id: (int)$dados['parcela_id'],
                tipo_sensor: $dados['tipo_sensor'],
                valor_atual: (float)$dados['valor_atual'],
                unidade_medida: $dados['unidade_medida'],
                ultima_leitura: $dados['ultima_leitura']
            );
        }
        return $sensores;
    }

    public function salvar(Sensor $sensor): bool {
        if ($sensor->id) {
            $stmt = $this->db->prepare("UPDATE sensores SET valor_atual = ?, ultima_leitura = CURRENT_TIMESTAMP WHERE id = ?");
            return $stmt->execute([
                $sensor->valor_atual,
                $sensor->id
            ]);
        } else {
            $stmt = $this->db->prepare("INSERT INTO sensores (parcela_id, tipo_sensor, valor_atual, unidade_medida) VALUES (?, ?, ?, ?)");
            $sucesso = $stmt->execute([
                $sensor->parcela_id,
                $sensor->tipo_sensor,
                $sensor->valor_atual,
                $sensor->unidade_medida
            ]);
            if ($sucesso) {
                $sensor->id = (int)$this->db->lastInsertId();
            }
            return $sucesso;
        }
    }
}
