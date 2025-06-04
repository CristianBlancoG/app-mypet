<?php
// Permitir respuestas preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    http_response_code(200);
    exit;
}
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
            // Verificar si se entregaron parámetros
            if (isset($_GET['rut']) && isset($_GET['contrasena'])) {
                $rut = $_GET['rut'];
                $contrasena = $_GET['contrasena'];

                $stmt = $conn->prepare("SELECT * FROM Persona WHERE rut = ? AND contrasena = ?");
                $stmt->bind_param("ss", $rut, $contrasena);
                $stmt->execute();
                $result = $stmt->get_result();
                $persona = $result->fetch_assoc();

                if ($persona) {
                    echo json_encode($persona);
                } else {
                    http_response_code(401); // Unauthorized
                    echo json_encode(["error" => "Credenciales inválidas"]);
                }

                $stmt->close();
            }
            break;



    case 'POST':
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['accion']) || $input['accion'] !== 'actualizar') {
        // Ejecutar INSERT
        $stmt = $conn->prepare("INSERT INTO Persona (rut, nombre, apellido, email, contrasena, tipo_persona, direccion) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssss",
            $input['rut'],
            $input['nombre'],
            $input['apellido'],
            $input['email'],
            $input['contrasena'],
            $input['tipo_persona'],
            $input['direccion']
        );

        if ($stmt->execute()) {
            echo json_encode(["message" => "Persona creada correctamente"]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => $stmt->error]);
        }

        $stmt->close();
    } else {
        // Ejecutar UPDATE
        if (!isset($input['rut'])) {
            http_response_code(400);
            echo json_encode(["error" => "RUT requerido para actualizar"]);
            exit;
        }

        $stmt = $conn->prepare("UPDATE Persona SET nombre = ?, apellido = ?, email = ?, contrasena = ?, direccion = ? WHERE rut = ?");
        $stmt->bind_param("ssssss",
            $input['nombre'],
            $input['apellido'],
            $input['email'],
            $input['contrasena'],
            $input['direccion'],
            $input['rut']
        );

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => $stmt->error]);
        }

        $stmt->close();
    }
    break;

}
?>
