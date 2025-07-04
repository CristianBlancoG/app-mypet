<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require 'db.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    // ----------------------- MÉTODO GET -----------------------
    case 'GET':
    if (isset($_GET['rut'])) {
        $rut = $_GET['rut'];
        
        $stmt = $conn->prepare("SELECT * FROM Mascota WHERE rut_duenio = ?");
        $stmt->bind_param("s", $rut);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];
        
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        if (!empty($data)) {
            echo json_encode($data);
        } else {
            http_response_code(404); // Not Found
            echo json_encode(["error" => "No se encontraron mascotas para este RUT"]);
        }
        
        $stmt->close();
    } else {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Se requiere el parámetro RUT"]);
    }
    break;

    // ----------------------- MÉTODO POST -----------------------
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            http_response_code(400);
            echo json_encode(["error" => "Cuerpo JSON inválido"]);
            exit;
        }

        if (isset($input['id'])) {
            // ----------- ACTUALIZAR MASCOTA EXISTENTE -----------
            $stmt = $conn->prepare("UPDATE Mascota SET 
                nombre = ?, raza = ?, peso = ?, color = ?, tipo_pelaje = ?, 
                edad = ?, fecha_nacimiento = ?, esta_muerta = ?, foto_mascota_url = ?
                WHERE id = ?");

            $stmt->bind_param("sssssisisi",
                $input['nombre'],
                $input['raza'],
                $input['peso'],
                $input['color'],
                $input['tipo_pelaje'],
                $input['edad'],
                $input['fecha_nacimiento'],
                $input['esta_muerta'],
                $input['foto_mascota_url'],
                $input['id']
            );

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Mascota actualizada"]);
            } else {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => $stmt->error]);
            }
            $stmt->close();

        } else {
            // ----------- CREAR NUEVA MASCOTA -----------
            $campos_obligatorios = ['rut_duenio', 'nombre', 'raza', 'peso', 'color', 'tipo_pelaje', 'edad', 'fecha_nacimiento', 'esta_muerta', 'foto_mascota_url'];
            foreach ($campos_obligatorios as $campo) {
                if (!isset($input[$campo])) {
                    http_response_code(400);
                    echo json_encode(["error" => "Falta el campo: $campo"]);
                    exit;
                }
            }

            // Verificar existencia de rut_duenio
            $check = $conn->prepare("SELECT rut FROM Persona WHERE rut = ?");
            $check->bind_param("s", $input['rut_duenio']);
            $check->execute();
            $check->store_result();

            if ($check->num_rows === 0) {
                http_response_code(400);
                echo json_encode(["error" => "El rut_duenio no existe"]);
                exit;
            }

            $stmt = $conn->prepare("INSERT INTO Mascota 
                (rut_duenio, nombre, raza, peso, color, tipo_pelaje, edad, fecha_nacimiento, esta_muerta, foto_mascota_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $stmt->bind_param("ssssssisss",
                $input['rut_duenio'],
                $input['nombre'],
                $input['raza'],
                $input['peso'],
                $input['color'],
                $input['tipo_pelaje'],
                $input['edad'],
                $input['fecha_nacimiento'],
                $input['esta_muerta'],
                $input['foto_mascota_url']
            );

            if ($stmt->execute()) {
                echo json_encode(["message" => "Mascota creada correctamente"]);
            } else {
                http_response_code(400);
                echo json_encode(["error" => $stmt->error]);
            }

            $stmt->close();
        }
        break;
}
?>
