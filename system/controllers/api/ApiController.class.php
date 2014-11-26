<?php

namespace srms\sof\controllers\api;


use srms\sof\controllers\DBController;

class ApiController {

    protected  $requestParams;

    function __construct($requestParams = [])
    {
        $this->requestParams = $requestParams;
    }

    function listItems($collection, $extractId = false, $query = [])
    {
        $cursor = DBController::db()->$collection->find($query);
        return json_encode(iterator_to_array($cursor, $extractId));
    }
} 