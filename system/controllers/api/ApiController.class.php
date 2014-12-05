<?php

namespace srms\sof\controllers\api;


use srms\sof\controllers\DBController;

class ApiController
{

    protected $requestParams;

    function __construct($requestParams = [])
    {
        $this->requestParams = $requestParams;
    }

    protected function listItems($collection, $extractId = false, $query = [], $sort = [], $fields = [])
    {
        $cursor = DBController::db()->$collection->find($query, $fields);
        if (!empty($sort))
            $cursor = $cursor->sort($sort);

        return $this->cursorToJson($cursor, $extractId);
    }

    protected function extractMongoId($id)
    {
        return $id['$id'];
    }

    protected function createMongoId($id)
    {
        return new \MongoId($id['$id']);
    }

    protected function cursorToJson($cursor, $extractId)
    {
        return json_encode(iterator_to_array($cursor, $extractId));
    }

    protected function getParams(array $keys)
    {
        $result = [];

        if (empty($this->requestParams['data']))
            throw new \Exception("Data expected.");

        $params = json_decode($this->requestParams['data'], true);
        foreach ($keys as $key) {
            if (empty($params[$key]))
                throw new \Exception("Not enough data.");

            array_push($result, $params[$key]);
        }

        return $result;
    }
} 