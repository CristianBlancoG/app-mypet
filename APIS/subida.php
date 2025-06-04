<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
$targetDir = "imagenes/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

if ($_FILES['archivo']) {
    $filename = basename($_FILES["archivo"]["name"]);
    $targetFile = $targetDir . uniqid() . "_" . $filename;

    if (move_uploaded_file($_FILES["archivo"]["tmp_name"], $targetFile)) {
        echo json_encode(["success" => true, "nombreArchivo" => basename($targetFile)]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "No se pudo subir el archivo."]);
    }
}
?>
