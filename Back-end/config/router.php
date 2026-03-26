<?php

namespace App\Config;

class Router {
    private array $rotas = [];

    /**
     * Adiciona uma rota GET
     */
    public function get(string $path, callable|array $handler): void {
        $this->rotas['GET'][$this->normalizarPath($path)] = $handler;
    }

    /**
     * Adiciona uma rota POST
     */
    public function post(string $path, callable|array $handler): void {
        $this->rotas['POST'][$this->normalizarPath($path)] = $handler;
    }

    /**
     * Executa a rota correspondente
     */
    public function disparar(): void {
        $metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $path = $this->normalizarPath(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));

        // Tentar encontrar uma rota exata ou com parâmetro ID no final
        $handler = $this->encontrarHandler($metodo, $path);

        if ($handler) {
            $this->executarHandler($handler, $path);
        } else {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'erro', 
                'mensagem' => "Rota não encontrada: [$metodo] $path",
                'ajuda' => 'Verifique se o URL está correto ou se a rota foi definida no index.php'
            ]);
        }
    }

    private function normalizarPath(?string $path): string {
        if (!$path) return '/';
        
        // Remove o caminho base do script (ajuda a funcionar em subpastas automaticamente)
        $basePath = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
        if ($basePath !== '/') {
            $path = str_replace($basePath, '', $path);
        }
        
        return '/' . trim($path, '/');
    }

    private function encontrarHandler(string $metodo, string $path): mixed {
        // Verificar se existem rotas para este método
        if (!isset($this->rotas[$metodo])) {
            return null;
        }

        // Rota exata
        if (isset($this->rotas[$metodo][$path])) {
            return $this->rotas[$metodo][$path];
        }

        // Tentar rotas com parâmetro numérico no final (ex: /usuario/perfil/1)
        foreach ($this->rotas[$metodo] as $rotaDefinida => $handler) {
            $regex = preg_replace('/\{id\}/', '(\d+)', str_replace('/', '\/', $rotaDefinida));
            if (preg_match('/^' . $regex . '$/', $path, $matches)) {
                return ['handler' => $handler, 'matches' => $matches];
            }
        }

        return null;
    }

    private function executarHandler(mixed $handler, string $path): void {
        $params = [];
        if (is_array($handler) && isset($handler['handler'])) {
            $params = array_slice($handler['matches'], 1);
            $handler = $handler['handler'];
        }

        if (is_callable($handler)) {
            call_user_func_array($handler, $params);
        } elseif (is_array($handler)) {
            [$classe, $metodo] = $handler;
            $instancia = new $classe();
            call_user_func_array([$instancia, $metodo], $params);
        }
    }
}
