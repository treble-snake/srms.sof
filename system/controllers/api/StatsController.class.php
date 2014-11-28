<?php

namespace srms\sof\controllers\api;


class StatsController extends ApiController
{
    const COLLECTION_NAME = 'stats';

    public function listAction()
    {
        $query = [];
        return $this->listItems(self::COLLECTION_NAME, true, $query);
    }
}
