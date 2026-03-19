<?php
header('Content-Type: application/json');
include("conexao.php");

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input = json_decode(file_get_contents('php://input'), true);

    $nome = $mysqli->real_escape_string($input['nome'] ?? $_POST['nome'] ?? '');
    $email = $mysqli->real_escape_string($input['email'] ?? $_POST['email'] ?? '');
    $senha_raw = $input['senha'] ?? $_POST['senha'] ?? '';
    $nome_fazenda = $mysqli->real_escape_string($input['nome_fazenda'] ?? $_POST['nome_fazenda'] ?? '');
    $agricultor_iniciante = isset($input['agricultor_iniciante']) ? (int) $input['agricultor_iniciante'] : (isset($_POST['agricultor_iniciante']) ? (int) $_POST['agricultor_iniciante'] : 0);

    if (empty($nome) || empty($email) || empty($senha_raw)) {
        $response['status'] = 'error';
        $response['message'] = 'Nome, e-mail e palavra-passe são obrigatórios.';
    } else {
        $senha = password_hash($senha_raw, PASSWORD_DEFAULT);
        $sql = "INSERT INTO utilizador (ut_nome, ut_email, ut_password, ut_nome_fazenda, ut_agricultor_iniciante) 
                VALUES ('$nome', '$email', '$senha', '$nome_fazenda', $agricultor_iniciante)";

        if ($mysqli->query($sql)) {
            $response['status'] = 'success';
            $response['message'] = 'Usuário cadastrado com sucesso!';
        } else {
            $response['status'] = 'error';
            $response['message'] = 'Erro ao cadastrar: ' . $mysqli->error;
        }
    }
} else {
    $response['status'] = 'error';
    $response['message'] = 'Método de requisição inválido. Use POST.';
}

echo json_encode($response);
