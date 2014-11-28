<?php
require "system/config.php";


try {
    $app = \srms\sof\controllers\AppController::get();

    $result = $app->performAction();
    echo $result;

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}