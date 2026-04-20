<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

include(__DIR__ . "/conexao.php");

$respond = function (array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit();
};

$method = strtoupper($_SERVER["REQUEST_METHOD"] ?? "GET");
$pathInfo = $_SERVER["PATH_INFO"] ?? "";
$path = trim($pathInfo, "/");

if ($path === "") {
    $respond([
        "success" => true,
        "message" => "API online",
    ]);
}

$segments = array_values(array_filter(explode("/", $path), fn($s) => $s !== ""));
$resource = $segments[0] ?? "";
$action = $segments[1] ?? "";
$id = $segments[2] ?? null;

$rawBody = file_get_contents("php://input");
$jsonBody = json_decode($rawBody ?: "", true);
$body = is_array($jsonBody) ? $jsonBody : [];
if (!empty($_POST)) {
    $body = array_merge($body, $_POST);
}

if ($resource === "parcelas" && $action === "listar" && $method === "GET") {
    $utId = $id !== null ? (int)$id : (int)($_GET["ut_id"] ?? 0);
    if ($utId <= 0) {
        $respond(["success" => false, "message" => "ut_id inválido."], 400);
    }

    $stmt = $mysqli->prepare(
        "SELECT 
            p.par_id,
            p.par_nome,
            p.par_area,
            p.par_estado,
            c.cult_id,
            c.cult_nome,
            pc.pc_metodo_cultivo,
            pc.pc_objetivo
        FROM parcela p
        LEFT JOIN parcela_cultivo pc ON pc.pc_par_id = p.par_id
        LEFT JOIN cultivo c ON c.cult_id = pc.pc_cult_id
        WHERE p.par_ut_id = ?
        ORDER BY p.par_id DESC"
    );
    if (!$stmt) {
        $respond(["success" => false, "message" => "Erro ao preparar query."], 500);
    }
    $stmt->bind_param("i", $utId);
    $stmt->execute();
    $result = $stmt->get_result();
    $rows = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    $stmt->close();

    $parcelasById = [];
    foreach ($rows as $r) {
        $parId = (int)$r["par_id"];
        if (!isset($parcelasById[$parId])) {
            $parcelasById[$parId] = [
                "id" => $parId,
                "nome" => $r["par_nome"],
                "area_m2" => isset($r["par_area"]) ? (float)$r["par_area"] : null,
                "estado" => $r["par_estado"],
                "cultivos" => [],
            ];
        }
        if (!empty($r["cult_id"])) {
            $parcelasById[$parId]["cultivos"][] = [
                "id" => (int)$r["cult_id"],
                "nome" => $r["cult_nome"],
                "metodo" => $r["pc_metodo_cultivo"],
                "objetivo" => $r["pc_objetivo"],
            ];
        }
    }

    $respond([
        "success" => true,
        "data" => array_values($parcelasById),
    ]);
}

if ($resource === "parcelas" && $action === "adicionar" && $method === "POST") {
    $utId = (int)($body["ut_id"] ?? $body["usuario_id"] ?? 0);
    if ($utId <= 0) {
        $respond(["success" => false, "message" => "ut_id obrigatório."], 401);
    }

    $parNome = trim((string)($body["par_nome"] ?? $body["nome"] ?? ""));
    $parEstado = trim((string)($body["par_estado"] ?? $body["estado"] ?? "ativo"));

    $largura = isset($body["largura"]) ? (float)$body["largura"] : null;
    $comprimento = isset($body["comprimento"]) ? (float)$body["comprimento"] : null;
    $parArea = isset($body["par_area"]) ? (float)$body["par_area"] : null;

    if ($parArea === null && $largura !== null && $comprimento !== null) {
        $parArea = $largura * $comprimento;
    }

    if ($parNome === "") {
        $parNome = "Parcela";
    }
    if ($parArea === null || $parArea <= 0) {
        $respond(["success" => false, "message" => "Área inválida."], 400);
    }

    $cultivoNome = trim((string)($body["cultivo"] ?? $body["tipo"] ?? $body["cult_nome"] ?? ""));
    $metodo = trim((string)($body["metodo"] ?? $body["pc_metodo_cultivo"] ?? ""));
    $objetivo = trim((string)($body["objetivo"] ?? $body["pc_objetivo"] ?? ""));

    try {
        $mysqli->begin_transaction();

        $stmtPar = $mysqli->prepare("INSERT INTO parcela (par_nome, par_area, par_estado, par_ut_id) VALUES (?, ?, ?, ?)");
        if (!$stmtPar) {
            throw new Exception("Erro ao preparar INSERT parcela.");
        }
        $stmtPar->bind_param("sdsi", $parNome, $parArea, $parEstado, $utId);
        if (!$stmtPar->execute()) {
            throw new Exception("Erro ao inserir parcela.");
        }
        $parId = (int)$mysqli->insert_id;
        $stmtPar->close();

        $cultId = null;
        if ($cultivoNome !== "") {
            $stmtCultSel = $mysqli->prepare("SELECT cult_id FROM cultivo WHERE cult_nome = ? LIMIT 1");
            if (!$stmtCultSel) {
                throw new Exception("Erro ao preparar SELECT cultivo.");
            }
            $stmtCultSel->bind_param("s", $cultivoNome);
            $stmtCultSel->execute();
            $resCult = $stmtCultSel->get_result();
            $rowCult = $resCult ? $resCult->fetch_assoc() : null;
            $stmtCultSel->close();

            if ($rowCult && isset($rowCult["cult_id"])) {
                $cultId = (int)$rowCult["cult_id"];
            } else {
                $stmtCultIns = $mysqli->prepare("INSERT INTO cultivo (cult_nome, cult_descricao) VALUES (?, ?)");
                if (!$stmtCultIns) {
                    throw new Exception("Erro ao preparar INSERT cultivo.");
                }
                $cultDesc = "";
                $stmtCultIns->bind_param("ss", $cultivoNome, $cultDesc);
                if (!$stmtCultIns->execute()) {
                    throw new Exception("Erro ao inserir cultivo.");
                }
                $cultId = (int)$mysqli->insert_id;
                $stmtCultIns->close();
            }
        }

        if ($cultId !== null) {
            $stmtPC = $mysqli->prepare("INSERT INTO parcela_cultivo (pc_par_id, pc_cult_id, pc_metodo_cultivo, pc_objetivo) VALUES (?, ?, ?, ?)");
            if (!$stmtPC) {
                throw new Exception("Erro ao preparar INSERT parcela_cultivo.");
            }
            $stmtPC->bind_param("iiss", $parId, $cultId, $metodo, $objetivo);
            if (!$stmtPC->execute()) {
                throw new Exception("Erro ao inserir parcela_cultivo.");
            }
            $stmtPC->close();
        }

        $mysqli->commit();

        $respond([
            "success" => true,
            "message" => "Parcela criada com sucesso!",
            "data" => [
                "par_id" => $parId,
                "cult_id" => $cultId,
            ],
        ], 201);
    } catch (Exception $e) {
        $mysqli->rollback();
        $respond(["success" => false, "message" => $e->getMessage()], 500);
    }
}

$respond(["success" => false, "message" => "Endpoint não encontrado."], 404);
