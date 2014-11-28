<?php

namespace srms\sof\controllers\api;


class PerksController extends ApiController
{
    const COLLECTION_NAME = 'perks';

    public function listAction()
    {
        $query = [];
        return $this->listItems(self::COLLECTION_NAME, true, $query);
    }
}
