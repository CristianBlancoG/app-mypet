<?php
$hostname = "ecofloat.space";
$username = "remoto";
$password = "123m0mia";
$database = "portafolio_db";

$conn = new mysqli($hostname, $username, $password, $database);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

header("Content-Type: application/json");
?>
