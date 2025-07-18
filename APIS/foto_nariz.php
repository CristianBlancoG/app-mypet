<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['mascota_id'])) {
        $mascota_id = intval($_GET['mascota_id']);
        $stmt = $conn->prepare("SELECT * FROM FotoNariz WHERE mascota_id = ?");
        $stmt->bind_param("i", $mascota_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
    }else{
        http_response_code(400);
            echo json_encode(["error al obtener las fotos" => $stmt->error]);
    }
    break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        // Validar existencia de mascota
        $check = $conn->prepare("SELECT id FROM Mascota WHERE id = ?");
        $check->bind_param("i", $input['mascota_id']);
        $check->execute();
        $check->store_result();

        if ($check->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["error" => "El ID de la mascota no existe."]);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO FotoNariz (mascota_id, url) VALUES (?, ?)");
        $stmt->bind_param("is", $input['mascota_id'], $input['url']);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Foto de nariz guardada correctamente."]);
        } else {
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
