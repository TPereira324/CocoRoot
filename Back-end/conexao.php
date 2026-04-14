<?php

$host = "localhost";
$bancodedados = "coco_db";
$user = "root";
$pass = "root";

$mysqli = new mysqli($host, $user, $pass, $bancodedados);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Falha ao conectar com o banco de dados."]);
    exit();
}


