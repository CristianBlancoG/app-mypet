<?php
// Permitir respuestas preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    http_response_code(200);
    exit;
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // ✅ Obtener historial solo para un mascota_id
        if (isset($_GET['mascota_id'])) {
            $mascota_id = intval($_GET['mascota_id']);

            $stmt = $conn->prepare("SELECT * FROM HistorialVacunacion WHERE mascota_id = ?");
            $stmt->bind_param("i", $mascota_id);
            $stmt->execute();
            $result = $stmt->get_result();

            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            echo json_encode($data);
            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Se requiere el parámetro 'mascota_id'."]);
        }
        break;

    case 'POST':
        // ✅ Crear nuevo registro de vacuna
        $input = json_decode(file_get_contents('php://input'), true);

        if (
            !isset($input['mascota_id']) ||
            !isset($input['tipo_vacuna']) ||
            !isset($input['fecha_aplicacion'])
        ) {
            http_response_code(400);
            echo json_encode(["error" => "Faltan campos obligatorios."]);
            exit;
        }

        // Validar que la mascota exista
        $check = $conn->prepare("SELECT id FROM Mascota WHERE id = ?");
        $check->bind_param("i", $input['mascota_id']);
        $check->execute();
        $check->store_result();

        if ($check->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["error" => "El ID de la mascota no existe."]);
            exit;
        }

        // Insertar vacuna
        $stmt = $conn->prepare("
            INSERT INTO HistorialVacunacion (mascota_id, tipo_vacuna, fecha_aplicacion, fecha_renovacion)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->bind_param(
            "isss",
            $input['mascota_id'],
            $input['tipo_vacuna'],
            $input['fecha_aplicacion'],
            $input['fecha_renovacion']
        );

        if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Historial de vacunación registrado correctamente."
    ]);
}
 else {
            http_response_code(400);
            echo json_encode(["error" => $stmt->error]);
        }

        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
?>
