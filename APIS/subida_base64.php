<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Obtener los datos enviados como formulario (FormData)
if (!isset($_POST['archivo']) || !isset($_POST['nombre'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan parámetros"]);
    exit;
}

$base64 = $_POST['archivo'];
$nombre = $_POST['nombre'];

// Quitar encabezado "data:image/jpeg;base64," si existe
if (strpos($base64, 'base64,') !== false) {
    $base64 = explode('base64,', $base64)[1];
}

$imagen = base64_decode($base64);

if ($imagen === false) {
    http_response_code(400);
    echo json_encode(["error" => "Base64 inválido"]);
    exit;
}

// Ruta destino
$ruta = __DIR__ . "/imagenes/" . $nombre;

if (file_put_contents($ruta, $imagen)) {
    echo json_encode(["nombreArchivo" => $nombre]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar imagen"]);
}
