<?php
// ── Cabeceras y errores ─────────────────────────
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'OPTIONS') {
        // Responder a preflight
        http_response_code(200);
        exit;
    }

    if ($method === 'GET') {
        if (isset($_GET['rut'])) {
            $rut = $_GET['rut'];
            $stmt = $conn->prepare("SELECT * FROM Mascota WHERE rut_duenio = ?");
            $stmt->bind_param("s", $rut);
        } elseif (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT * FROM Mascota WHERE id = ?");
            $stmt->bind_param("i", $id);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Se requiere el parámetro rut o id"]);
            exit;
        }

        $stmt->execute();
        $res = $stmt->get_result();
        $data = $res->fetch_all(MYSQLI_ASSOC);

        if (empty($data)) {
            http_response_code(404);
            echo json_encode(["error" => "No se encontraron mascotas"]);
        } else {

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);


        }
        exit;
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(["error" => "JSON mal formado", "detalle" => json_last_error_msg()]);
            exit;
        }

        $id = $input['id'] ?? null;

        // Actualización parcial solo de la foto
        if ($id !== null && isset($input['foto_mascota_url']) && count($input) === 2) {
            $stmt = $conn->prepare("UPDATE Mascota SET foto_mascota_url = ? WHERE id = ?");
            $stmt->bind_param("si", $input['foto_mascota_url'], $id);
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Foto de perfil actualizada", "id" => $id]);
            } else {
                throw new Exception($stmt->error);
            }
            exit;
        }

        // Verificar si todos los campos requeridos están presentes
        $required = ['rut_duenio','nombre','raza','peso','color','tipo_pelaje','edad','fecha_nacimiento','esta_muerta','foto_mascota_url'];
        foreach ($required as $field) {
            if (!isset($input[$field])) {
                http_response_code(400);
                echo json_encode(["error" => "Campo requerido faltante: $field"]);
                exit;
            }
        }

        if ($id !== null) {
            // UPDATE completo
            $check = $conn->prepare("SELECT id FROM Mascota WHERE id = ?");
            $check->bind_param("i", $id);
            $check->execute();
            $check->store_result();

            if ($check->num_rows > 0) {
                $stmt = $conn->prepare("UPDATE Mascota SET
                    rut_duenio=?, nombre=?, raza=?, peso=?, color=?, tipo_pelaje=?,
                    edad=?, fecha_nacimiento=?, esta_muerta=?, foto_mascota_url=?
                    WHERE id=?");
                $stmt->bind_param("ssssssisisi",
                    $input['rut_duenio'],
                    $input['nombre'],
                    $input['raza'],
                    $input['peso'],
                    $input['color'],
                    $input['tipo_pelaje'],
                    $input['edad'],
                    $input['fecha_nacimiento'],
                    $input['esta_muerta'],
                    $input['foto_mascota_url'],
                    $id
                );

                if ($stmt->execute()) {
                    echo json_encode(["success" => true, "message" => "Mascota actualizada", "id" => $id]);
                } else {
                    throw new Exception($stmt->error);
                }
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Mascota con id $id no encontrada"]);
            }
        } else {
            // INSERT sin id
            $stmt = $conn->prepare("INSERT INTO Mascota
                (rut_duenio,nombre,raza,peso,color,tipo_pelaje,edad,fecha_nacimiento,esta_muerta,foto_mascota_url)
                VALUES (?,?,?,?,?,?,?,?,?,?)");
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
                $newId = $stmt->insert_id;
                echo json_encode(["success" => true, "message" => "Mascota creada", "id" => $newId]);
            } else {
                throw new Exception($stmt->error);
            }
        }
        exit;
    }

    // Método no permitido
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error interno", "detalle" => $e->getMessage()]);
    exit;
}?>
