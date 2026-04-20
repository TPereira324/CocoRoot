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

$email = $mysqli->real_escape_string($input["email"] ?? "");
$senha = $input["password"] ?? "";

if (empty($email) || empty($senha)) {
    echo json_encode(["success" => false, "message" => "Preencha todos os campos."]);
    exit();
}

$result = $mysqli->query("SELECT * FROM utilizador WHERE ut_email = '$email'");

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($senha, $user["ut_password"])) {
        $_SESSION["user_id"]    = $user["ut_id"];
        $_SESSION["user_nome"]  = $user["ut_nome"];
        $_SESSION["user_email"] = $user["ut_email"];
        echo json_encode([
            "success" => true,
            "user" => [
                "id"    => $user["ut_id"],
                "nome"  => $user["ut_nome"],
                "email" => $user["ut_email"]
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Palavra-passe incorreta."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Utilizador não encontrado."]);
}
?>
