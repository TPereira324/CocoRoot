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

$email = $dados["email"] ?? $_POST["email"] ?? "";
$senha = $dados["password"] ?? $dados["senha"] ?? $_POST["senha"] ?? "";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método inválido."]);
    exit();
}

if (empty($email) || empty($senha)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email e senha são obrigatórios."]);
    exit();
}

$email_esc = $mysqli->real_escape_string($email);
$result = $mysqli->query("SELECT * FROM utilizador WHERE ut_email = '$email_esc'");

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($senha, $user["ut_password"])) {
        echo json_encode([
            "success" => true,
            "message" => "Login bem-sucedido!",
            "user" => [
                "id"    => $user["ut_id"],
                "nome"  => $user["ut_nome"],
                "email" => $user["ut_email"]
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Senha incorreta."]);
    }
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Utilizador não encontrado."]);
}
?>
