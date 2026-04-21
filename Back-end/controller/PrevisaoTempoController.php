<?php

namespace App\Controller;

use App\Service\PrevisaoTempoService;
use Exception;

class PrevisaoTempoController extends Controller {
    private PrevisaoTempoService $previsaoTempoService;

    public function __construct() {
        $this->previsaoTempoService = new PrevisaoTempoService();
    }

    public function consultar(): void {
        try {
            
            $cidade = $_GET['cidade'] ?? 'Lisboa';

            
            $climaDto = $this->previsaoTempoService->consultarClima($cidade);

           
            $this->json([
                'status' => 'sucesso',
                'mensagem' => "Meteorologia para {$cidade} obtida com sucesso!",
                'dados' => $climaDto
            ]);

        } catch (Exception $e) {
            
            $this->erro($e->getMessage(), 400);
        }
    }
}
