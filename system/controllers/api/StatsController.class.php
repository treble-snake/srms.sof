<?php

namespace srms\sof\controllers\api;


class StatsController extends ApiController
{
    const NEWS_COLLECTION_NAME = 'stats';

    public function listAction()
    {
        $query = [];
        return $this->listItems(self::NEWS_COLLECTION_NAME, true, $query);
    }
}
