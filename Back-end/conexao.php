<?php

$host = getenv("MYSQL_HOST") ?: "127.0.0.1";
$bancodedados = "coco_db";
$user = "root";
$pass = "root";

$ports = [];
$envPort = getenv("MYSQL_PORT");
if ($envPort !== false && $envPort !== "") {
    $ports[] = (int)$envPort;
}
$ports[] = 3306;
$ports[] = 8889;
$ports = array_values(array_unique(array_filter($ports, fn($p) => is_int($p) && $p > 0)));

$mysqli = null;
foreach ($ports as $port) {
    $candidate = new mysqli($host, $user, $pass, $bancodedados, $port);
    if (!$candidate->connect_errno) {
        $mysqli = $candidate;
        break;
    }
}

if (!$mysqli) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Falha ao conectar com o banco de dados."]);
    exit();
}
