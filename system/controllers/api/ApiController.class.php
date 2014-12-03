<?php

namespace srms\sof\controllers\api;


use srms\sof\controllers\DBController;

class ApiController {

    protected  $requestParams;

    function __construct($requestParams = [])
    {
        $this->requestParams = $requestParams;
    }

    protected function listItems($collection, $extractId = false, $query = [], $sort = [], $fields = [])
    {
        $cursor = DBController::db()->$collection->find($query, $fields);
        if(!empty($sort))
            $cursor = $cursor->sort($sort);

        return $this->cursorToJson($cursor, $extractId);
    }

    protected function cursorToJson($cursor, $extractId)
    {
        return json_encode(iterator_to_array($cursor, $extractId));
    }
} 