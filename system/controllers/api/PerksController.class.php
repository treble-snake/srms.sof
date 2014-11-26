<?php

namespace srms\sof\controllers\api;


class PerksController extends ApiController
{
    const NEWS_COLLECTION_NAME = 'perks';

    public function listAction()
    {
        $query = [];
        return $this->listItems(self::NEWS_COLLECTION_NAME, true, $query);
    }
}
