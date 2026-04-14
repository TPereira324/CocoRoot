<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

include("conexao.php");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: /Front-end/pages/registo.php?erro=metodo_invalido");
    exit();
}

$nome    = $mysqli->real_escape_string($_POST["fullname"] ?? $_POST["nome"] ?? "");
$email   = $mysqli->real_escape_string($_POST["email"] ?? "");
$senha   = $_POST["password"] ?? $_POST["senha"] ?? "";
$fazenda = $mysqli->real_escape_string($_POST["farm_name"] ?? "");

if (empty($nome) || empty($email) || empty($senha)) {
    header("Location: /Front-end/pages/registo.php?erro=campos_obrigatorios");
    exit();
}

// Verificar se email já existe
$check = $mysqli->query("SELECT ut_id FROM utilizador WHERE ut_email = '$email'");
if ($check && $check->num_rows > 0) {
    header("Location: /Front-end/pages/registo.php?erro=email_existe");
    exit();
}

$senha_hash = password_hash($senha, PASSWORD_DEFAULT);

$sql = "INSERT INTO utilizador (ut_nome, ut_email, ut_password, ut_nome_fazenda)
        VALUES ('$nome', '$email', '$senha_hash', '$fazenda')";

if ($mysqli->query($sql)) {
    header("Location: /Front-end/pages/login.php?sucesso=conta_criada");
    exit();
} else {
    header("Location: /Front-end/pages/registo.php?erro=erro_servidor");
    exit();
}
?>
