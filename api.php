<?php
require "system/config.php";

$app = new \srms\sof\controllers\AppController();

try {

    $result = $app->performAction();
    echo $result;

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}