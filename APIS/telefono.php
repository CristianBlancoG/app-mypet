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
        if (isset($_GET['rut'])) {
            $rut = $_GET['rut'];
            $stmt = $conn->prepare("SELECT id, numero FROM Telefono WHERE rut_persona = ?");
            $stmt->bind_param("s", $rut);
            $stmt->execute();
            $result = $stmt->get_result();
            $telefono = $result->fetch_assoc();

            if ($telefono) {
                echo json_encode($telefono);
            } else {
                http_response_code(404); // Not Found
                echo json_encode(["error" => "No se encontró teléfono para este usuario"]);
            }

            $stmt->close();
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        // Validar existencia de persona
        $check = $conn->prepare("SELECT rut FROM Persona WHERE rut = ?");
        $check->bind_param("s", $input['rut_persona']);
        $check->execute();
        $check->store_result();

        if ($check->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["error" => "El RUT de la persona no existe."]);
            exit;
        }

        $check->close();

        // Si la acción es actualizar
        if (isset($input['accion']) && $input['accion'] === 'actualizar') {
            $stmt = $conn->prepare("UPDATE Telefono SET numero = ? WHERE rut_persona = ?");
            $stmt->bind_param("ss", $input['numero'], $input['rut_persona']);

            if ($stmt->execute()) {
                echo json_encode(["message" => "Teléfono actualizado correctamente."]);
            } else {
                http_response_code(400);
                echo json_encode(["error" => $stmt->error]);
            }

            $stmt->close();
        } else {
            // Si no es actualizar, se hace INSERT
            $stmt = $conn->prepare("INSERT INTO Telefono (rut_persona, numero) VALUES (?, ?)");
            $stmt->bind_param("ss", $input['rut_persona'], $input['numero']);

            if ($stmt->execute()) {
                echo json_encode(["message" => "Teléfono guardado correctamente."]);
            } else {
                http_response_code(400);
                echo json_encode(["error" => $stmt->error]);
            }

            $stmt->close();
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
?>
