## Relatório do Backend 

Este ficheiro explica, de forma simples, porque é que o backend está estruturado assim e como funciona todas as camadas.

### Visão geral

- O backend foi feito de forma simples para ser fácil de entender e testar. Não é Laravel nem nenhum framework grande — é PHP simples.
- A estrutura segue uma separação por camadas: Controllers → Services → Repositories → Models/DTOs.

### Estrutura e onde está no código

- Ponto de entrada: `Back-end/api.php` — é aqui que as rotas e os métodos HTTP são verificados.
- Autoload simples com `spl_autoload_register` usando o prefixo `App\`.
- Existe um mapa de rotas em `api.php` que liga cada recurso a um controller e método.

### Fluxo de uma chamada 

1. O frontend faz uma chamada para `api.php/usuarios/login` (POST).
2. `api.php` verifica a rota e o método HTTP.
3. Instancia-se o `UsuarioController` e chama-se `login()`.
4. O controller chama o `UsuarioService` que usa o `UsuarioRepository` para falar com a base de dados.
5. O resultado é devolvido em JSON.

### Porque escolhemos esta forma

- Mais rápido para desenvolver num projeto académico.
- Fácil de explicar nas apresentações e relatórios.
- Permite ver claramente onde cada responsabilidade está (bom para aprender).

### Coisas a melhorar 

- Usar `composer` e PSR-4 em vez do `spl_autoload_register`.
- Mudar autenticação baseada em sessão para tokens (JWT) se quisermos suportar apps móveis.
- Centralizar validação (agora está dividida entre controllers e services).
- Gerar documentação automática (OpenAPI/Swagger) para facilitar testes.

### Observações práticas

- CORS e cabeçalhos já estão em `api.php`, permitindo comunicação com o frontend.
- Upload de ficheiros tem um serviço próprio: `Back-end/service/FileUploadService.php`. Validar extensão e tamanho antes de aceitar.
- As respostas usam um formato simples: JSON com `success` e `message` (e `data` quando necessário).




### API do tempo e ligação com o Front-end

- Endpoint: `api.php/clima` (GET) ou `api.php?route=clima`. Aceita o parâmetro query `cidade` (ex.: `?cidade=Lisboa`).
- Controller: `App\Controller\PrevisaoTempoController::consultar()` — chama `PrevisaoTempoService`.
- Service: `App\Service\PrevisaoTempoService` usa a API do OpenWeather (`https://api.openweathermap.org/data/2.5/weather`) com uma chave inserida no código.





