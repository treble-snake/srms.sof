<?php
spl_autoload_register(function ($class) {
    $path = str_replace(['srms\\sof', '\\'], ['system', '/'], $class) . '.class.php';
    include_once $path;
});