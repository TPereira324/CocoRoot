<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . "/conexao.php");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Método inválido."]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    $input = [];
}
if (!empty($_POST)) {
    $input = array_merge($_POST, $input);
}

$nome    = $mysqli->real_escape_string($input["fullname"] ?? $input["nome"] ?? "");
$email   = $mysqli->real_escape_string($input["email"] ?? "");
$senha   = $input["password"] ?? $input["senha"] ?? "";
$fazenda = $mysqli->real_escape_string($input["farm_name"] ?? "");

if (empty($nome) || empty($email) || empty($senha)) {
    echo json_encode(["success" => false, "message" => "Preenche todos os campos obrigatórios."]);
    exit();
}

$check = $mysqli->query("SELECT ut_id FROM utilizador WHERE ut_email = '$email'");
if ($check && $check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Este email já está registado."]);
    exit();
}

$senha_hash = password_hash($senha, PASSWORD_DEFAULT);

$sql = "INSERT INTO utilizador (ut_nome, ut_email, ut_password, ut_nome_fazenda)
        VALUES ('$nome', '$email', '$senha_hash', '$fazenda')";

if ($mysqli->query($sql)) {
    echo json_encode(["success" => true, "message" => "Conta criada com sucesso!"]);
} else {
    echo json_encode(["success" => false, "message" => "Erro no servidor. Tenta novamente."]);
}
?>
