<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

include("conexao.php");

$dados = json_decode(file_get_contents("php://input"), true);

// Suporte a JSON e form POST
$nome  = $dados["fullname"]  ?? $dados["nome"]  ?? $_POST["nome"]  ?? "";
$email = $dados["email"]     ?? $_POST["email"]  ?? "";
$senha = $dados["password"]  ?? $dados["senha"]  ?? $_POST["senha"] ?? "";
$fazenda = $dados["farm_name"] ?? $dados["fazenda"] ?? $_POST["fazenda"] ?? "";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método inválido."]);
    exit();
}

if (empty($nome) || empty($email) || empty($senha)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Nome, email e senha são obrigatórios."]);
    exit();
}

$nome_esc  = $mysqli->real_escape_string($nome);
$email_esc = $mysqli->real_escape_string($email);
$fazenda_esc = $mysqli->real_escape_string($fazenda);
$senha_hash = password_hash($senha, PASSWORD_DEFAULT);

// Verificar se email já existe
$check = $mysqli->query("SELECT ut_id FROM utilizador WHERE ut_email = '$email_esc'");
if ($check && $check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["success" => false, "message" => "Este email já está registado."]);
    exit();
}

$sql = "INSERT INTO utilizador (ut_nome, ut_email, ut_password, ut_nome_fazenda)
        VALUES ('$nome_esc', '$email_esc', '$senha_hash', '$fazenda_esc')";

if ($mysqli->query($sql)) {
    echo json_encode(["success" => true, "message" => "Conta criada com sucesso!"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro ao criar conta."]);
}
?>
